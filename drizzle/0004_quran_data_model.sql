create table if not exists quran_surahs (
 id uuid primary key, work_id uuid not null, passage_id uuid not null, canonical_key varchar(64) not null,
 surah_number smallint not null, ayah_count smallint not null, name_arabic varchar(120) not null,
 revelation_order smallint, revelation_place varchar(16), provider_aliases jsonb not null default '[]'::jsonb,
 source_record_checksum varchar(64) not null, publication_state varchar(16) not null default 'draft', published_at timestamptz,
 created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_quran_surahs__work foreign key(work_id) references works(id) on update restrict on delete restrict,
 constraint fk_quran_surahs__passage foreign key(passage_id) references passages(id) on update restrict on delete restrict,
 constraint uq_quran_surahs__work_number unique(work_id,surah_number), constraint uq_quran_surahs__passage unique(passage_id),
 constraint uq_quran_surahs__canonical_key unique(canonical_key), constraint uq_quran_surahs__revelation_order unique(revelation_order),
 constraint ck_quran_surahs__number check(surah_number between 1 and 114), constraint ck_quran_surahs__ayah_count check(ayah_count>0),
 constraint ck_quran_surahs__canonical_key check(canonical_key=('quran:surah:'||surah_number::text)),
 constraint ck_quran_surahs__name check(btrim(name_arabic)<>''), constraint ck_quran_surahs__revelation_order check(revelation_order is null or revelation_order between 1 and 114),
 constraint ck_quran_surahs__revelation_place check(revelation_place is null or revelation_place in ('makkah','madinah')),
 constraint ck_quran_surahs__aliases check(jsonb_typeof(provider_aliases)='array' and octet_length(provider_aliases::text)<=16384),
 constraint ck_quran_surahs__checksum check(source_record_checksum ~ '^[0-9a-f]{64}$'),
 constraint ck_quran_surahs__state check(publication_state in ('draft','validated','published','withdrawn')),
 constraint ck_quran_surahs__published_at check((publication_state in ('published','withdrawn'))=(published_at is not null))
);
create index if not exists ix_quran_surahs__work_number on quran_surahs(work_id,surah_number);
create index if not exists ix_quran_surahs__publication_state on quran_surahs(publication_state);
create index if not exists ix_quran_surahs__provider_aliases on quran_surahs using gin(provider_aliases);

create table if not exists quran_ayahs (
 id uuid primary key, surah_id uuid not null, passage_id uuid not null, canonical_key varchar(80) not null,
 ayah_number smallint not null, global_sequence_number smallint not null, provider_aliases jsonb not null default '[]'::jsonb,
 source_record_checksum varchar(64) not null, publication_state varchar(16) not null default 'draft', published_at timestamptz,
 created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_quran_ayahs__surah foreign key(surah_id) references quran_surahs(id) on update restrict on delete restrict,
 constraint fk_quran_ayahs__passage foreign key(passage_id) references passages(id) on update restrict on delete restrict,
 constraint uq_quran_ayahs__surah_number unique(surah_id,ayah_number), constraint uq_quran_ayahs__passage unique(passage_id),
 constraint uq_quran_ayahs__canonical_key unique(canonical_key), constraint uq_quran_ayahs__global_sequence unique(global_sequence_number),
 constraint ck_quran_ayahs__numbers check(ayah_number>0 and global_sequence_number>0),
 constraint ck_quran_ayahs__aliases check(jsonb_typeof(provider_aliases)='array' and octet_length(provider_aliases::text)<=16384),
 constraint ck_quran_ayahs__checksum check(source_record_checksum ~ '^[0-9a-f]{64}$'),
 constraint ck_quran_ayahs__state check(publication_state in ('draft','validated','published','withdrawn')),
 constraint ck_quran_ayahs__published_at check((publication_state in ('published','withdrawn'))=(published_at is not null))
);
create index if not exists ix_quran_ayahs__surah_number on quran_ayahs(surah_id,ayah_number);
create index if not exists ix_quran_ayahs__publication_state on quran_ayahs(publication_state);
create index if not exists ix_quran_ayahs__provider_aliases on quran_ayahs using gin(provider_aliases);

