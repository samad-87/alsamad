create extension if not exists pgcrypto;

create table if not exists licenses (
 id uuid primary key, provider_code varchar(64) not null, license_key varchar(128) not null, version varchar(64) not null,
 name varchar(200) not null, rights_scope varchar(24) not null, attribution_text text not null, terms_url text,
 retention_policy varchar(24) not null, retention_days integer, redistribution_allowed boolean not null default false,
 derivatives_allowed boolean not null default false, effective_from timestamptz not null, effective_until timestamptz,
 status varchar(16) not null default 'draft', created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint uq_licenses__provider_key_version unique(provider_code,license_key,version),
 constraint ck_licenses__provider_code check(provider_code ~ '^[a-z0-9][a-z0-9_-]*$'),
 constraint ck_licenses__nonblank check(btrim(license_key)<>'' and btrim(version)<>'' and btrim(name)<>'' and btrim(attribution_text)<>''),
 constraint ck_licenses__rights_scope check(rights_scope in ('public_domain','permission','open_license','contract')),
 constraint ck_licenses__terms_url check(terms_url is null or terms_url ~ '^https://'),
 constraint ck_licenses__retention_policy check(retention_policy in ('permanent','time_limited','no_storage')),
 constraint ck_licenses__retention_days check((retention_policy='time_limited' and retention_days>0) or (retention_policy<>'time_limited' and retention_days is null)),
 constraint ck_licenses__effective_window check(effective_until is null or effective_until>effective_from),
 constraint ck_licenses__status check(status in ('draft','active','expired','revoked'))
);
create index if not exists ix_licenses__status_effective on licenses(status,effective_from,effective_until);
create index if not exists ix_licenses__provider_key on licenses(provider_code,license_key);

create table if not exists works (
 id uuid primary key, canonical_key varchar(160) not null, work_type varchar(24) not null, title varchar(300) not null,
 original_language_code varchar(8) not null, authority_name varchar(300), description text,
 created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint uq_works__canonical_key unique(canonical_key),
 constraint ck_works__canonical_key check(canonical_key ~ '^[a-z0-9][a-z0-9._-]*$'),
 constraint ck_works__work_type check(work_type in ('quran','hadith_collection','dua_collection','dhikr_collection','reference_work')),
 constraint ck_works__language check(original_language_code ~ '^[a-z][a-z0-9-]*$'),
 constraint ck_works__nonblank check(btrim(title)<>'')
);
create index if not exists ix_works__work_type on works(work_type);
create index if not exists ix_works__original_language on works(original_language_code);

create table if not exists editions (
 id uuid primary key, work_id uuid not null, license_id uuid not null, edition_key varchar(160) not null, version varchar(64) not null,
 language_code varchar(8) not null, script_code varchar(4), display_name varchar(300) not null, provider_code varchar(64) not null,
 provider_edition_id varchar(256) not null, import_version varchar(128) not null, source_manifest_checksum varchar(64) not null,
 provider_metadata jsonb not null default '{}'::jsonb, publication_state varchar(16) not null default 'draft', published_at timestamptz,
 created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_editions__work foreign key(work_id) references works(id) on update restrict on delete restrict,
 constraint fk_editions__license foreign key(license_id) references licenses(id) on update restrict on delete restrict,
 constraint uq_editions__work_key_version unique(work_id,edition_key,version),
 constraint uq_editions__provider_alias unique(provider_code,provider_edition_id,import_version),
 constraint ck_editions__nonblank check(btrim(edition_key)<>'' and btrim(version)<>'' and btrim(display_name)<>'' and btrim(provider_edition_id)<>'' and btrim(import_version)<>''),
 constraint ck_editions__codes check(language_code ~ '^[a-z][a-z0-9-]*$' and provider_code ~ '^[a-z0-9][a-z0-9_-]*$'),
 constraint ck_editions__script check(script_code is null or script_code ~ '^[A-Z][a-z]{3}$'),
 constraint ck_editions__manifest_checksum check(source_manifest_checksum ~ '^[0-9a-f]{64}$'),
 constraint ck_editions__metadata check(jsonb_typeof(provider_metadata)='object' and octet_length(provider_metadata::text)<=16384),
 constraint ck_editions__state check(publication_state in ('draft','validated','published','withdrawn')),
 constraint ck_editions__published_at check((publication_state in ('published','withdrawn'))=(published_at is not null))
);
create index if not exists ix_editions__work on editions(work_id); create index if not exists ix_editions__license on editions(license_id);
create index if not exists ix_editions__state_work on editions(publication_state,work_id); create index if not exists ix_editions__provider_alias on editions(provider_code,provider_edition_id);

