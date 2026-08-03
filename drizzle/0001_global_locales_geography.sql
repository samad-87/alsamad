create table if not exists locales (
  id uuid primary key,
  code varchar(16) not null,
  language_tag varchar(35) not null,
  language_code varchar(8) not null,
  script_code varchar(4),
  region_code varchar(3),
  direction varchar(3) not null,
  display_name varchar(100) not null,
  native_name varchar(100) not null,
  fallback_locale_id uuid,
  is_enabled boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  constraint uq_locales__code unique (code),
  constraint uq_locales__language_tag unique (language_tag),
  constraint ck_locales__direction check (direction in ('rtl', 'ltr')),
  constraint ck_locales__sort_order check (sort_order >= 0),
  constraint ck_locales__fallback_not_self check (fallback_locale_id is null or fallback_locale_id <> id),
  constraint ck_locales__code_lowercase check (code = lower(code)),
  constraint ck_locales__language_code_lowercase check (language_code = lower(language_code)),
  constraint ck_locales__script_code check (script_code is null or script_code ~ '^[A-Z][a-z]{3}$'),
  constraint ck_locales__region_code check (region_code is null or region_code ~ '^([A-Z]{2}|[0-9]{3})$'),
  constraint fk_locales__fallback_locale_id foreign key (fallback_locale_id) references locales(id) on delete restrict
);

create index if not exists ix_locales__enabled_sort_order on locales (is_enabled, sort_order);
create index if not exists ix_locales__fallback_locale_id on locales (fallback_locale_id);

create or replace function enforce_locale_identity_immutability()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
    or new.code is distinct from old.code
    or new.language_tag is distinct from old.language_tag then
    raise exception 'locale canonical identity is immutable outside an administrative migration' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists tr_locales__identity_immutable on locales;
create trigger tr_locales__identity_immutable
before update of id, code, language_tag on locales
for each row execute function enforce_locale_identity_immutability();

create or replace function validate_locale_fallback_chain()
returns trigger
language plpgsql
as $$
declare
  cycle_found boolean;
begin
  if new.fallback_locale_id is null then
    return new;
  end if;

  with recursive ancestors(id, fallback_locale_id) as (
    select l.id, l.fallback_locale_id from locales l where l.id = new.fallback_locale_id
    union
    select l.id, l.fallback_locale_id
    from locales l
    join ancestors a on l.id = a.fallback_locale_id
  )
  select exists(select 1 from ancestors where id = new.id) into cycle_found;

  if cycle_found then
    raise exception 'locale fallback cycle detected' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists ct_locales__fallback_chain on locales;
create constraint trigger ct_locales__fallback_chain
after insert or update of fallback_locale_id on locales
deferrable initially immediate
for each row execute function validate_locale_fallback_chain();

create table if not exists geographic_areas (
  id uuid primary key,
  parent_id uuid,
  area_type varchar(16) not null,
  country_code varchar(2),
  subdivision_code varchar(16),
  city_code varchar(64),
  slug varchar(128) not null,
  display_name varchar(160) not null,
  timezone varchar(64),
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_active boolean not null default true,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  constraint ck_geographic_areas__parent_not_self check (parent_id is null or parent_id <> id),
  constraint ck_geographic_areas__area_type check (area_type in ('country', 'region', 'city')),
  constraint ck_geographic_areas__country_code check (country_code is not null and country_code ~ '^[A-Z]{2}$'),
  constraint ck_geographic_areas__slug check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint ck_geographic_areas__latitude check (latitude is null or latitude between -90 and 90),
  constraint ck_geographic_areas__longitude check (longitude is null or longitude between -180 and 180),
  constraint ck_geographic_areas__city_timezone check (area_type <> 'city' or timezone is not null),
  constraint uq_geographic_areas__parent_type_slug unique nulls not distinct (parent_id, area_type, slug),
  constraint fk_geographic_areas__parent_id foreign key (parent_id) references geographic_areas(id) on delete restrict
);

create unique index if not exists uq_geographic_areas__country_code on geographic_areas (country_code) where area_type = 'country';
create unique index if not exists uq_geographic_areas__country_subdivision_code on geographic_areas (country_code, subdivision_code) where subdivision_code is not null;
create unique index if not exists uq_geographic_areas__country_city_code on geographic_areas (country_code, city_code) where city_code is not null;
create index if not exists ix_geographic_areas__parent_id on geographic_areas (parent_id);
create index if not exists ix_geographic_areas__area_type on geographic_areas (area_type);
create index if not exists ix_geographic_areas__country_code on geographic_areas (country_code);
create index if not exists ix_geographic_areas__timezone on geographic_areas (timezone);
create index if not exists ix_geographic_areas__is_active on geographic_areas (is_active);

create or replace function enforce_geographic_area_id_immutability()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'geographic area id is immutable' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists tr_geographic_areas__id_immutable on geographic_areas;
create trigger tr_geographic_areas__id_immutable
before update of id on geographic_areas
for each row execute function enforce_geographic_area_id_immutability();

create or replace function validate_geographic_area_hierarchy()
returns trigger
language plpgsql
as $$
declare
  parent_row geographic_areas%rowtype;
  cycle_found boolean;
begin
  if new.area_type = 'country' then
    if new.parent_id is not null then
      raise exception 'country must not have a parent' using errcode = '23514';
    end if;
  else
    if new.parent_id is null then
      raise exception '% must have a parent', new.area_type using errcode = '23514';
    end if;
    select * into parent_row from geographic_areas where id = new.parent_id;
    if not found then
      raise exception 'geographic parent does not exist' using errcode = '23503';
    end if;
    if (new.area_type = 'region' and parent_row.area_type <> 'country')
      or (new.area_type = 'city' and parent_row.area_type not in ('country', 'region')) then
      raise exception 'invalid geographic hierarchy type' using errcode = '23514';
    end if;
    if parent_row.country_code <> new.country_code then
      raise exception 'geographic country code differs from parent' using errcode = '23514';
    end if;
  end if;

  if new.timezone is not null and not exists (
    select 1 from pg_timezone_names where name = new.timezone
  ) then
    raise exception 'invalid IANA timezone' using errcode = '23514';
  end if;

  if exists (
    select 1
    from geographic_areas child
    where child.parent_id = new.id
      and (
        child.country_code <> new.country_code
        or (child.area_type = 'region' and new.area_type <> 'country')
        or (child.area_type = 'city' and new.area_type not in ('country', 'region'))
      )
  ) then
    raise exception 'geographic change would invalidate a descendant' using errcode = '23514';
  end if;

  if new.parent_id is not null then
    with recursive ancestors(id, parent_id) as (
      select g.id, g.parent_id from geographic_areas g where g.id = new.parent_id
      union
      select g.id, g.parent_id
      from geographic_areas g
      join ancestors a on g.id = a.parent_id
    )
    select exists(select 1 from ancestors where id = new.id) into cycle_found;
    if cycle_found then
      raise exception 'geographic hierarchy cycle detected' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists ct_geographic_areas__hierarchy on geographic_areas;
create constraint trigger ct_geographic_areas__hierarchy
after insert or update of parent_id, area_type, country_code, timezone on geographic_areas
deferrable initially immediate
for each row execute function validate_geographic_area_hierarchy();