create table if not exists quran_ayah_texts (
 id uuid primary key, edition_id uuid not null, ayah_id uuid not null, passage_text_id uuid not null,
 source_record_checksum varchar(64) not null, created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_quran_ayah_texts__edition foreign key(edition_id) references editions(id) on update restrict on delete restrict,
 constraint fk_quran_ayah_texts__ayah foreign key(ayah_id) references quran_ayahs(id) on update restrict on delete restrict,
 constraint fk_quran_ayah_texts__passage_text foreign key(passage_text_id) references passage_texts(id) on update restrict on delete restrict,
 constraint uq_quran_ayah_texts__edition_ayah unique(edition_id,ayah_id), constraint uq_quran_ayah_texts__passage_text unique(passage_text_id),
 constraint ck_quran_ayah_texts__checksum check(source_record_checksum ~ '^[0-9a-f]{64}$')
);
create index if not exists ix_quran_ayah_texts__ayah on quran_ayah_texts(ayah_id);
create index if not exists ix_quran_ayah_texts__edition_ayah on quran_ayah_texts(edition_id,ayah_id);

create table if not exists quran_structural_markers (
 id uuid primary key, edition_id uuid not null, parent_marker_id uuid, marker_kind varchar(16) not null, marker_number smallint not null,
 canonical_key varchar(96) not null, start_ayah_id uuid not null, end_ayah_id uuid not null, provider_aliases jsonb not null default '[]'::jsonb,
 source_record_checksum varchar(64) not null, publication_state varchar(16) not null default 'draft', published_at timestamptz,
 created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_quran_structural_markers__edition foreign key(edition_id) references editions(id) on update restrict on delete restrict,
 constraint fk_quran_structural_markers__parent foreign key(parent_marker_id) references quran_structural_markers(id) on update restrict on delete restrict,
 constraint fk_quran_structural_markers__start foreign key(start_ayah_id) references quran_ayahs(id) on update restrict on delete restrict,
 constraint fk_quran_structural_markers__end foreign key(end_ayah_id) references quran_ayahs(id) on update restrict on delete restrict,
 constraint uq_quran_structural_markers__kind_number unique(edition_id,marker_kind,marker_number),
 constraint uq_quran_structural_markers__canonical_key unique(edition_id,canonical_key),
 constraint ck_quran_structural_markers__kind check(marker_kind in ('juz','hizb','rub','manzil','ruku','page','sajdah')),
 constraint ck_quran_structural_markers__number check(marker_number>0), constraint ck_quran_structural_markers__canonical_key check(canonical_key=(marker_kind||':'||marker_number::text)),
 constraint ck_quran_structural_markers__aliases check(jsonb_typeof(provider_aliases)='array' and octet_length(provider_aliases::text)<=16384),
 constraint ck_quran_structural_markers__checksum check(source_record_checksum ~ '^[0-9a-f]{64}$'),
 constraint ck_quran_structural_markers__state check(publication_state in ('draft','validated','published','withdrawn')),
 constraint ck_quran_structural_markers__published_at check((publication_state in ('published','withdrawn'))=(published_at is not null)),
 constraint ck_quran_structural_markers__not_self check(parent_marker_id is null or parent_marker_id<>id)
);
create index if not exists ix_quran_structural_markers__kind_number on quran_structural_markers(edition_id,marker_kind,marker_number);
create index if not exists ix_quran_structural_markers__range on quran_structural_markers(edition_id,start_ayah_id,end_ayah_id);
create index if not exists ix_quran_structural_markers__parent on quran_structural_markers(parent_marker_id);
create index if not exists ix_quran_structural_markers__publication_state on quran_structural_markers(publication_state);
create index if not exists ix_quran_structural_markers__provider_aliases on quran_structural_markers using gin(provider_aliases);