create table if not exists passages (
 id uuid primary key, work_id uuid not null, parent_passage_id uuid, canonical_locator varchar(200) not null, passage_type varchar(24) not null,
 sequence_number integer not null, depth smallint not null, created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_passages__work foreign key(work_id) references works(id) on update restrict on delete restrict,
 constraint fk_passages__parent foreign key(parent_passage_id) references passages(id) on update restrict on delete restrict,
 constraint uq_passages__work_locator unique(work_id,canonical_locator), constraint uq_passages__sibling_order unique nulls not distinct(work_id,parent_passage_id,sequence_number),
 constraint ck_passages__locator check(btrim(canonical_locator)<>''), constraint ck_passages__type check(passage_type in ('work','book','chapter','section','verse','entry','paragraph')),
 constraint ck_passages__sequence check(sequence_number>0), constraint ck_passages__depth check(depth between 0 and 15), constraint ck_passages__not_self check(parent_passage_id is null or parent_passage_id<>id)
);
create index if not exists ix_passages__hierarchy on passages(work_id,parent_passage_id,sequence_number); create index if not exists ix_passages__parent on passages(parent_passage_id);

create table if not exists passage_texts (
 id uuid primary key, edition_id uuid not null, passage_id uuid not null, text_content text not null, normalized_checksum varchar(64) not null,
 source_checksum varchar(64) not null, publication_state varchar(16) not null default 'draft', published_at timestamptz,
 created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_passage_texts__edition foreign key(edition_id) references editions(id) on update restrict on delete restrict,
 constraint fk_passage_texts__passage foreign key(passage_id) references passages(id) on update restrict on delete restrict,
 constraint uq_passage_texts__edition_passage unique(edition_id,passage_id), constraint ck_passage_texts__nonblank check(btrim(text_content)<>''),
 constraint ck_passage_texts__checksums check(normalized_checksum ~ '^[0-9a-f]{64}$' and source_checksum ~ '^[0-9a-f]{64}$'),
 constraint ck_passage_texts__state check(publication_state in ('draft','validated','published','withdrawn')),
 constraint ck_passage_texts__published_at check((publication_state in ('published','withdrawn'))=(published_at is not null))
);
create index if not exists ix_passage_texts__passage on passage_texts(passage_id); create index if not exists ix_passage_texts__edition_state on passage_texts(edition_id,publication_state);

create table if not exists content_items (
 id uuid primary key, canonical_key varchar(160) not null, content_type varchar(32) not null, origin_kind varchar(16) not null, owning_module varchar(32) not null,
 is_sensitive boolean not null default false, created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint uq_content_items__canonical_key unique(canonical_key), constraint ck_content_items__canonical_key check(canonical_key ~ '^[a-z0-9][a-z0-9._-]*$'),
 constraint ck_content_items__type check(content_type in ('dua','dhikr','collection','article','guide','editorial_general_dua')),
 constraint ck_content_items__origin check(origin_kind in ('canonical_source','editorial','imported')), constraint ck_content_items__module check(owning_module in ('devotional','editorial','knowledge')),
 constraint ck_content_items__editorial_general_dua check((content_type='editorial_general_dua')=(origin_kind='editorial' and owning_module='editorial'))
);
create index if not exists ix_content_items__type_module on content_items(content_type,owning_module); create index if not exists ix_content_items__origin on content_items(origin_kind);