create table if not exists quran_translation_editions (
 id uuid primary key, edition_id uuid not null, locale_id uuid not null, license_id uuid not null, translator_name varchar(300) not null,
 methodology text not null, review_status varchar(16) not null default 'pending', reviewed_at timestamptz,
 created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_quran_translation_editions__edition foreign key(edition_id) references editions(id) on update restrict on delete restrict,
 constraint fk_quran_translation_editions__locale foreign key(locale_id) references locales(id) on update restrict on delete restrict,
 constraint fk_quran_translation_editions__license foreign key(license_id) references licenses(id) on update restrict on delete restrict,
 constraint uq_quran_translation_editions__edition unique(edition_id),
 constraint ck_quran_translation_editions__text check(btrim(translator_name)<>'' and btrim(methodology)<>'' and octet_length(methodology)<=8192),
 constraint ck_quran_translation_editions__status check(review_status in ('pending','approved','rejected','withdrawn')),
 constraint ck_quran_translation_editions__reviewed_at check((review_status='pending')=(reviewed_at is null))
);
create index if not exists ix_quran_translation_editions__locale_status on quran_translation_editions(locale_id,review_status);
create index if not exists ix_quran_translation_editions__license on quran_translation_editions(license_id);
create index if not exists ix_quran_translation_editions__review_status on quran_translation_editions(review_status);

create table if not exists quran_translation_texts (
 id uuid primary key, translation_edition_id uuid not null, ayah_id uuid not null, passage_text_id uuid not null,
 source_record_checksum varchar(64) not null, created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_quran_translation_texts__edition foreign key(translation_edition_id) references quran_translation_editions(id) on update restrict on delete restrict,
 constraint fk_quran_translation_texts__ayah foreign key(ayah_id) references quran_ayahs(id) on update restrict on delete restrict,
 constraint fk_quran_translation_texts__passage_text foreign key(passage_text_id) references passage_texts(id) on update restrict on delete restrict,
 constraint uq_quran_translation_texts__edition_ayah unique(translation_edition_id,ayah_id), constraint uq_quran_translation_texts__passage_text unique(passage_text_id),
 constraint ck_quran_translation_texts__checksum check(source_record_checksum ~ '^[0-9a-f]{64}$')
);
create index if not exists ix_quran_translation_texts__ayah on quran_translation_texts(ayah_id);
create index if not exists ix_quran_translation_texts__edition_ayah on quran_translation_texts(translation_edition_id,ayah_id);

create or replace function validate_m5_aliases(
  aliases_input jsonb,
  expected_type text
)
returns boolean
language plpgsql
immutable
as $$
declare
  alias_row jsonb;
begin
  if jsonb_typeof(aliases_input) <> 'array' then
    return false;
  end if;

  for alias_row in
    select element.alias_value
    from jsonb_array_elements(aliases_input) as element(alias_value)
  loop
    if jsonb_typeof(alias_row) <> 'object'
      or (select count(*) from jsonb_object_keys(alias_row)) <> 4
      or coalesce(alias_row->>'provider_code', '') !~ '^[a-z0-9][a-z0-9_-]*$'
      or alias_row->>'resource_type' <> expected_type
      or btrim(coalesce(alias_row->>'external_id', '')) = ''
      or btrim(coalesce(alias_row->>'provider_version', '')) = ''
    then
      return false;
    end if;
  end loop;

  return true;
end
$$;
do $$ begin
 if not exists(select 1 from pg_constraint where conname='ck_quran_surahs__alias_shape') then alter table quran_surahs add constraint ck_quran_surahs__alias_shape check(validate_m5_aliases(provider_aliases,'surah')); end if;
 if not exists(select 1 from pg_constraint where conname='ck_quran_ayahs__alias_shape') then alter table quran_ayahs add constraint ck_quran_ayahs__alias_shape check(validate_m5_aliases(provider_aliases,'ayah')); end if;
 if not exists(select 1 from pg_constraint where conname='ck_quran_structural_markers__alias_shape') then alter table quran_structural_markers add constraint ck_quran_structural_markers__alias_shape check(validate_m5_aliases(provider_aliases,marker_kind)); end if;
end $$;

create or replace function reject_duplicate_m5_aliases() returns trigger language plpgsql as $$
declare duplicate_found boolean; begin
 if tg_table_name='quran_surahs' then
  select exists(select 1 from quran_surahs other cross join jsonb_array_elements(other.provider_aliases) oa cross join jsonb_array_elements(new.provider_aliases) na where other.id<>new.id and (oa->>'provider_code',oa->>'resource_type',oa->>'external_id',oa->>'provider_version')=(na->>'provider_code',na->>'resource_type',na->>'external_id',na->>'provider_version')) into duplicate_found;
 elsif tg_table_name='quran_ayahs' then
  select exists(select 1 from quran_ayahs other cross join jsonb_array_elements(other.provider_aliases) oa cross join jsonb_array_elements(new.provider_aliases) na where other.id<>new.id and (oa->>'provider_code',oa->>'resource_type',oa->>'external_id',oa->>'provider_version')=(na->>'provider_code',na->>'resource_type',na->>'external_id',na->>'provider_version')) into duplicate_found;
 else
  select exists(select 1 from quran_structural_markers other cross join jsonb_array_elements(other.provider_aliases) oa cross join jsonb_array_elements(new.provider_aliases) na where other.id<>new.id and (oa->>'provider_code',oa->>'resource_type',oa->>'external_id',oa->>'provider_version')=(na->>'provider_code',na->>'resource_type',na->>'external_id',na->>'provider_version')) into duplicate_found;
 end if;
 if duplicate_found then raise exception 'duplicate Quran provider alias' using errcode='23505'; end if; return new; end $$;
drop trigger if exists ct_quran_surahs__provider_alias on quran_surahs; create constraint trigger ct_quran_surahs__provider_alias after insert or update of provider_aliases on quran_surahs deferrable initially immediate for each row execute function reject_duplicate_m5_aliases();
drop trigger if exists ct_quran_ayahs__provider_alias on quran_ayahs; create constraint trigger ct_quran_ayahs__provider_alias after insert or update of provider_aliases on quran_ayahs deferrable initially immediate for each row execute function reject_duplicate_m5_aliases();
drop trigger if exists ct_quran_structural_markers__provider_alias on quran_structural_markers; create constraint trigger ct_quran_structural_markers__provider_alias after insert or update of provider_aliases on quran_structural_markers deferrable initially immediate for each row execute function reject_duplicate_m5_aliases();

create or replace function validate_m5_specialization() returns trigger language plpgsql as $$
declare w works%rowtype; p passages%rowtype; s quran_surahs%rowtype; e editions%rowtype; pt passage_texts%rowtype; a quran_ayahs%rowtype; te quran_translation_editions%rowtype; l locales%rowtype;
begin
 if tg_table_name='quran_surahs' then
  select * into w from works where id=new.work_id; select * into p from passages where id=new.passage_id;
  if w.work_type<>'quran' or p.work_id<>new.work_id or p.passage_type<>'chapter' or p.canonical_locator<>('surah:'||new.surah_number) or p.depth<>1 or p.sequence_number<>new.surah_number then raise exception 'invalid Quran surah specialization' using errcode='23514'; end if;
 elsif tg_table_name='quran_ayahs' then
  select * into s from quran_surahs where id=new.surah_id; select * into p from passages where id=new.passage_id;
  if new.ayah_number>s.ayah_count or new.canonical_key<>('quran:ayah:'||s.surah_number||':'||new.ayah_number) or p.work_id<>s.work_id or p.parent_passage_id<>s.passage_id or p.passage_type<>'verse' or p.canonical_locator<>(s.surah_number||':'||new.ayah_number) or p.sequence_number<>new.ayah_number then raise exception 'invalid Quran ayah specialization' using errcode='23514'; end if;
 elsif tg_table_name='quran_ayah_texts' then
  select * into a from quran_ayahs where id=new.ayah_id; select * into s from quran_surahs where id=a.surah_id; select * into e from editions where id=new.edition_id; select * into pt from passage_texts where id=new.passage_text_id;
  if e.work_id<>s.work_id or pt.edition_id<>new.edition_id or pt.passage_id<>a.passage_id then raise exception 'invalid Quran ayah text linkage' using errcode='23514'; end if;
 elsif tg_table_name='quran_translation_editions' then
  select * into e from editions where id=new.edition_id; select * into w from works where id=e.work_id; select * into l from locales where id=new.locale_id;
  if w.work_type<>'quran' or e.license_id<>new.license_id or e.language_code<>l.language_code then raise exception 'invalid Quran translation edition linkage' using errcode='23514'; end if;
 elsif tg_table_name='quran_translation_texts' then
  select * into te from quran_translation_editions where id=new.translation_edition_id; select * into a from quran_ayahs where id=new.ayah_id; select * into pt from passage_texts where id=new.passage_text_id;
  if pt.edition_id<>te.edition_id or pt.passage_id<>a.passage_id then raise exception 'invalid Quran translation text linkage' using errcode='23514'; end if;
 end if; return new; end $$;