create table if not exists content_revisions (
 id uuid primary key, content_item_id uuid not null, predecessor_revision_id uuid, revision_number integer not null, source_text text not null,
 source_language_code varchar(8) not null, verification_state varchar(20) not null default 'unverified', publication_state varchar(16) not null default 'draft',
 provenance_kind varchar(16) not null, provider_code varchar(64), provider_record_id varchar(256), source_manifest_checksum varchar(64), content_checksum varchar(64) not null,
 schema_version integer not null default 1, lock_version integer not null default 1, published_at timestamptz,
 created_at timestamptz not null default current_timestamp, updated_at timestamptz not null default current_timestamp,
 constraint fk_content_revisions__item foreign key(content_item_id) references content_items(id) on update restrict on delete restrict,
 constraint fk_content_revisions__predecessor foreign key(predecessor_revision_id) references content_revisions(id) on update restrict on delete restrict,
 constraint uq_content_revisions__number unique(content_item_id,revision_number), constraint uq_content_revisions__checksum unique(content_item_id,content_checksum),
 constraint ck_content_revisions__positive check(revision_number>0 and schema_version>0 and lock_version>0), constraint ck_content_revisions__nonblank check(btrim(source_text)<>''),
 constraint ck_content_revisions__language check(source_language_code ~ '^[a-z][a-z0-9-]*$'),
 constraint ck_content_revisions__verification check(verification_state in ('unverified','source_verified','editorial_only','rejected')),
 constraint ck_content_revisions__publication check(publication_state in ('draft','in_review','approved','published','withdrawn','superseded')),
 constraint ck_content_revisions__provenance check(provenance_kind in ('manual','provider','editorial')),
 constraint ck_content_revisions__provider check((provenance_kind='provider' and provider_code ~ '^[a-z0-9][a-z0-9_-]*$' and nullif(btrim(provider_record_id),'') is not null and source_manifest_checksum ~ '^[0-9a-f]{64}$') or (provenance_kind<>'provider' and provider_code is null and provider_record_id is null and source_manifest_checksum is null)),
 constraint ck_content_revisions__checksum check(content_checksum ~ '^[0-9a-f]{64}$'),
 constraint ck_content_revisions__published_at check((publication_state in ('published','withdrawn','superseded'))=(published_at is not null)),
 constraint ck_content_revisions__predecessor_shape check((revision_number=1)=(predecessor_revision_id is null))
);
create index if not exists ix_content_revisions__item_state_number on content_revisions(content_item_id,publication_state,revision_number desc);
create index if not exists ix_content_revisions__predecessor on content_revisions(predecessor_revision_id);
create index if not exists ix_content_revisions__provider on content_revisions(provider_code,provider_record_id) where provider_code is not null;
create index if not exists ix_content_revisions__state_published on content_revisions(publication_state,published_at);

create table if not exists source_references (
 id uuid primary key, content_revision_id uuid not null, cited_work_id uuid not null, cited_edition_id uuid, cited_passage_id uuid,
 reference_role varchar(20) not null, locator_label varchar(300) not null, quotation text, quotation_checksum varchar(64), source_url text,
 sort_order integer not null default 0, created_at timestamptz not null default current_timestamp,
 constraint fk_source_references__revision foreign key(content_revision_id) references content_revisions(id) on update restrict on delete restrict,
 constraint fk_source_references__work foreign key(cited_work_id) references works(id) on update restrict on delete restrict,
 constraint fk_source_references__edition foreign key(cited_edition_id) references editions(id) on update restrict on delete restrict,
 constraint fk_source_references__passage foreign key(cited_passage_id) references passages(id) on update restrict on delete restrict,
 constraint uq_source_references__scope unique nulls not distinct(content_revision_id,cited_work_id,cited_edition_id,cited_passage_id,reference_role,locator_label),
 constraint ck_source_references__role check(reference_role in ('primary_source','supporting','attribution','context')),
 constraint ck_source_references__locator check(btrim(locator_label)<>''), constraint ck_source_references__sort check(sort_order>=0),
 constraint ck_source_references__url check(source_url is null or source_url ~ '^https://'),
 constraint ck_source_references__quotation check((quotation is null and quotation_checksum is null) or (quotation is not null and btrim(quotation)<>'' and quotation_checksum ~ '^[0-9a-f]{64}$'))
);
create index if not exists ix_source_references__revision_sort on source_references(content_revision_id,sort_order);
create index if not exists ix_source_references__work on source_references(cited_work_id); create index if not exists ix_source_references__edition on source_references(cited_edition_id); create index if not exists ix_source_references__passage on source_references(cited_passage_id);