drop trigger if exists tr_quran_surahs__specialization on quran_surahs; create trigger tr_quran_surahs__specialization before insert or update on quran_surahs for each row execute function validate_m5_specialization();
drop trigger if exists tr_quran_ayahs__specialization on quran_ayahs; create trigger tr_quran_ayahs__specialization before insert or update on quran_ayahs for each row execute function validate_m5_specialization();
drop trigger if exists tr_quran_ayah_texts__specialization on quran_ayah_texts; create trigger tr_quran_ayah_texts__specialization before insert or update on quran_ayah_texts for each row execute function validate_m5_specialization();
drop trigger if exists tr_quran_translation_editions__specialization on quran_translation_editions; create trigger tr_quran_translation_editions__specialization before insert or update on quran_translation_editions for each row execute function validate_m5_specialization();
drop trigger if exists tr_quran_translation_texts__specialization on quran_translation_texts; create trigger tr_quran_translation_texts__specialization before insert or update on quran_translation_texts for each row execute function validate_m5_specialization();

create or replace function validate_quran_marker() returns trigger language plpgsql as $$
declare e editions%rowtype; sa quran_surahs%rowtype; ea quran_surahs%rowtype; start_a quran_ayahs%rowtype; end_a quran_ayahs%rowtype; parent quran_structural_markers%rowtype;
begin
 select * into e from editions where id=new.edition_id; select * into start_a from quran_ayahs where id=new.start_ayah_id; select * into end_a from quran_ayahs where id=new.end_ayah_id;
 select * into sa from quran_surahs where id=start_a.surah_id; select * into ea from quran_surahs where id=end_a.surah_id;
 if sa.work_id<>e.work_id or ea.work_id<>e.work_id or start_a.global_sequence_number>end_a.global_sequence_number then raise exception 'invalid Quran marker range' using errcode='23514'; end if;
 if new.parent_marker_id is not null then select * into parent from quran_structural_markers where id=new.parent_marker_id;
  if parent.edition_id<>new.edition_id or not ((parent.marker_kind='juz' and new.marker_kind='hizb') or (parent.marker_kind='hizb' and new.marker_kind='rub')) then raise exception 'invalid Quran marker parent' using errcode='23514'; end if;
  if start_a.global_sequence_number< (select global_sequence_number from quran_ayahs where id=parent.start_ayah_id) or end_a.global_sequence_number> (select global_sequence_number from quran_ayahs where id=parent.end_ayah_id) then raise exception 'Quran marker outside parent range' using errcode='23514'; end if;
 end if; return new; end $$;
drop trigger if exists ct_quran_structural_markers__range on quran_structural_markers; create constraint trigger ct_quran_structural_markers__range after insert or update on quran_structural_markers deferrable initially immediate for each row execute function validate_quran_marker();