create or replace function alsamad_normalized_sha256(value text) returns text language sql immutable strict as $$ select encode(digest(convert_to(normalize(replace(replace(value,E'\r\n',E'\n'),E'\r',E'\n'), NFC),'UTF8'),'sha256'),'hex') $$;
create or replace function alsamad_exact_sha256(value text) returns text language sql immutable strict as $$ select encode(digest(convert_to(value,'UTF8'),'sha256'),'hex') $$;

create or replace function enforce_m4_checksums() returns trigger language plpgsql as $$ begin
 if tg_table_name='passage_texts' then
  if new.normalized_checksum<>alsamad_normalized_sha256(new.text_content) or new.source_checksum<>alsamad_exact_sha256(new.text_content) then raise exception 'passage checksum mismatch' using errcode='23514'; end if;
 elsif tg_table_name='content_revisions' then
  if new.content_checksum<>alsamad_normalized_sha256(new.source_text) then raise exception 'content checksum mismatch' using errcode='23514'; end if;
 elsif tg_table_name='source_references' and new.quotation is not null then
  if new.quotation_checksum<>alsamad_normalized_sha256(new.quotation) then raise exception 'quotation checksum mismatch' using errcode='23514'; end if;
 end if; return new; end $$;
drop trigger if exists tr_passage_texts__checksum on passage_texts; create trigger tr_passage_texts__checksum before insert or update on passage_texts for each row execute function enforce_m4_checksums();
drop trigger if exists tr_content_revisions__checksum on content_revisions; create trigger tr_content_revisions__checksum before insert or update on content_revisions for each row execute function enforce_m4_checksums();
drop trigger if exists tr_source_references__checksum on source_references; create trigger tr_source_references__checksum before insert or update on source_references for each row execute function enforce_m4_checksums();

create or replace function validate_passage_hierarchy() returns trigger language plpgsql as $$ declare p passages%rowtype; cycle_found boolean; begin
 if new.parent_passage_id is null then if new.depth<>0 then raise exception 'root passage depth must be zero' using errcode='23514'; end if; else
  select * into p from passages where id=new.parent_passage_id; if p.work_id<>new.work_id or new.depth<>p.depth+1 then raise exception 'invalid passage parent work or depth' using errcode='23514'; end if;
  with recursive a(id,parent_passage_id) as (select id,parent_passage_id from passages where id=new.parent_passage_id union select x.id,x.parent_passage_id from passages x join a on x.id=a.parent_passage_id) select exists(select 1 from a where id=new.id) into cycle_found;
  if cycle_found then raise exception 'passage cycle' using errcode='23514'; end if; end if; return new; end $$;
drop trigger if exists ct_passages__hierarchy on passages; create constraint trigger ct_passages__hierarchy after insert or update of parent_passage_id,work_id,depth on passages deferrable initially immediate for each row execute function validate_passage_hierarchy();

create or replace function validate_revision_chain() returns trigger language plpgsql as $$ declare p content_revisions%rowtype; begin
 if new.revision_number>1 then select * into p from content_revisions where id=new.predecessor_revision_id; if not found or p.content_item_id<>new.content_item_id or p.revision_number<>new.revision_number-1 then raise exception 'revision sequence gap or invalid predecessor' using errcode='23514'; end if; end if;
 if exists(select 1 from generate_series(1,(select max(revision_number) from content_revisions where content_item_id=new.content_item_id)) n where not exists(select 1 from content_revisions r where r.content_item_id=new.content_item_id and r.revision_number=n)) then raise exception 'revision sequence gap' using errcode='23514'; end if; return new; end $$;
drop trigger if exists ct_content_revisions__chain on content_revisions; create constraint trigger ct_content_revisions__chain after insert or update of content_item_id,predecessor_revision_id,revision_number on content_revisions deferrable initially immediate for each row execute function validate_revision_chain();

create or replace function enforce_m4_identity_and_immutability() returns trigger language plpgsql as $$ begin
 if new.id is distinct from old.id then raise exception 'M4 id is immutable' using errcode='23514'; end if;
 if tg_table_name='licenses' and (new.provider_code,new.license_key,new.version,new.effective_from) is distinct from (old.provider_code,old.license_key,old.version,old.effective_from) then raise exception 'license identity is immutable' using errcode='23514'; end if;
 if tg_table_name='works' and (new.canonical_key,new.work_type) is distinct from (old.canonical_key,old.work_type) then raise exception 'work identity is immutable' using errcode='23514'; end if;
 if tg_table_name='passages' and (new.work_id,new.canonical_locator) is distinct from (old.work_id,old.canonical_locator) then raise exception 'passage identity is immutable' using errcode='23514'; end if;
 if tg_table_name='content_items' and exists(select 1 from content_revisions where content_item_id=old.id) and (new.canonical_key,new.content_type,new.origin_kind,new.owning_module) is distinct from (old.canonical_key,old.content_type,old.origin_kind,old.owning_module) then raise exception 'content identity is immutable after first revision' using errcode='23514'; end if;
 return new; end $$;
drop trigger if exists tr_licenses__identity on licenses; create trigger tr_licenses__identity before update on licenses for each row execute function enforce_m4_identity_and_immutability();
drop trigger if exists tr_works__identity on works; create trigger tr_works__identity before update on works for each row execute function enforce_m4_identity_and_immutability();
drop trigger if exists tr_passages__identity on passages; create trigger tr_passages__identity before update on passages for each row execute function enforce_m4_identity_and_immutability();
drop trigger if exists tr_content_items__identity on content_items; create trigger tr_content_items__identity before update on content_items for each row execute function enforce_m4_identity_and_immutability();

create or replace function enforce_publication_rows() returns trigger language plpgsql as $$ declare lic licenses%rowtype; item content_items%rowtype; ed editions%rowtype; pass passages%rowtype; begin
 if tg_table_name='editions' then
  if old.publication_state in ('published','withdrawn') and (new.* is distinct from old.*) and not (old.publication_state='published' and new.publication_state='withdrawn' and new.updated_at is distinct from old.updated_at and (new.id,new.work_id,new.license_id,new.edition_key,new.version,new.language_code,new.script_code,new.display_name,new.provider_code,new.provider_edition_id,new.import_version,new.source_manifest_checksum,new.provider_metadata,new.published_at,new.created_at) is not distinct from (old.id,old.work_id,old.license_id,old.edition_key,old.version,old.language_code,old.script_code,old.display_name,old.provider_code,old.provider_edition_id,old.import_version,old.source_manifest_checksum,old.provider_metadata,old.published_at,old.created_at)) then raise exception 'published edition is immutable' using errcode='23514'; end if;
  if new.publication_state='published' and old.publication_state<>'published' then select * into lic from licenses where id=new.license_id; if lic.status<>'active' or lic.retention_policy='no_storage' or not lic.redistribution_allowed or new.published_at<lic.effective_from or (lic.effective_until is not null and new.published_at>=lic.effective_until) then raise exception 'edition license is not publication eligible' using errcode='23514'; end if; end if;
 elsif tg_table_name='passage_texts' then
  if old.publication_state in ('published','withdrawn') and not (old.publication_state='published' and new.publication_state='withdrawn' and (new.id,new.edition_id,new.passage_id,new.text_content,new.normalized_checksum,new.source_checksum,new.published_at,new.created_at) is not distinct from (old.id,old.edition_id,old.passage_id,old.text_content,old.normalized_checksum,old.source_checksum,old.published_at,old.created_at)) then raise exception 'published passage text is immutable' using errcode='23514'; end if;
  select e.* into ed from editions e where e.id=new.edition_id; select p.* into pass from passages p where p.id=new.passage_id; if ed.work_id<>pass.work_id then raise exception 'edition and passage works differ' using errcode='23514'; end if; if new.publication_state='published' and ed.publication_state<>'published' then raise exception 'passage text requires published edition' using errcode='23514'; end if;
 elsif tg_table_name='content_revisions' then
  if old.publication_state in ('published','withdrawn','superseded') and not (old.publication_state='published' and new.publication_state in ('withdrawn','superseded') and (new.id,new.content_item_id,new.predecessor_revision_id,new.revision_number,new.source_text,new.source_language_code,new.verification_state,new.provenance_kind,new.provider_code,new.provider_record_id,new.source_manifest_checksum,new.content_checksum,new.schema_version,new.lock_version,new.published_at,new.created_at) is not distinct from (old.id,old.content_item_id,old.predecessor_revision_id,old.revision_number,old.source_text,old.source_language_code,old.verification_state,old.provenance_kind,old.provider_code,old.provider_record_id,old.source_manifest_checksum,old.content_checksum,old.schema_version,old.lock_version,old.published_at,old.created_at)) then raise exception 'published revision is immutable' using errcode='23514'; end if;
  if new.publication_state='published' then select * into item from content_items where id=new.content_item_id; if (item.content_type='editorial_general_dua' and new.verification_state<>'editorial_only') or (item.content_type<>'editorial_general_dua' and new.verification_state<>'source_verified') then raise exception 'revision verification is not publication eligible' using errcode='23514'; end if; end if;
 end if; return new; end $$;