create or replace function enforce_m5_immutability() returns trigger language plpgsql as $$ begin
 if new.id is distinct from old.id then raise exception 'M5 id is immutable' using errcode='23514'; end if;
 if tg_table_name in ('quran_surahs','quran_ayahs','quran_structural_markers') and old.publication_state in ('validated','published','withdrawn') and new is distinct from old then
  if old.publication_state='published' and new.publication_state='withdrawn' then return new; end if; raise exception 'validated Quran identity is immutable' using errcode='23514';
 elsif tg_table_name not in ('quran_surahs','quran_ayahs','quran_structural_markers') and new is distinct from old then raise exception 'Quran specialization is immutable' using errcode='23514'; end if; return new; end $$;
drop trigger if exists tr_quran_surahs__immutable on quran_surahs; create trigger tr_quran_surahs__immutable before update on quran_surahs for each row execute function enforce_m5_immutability();
drop trigger if exists tr_quran_ayahs__immutable on quran_ayahs; create trigger tr_quran_ayahs__immutable before update on quran_ayahs for each row execute function enforce_m5_immutability();
drop trigger if exists tr_quran_ayah_texts__immutable on quran_ayah_texts; create trigger tr_quran_ayah_texts__immutable before update on quran_ayah_texts for each row execute function enforce_m5_immutability();
drop trigger if exists tr_quran_structural_markers__immutable on quran_structural_markers; create trigger tr_quran_structural_markers__immutable before update on quran_structural_markers for each row execute function enforce_m5_immutability();
drop trigger if exists tr_quran_translation_texts__immutable on quran_translation_texts; create trigger tr_quran_translation_texts__immutable before update on quran_translation_texts for each row execute function enforce_m5_immutability();

create or replace function enforce_m5_publication() returns trigger language plpgsql as $$
declare e editions%rowtype; s quran_surahs%rowtype; begin
 if new.publication_state='published' and old.publication_state<>'published' then
  if tg_table_name='quran_surahs' and (
   (select count(*) from quran_surahs where work_id=new.work_id)<>114
   or exists(select 1 from quran_surahs qs where qs.work_id=new.work_id and (select count(*) from quran_ayahs qa where qa.surah_id=qs.id)<>qs.ayah_count)
   or (select min(qa.global_sequence_number) from quran_ayahs qa join quran_surahs qs on qs.id=qa.surah_id where qs.work_id=new.work_id)<>1
   or (select max(qa.global_sequence_number) from quran_ayahs qa join quran_surahs qs on qs.id=qa.surah_id where qs.work_id=new.work_id)<>(select count(*) from quran_ayahs qa join quran_surahs qs on qs.id=qa.surah_id where qs.work_id=new.work_id)
   or not exists(select 1 from editions where work_id=new.work_id and publication_state='published')
  ) then raise exception 'Quran surah publication is not eligible' using errcode='23514'; end if;
  if tg_table_name='quran_ayahs' then select * into s from quran_surahs where id=new.surah_id; if s.publication_state<>'published' then raise exception 'Quran ayah publication is not eligible' using errcode='23514'; end if; end if;
  if tg_table_name='quran_structural_markers' then select * into e from editions where id=new.edition_id; if e.publication_state<>'published' then raise exception 'Quran marker publication is not eligible' using errcode='23514'; end if; end if;
 end if; return new; end $$;
drop trigger if exists tr_quran_surahs__publication on quran_surahs; create trigger tr_quran_surahs__publication before update of publication_state on quran_surahs for each row execute function enforce_m5_publication();
drop trigger if exists tr_quran_ayahs__publication on quran_ayahs; create trigger tr_quran_ayahs__publication before update of publication_state on quran_ayahs for each row execute function enforce_m5_publication();
drop trigger if exists tr_quran_structural_markers__publication on quran_structural_markers; create trigger tr_quran_structural_markers__publication before update of publication_state on quran_structural_markers for each row execute function enforce_m5_publication();