drop trigger if exists tr_editions__publication on editions; create trigger tr_editions__publication before update on editions for each row execute function enforce_publication_rows();
drop trigger if exists tr_passage_texts__publication on passage_texts; create trigger tr_passage_texts__publication before insert or update on passage_texts for each row execute function enforce_publication_rows();
drop trigger if exists tr_content_revisions__publication on content_revisions; create trigger tr_content_revisions__publication before update on content_revisions for each row execute function enforce_publication_rows();

create or replace function validate_source_reference_context() returns trigger language plpgsql as $$ begin
 if new.cited_edition_id is not null and not exists(select 1 from editions where id=new.cited_edition_id and work_id=new.cited_work_id) then raise exception 'cited edition belongs to another work' using errcode='23514'; end if;
 if new.cited_passage_id is not null and not exists(select 1 from passages where id=new.cited_passage_id and work_id=new.cited_work_id) then raise exception 'cited passage belongs to another work' using errcode='23514'; end if; return new; end $$;
drop trigger if exists tr_source_references__context on source_references; create trigger tr_source_references__context before insert or update on source_references for each row execute function validate_source_reference_context();

create or replace function enforce_source_reference_immutability() returns trigger language plpgsql as $$ begin
 if exists(select 1 from content_revisions where id=old.content_revision_id and publication_state in ('published','withdrawn','superseded')) then raise exception 'published provenance is immutable' using errcode='23514'; end if; if tg_op='DELETE' then return old; end if; return new; end $$;
drop trigger if exists tr_source_references__immutable_update on source_references; create trigger tr_source_references__immutable_update before update or delete on source_references for each row execute function enforce_source_reference_immutability();

create or replace function validate_revision_publication_sources() returns trigger language plpgsql as $$ declare rid uuid; r content_revisions%rowtype; item content_items%rowtype; begin
 rid:=case when tg_table_name='source_references' then coalesce(new.content_revision_id,old.content_revision_id) else new.id end; select * into r from content_revisions where id=rid; if not found or r.publication_state<>'published' then return coalesce(new,old); end if; select * into item from content_items where id=r.content_item_id;
 if item.content_type<>'editorial_general_dua' and not exists(select 1 from source_references where content_revision_id=rid and reference_role='primary_source') then raise exception 'published revision requires primary provenance' using errcode='23514'; end if; return coalesce(new,old); end $$;
drop trigger if exists ct_content_revisions__publication_sources on content_revisions; create constraint trigger ct_content_revisions__publication_sources after insert or update of publication_state on content_revisions deferrable initially deferred for each row execute function validate_revision_publication_sources();
drop trigger if exists ct_source_references__publication_sources on source_references; create constraint trigger ct_source_references__publication_sources after insert or update or delete on source_references deferrable initially deferred for each row execute function validate_revision_publication_sources();
