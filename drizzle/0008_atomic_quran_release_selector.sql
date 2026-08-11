alter table editions
  add column if not exists is_active_release boolean not null default false;

alter table quran_translation_editions
  add column if not exists is_active_release boolean not null default false;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_editions__active_release') then
    alter table editions
      add constraint ck_editions__active_release
      check (not is_active_release or publication_state = 'published');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ck_quran_translation_editions__active_release') then
    alter table quran_translation_editions
      add constraint ck_quran_translation_editions__active_release
      check (not is_active_release or review_status = 'approved');
  end if;
end $$;

create unique index if not exists uq_editions__active_release_per_work
  on editions (work_id)
  where is_active_release and publication_state = 'published';

create unique index if not exists uq_quran_translation_editions__active_release_per_locale
  on quran_translation_editions (locale_id)
  where is_active_release and review_status = 'approved';

-- Redefine enforce_publication_rows() (migration 0002, last replaced by
-- migration 0005) solely to exempt is_active_release from the editions
-- post-publication immutability freeze, per ADR-0006's immutability
-- exemption. The editions branch's content-freeze and one-way
-- publication_state-transition checks are otherwise unchanged in effect, and
-- the passage_texts / content_revisions branches are byte-identical to the
-- migration 0005 definition.
create or replace function enforce_publication_rows() returns trigger language plpgsql as $$ declare lic licenses%rowtype; item content_items%rowtype; ed editions%rowtype; pass passages%rowtype; begin
 if tg_table_name='editions' then
  if old.publication_state in ('published','withdrawn') and (new.id,new.work_id,new.license_id,new.edition_key,new.version,new.language_code,new.script_code,new.display_name,new.provider_code,new.provider_edition_id,new.import_version,new.source_manifest_checksum,new.provider_metadata,new.published_at,new.created_at) is distinct from (old.id,old.work_id,old.license_id,old.edition_key,old.version,old.language_code,old.script_code,old.display_name,old.provider_code,old.provider_edition_id,old.import_version,old.source_manifest_checksum,old.provider_metadata,old.published_at,old.created_at) then raise exception 'published edition is immutable' using errcode='23514'; end if;
  if old.publication_state in ('published','withdrawn') and new.publication_state is distinct from old.publication_state and not (old.publication_state='published' and new.publication_state='withdrawn') then raise exception 'published edition is immutable' using errcode='23514'; end if;
  if new.publication_state='published' and old.publication_state<>'published' then select * into lic from licenses where id=new.license_id; if lic.status<>'active' or lic.retention_policy='no_storage' or not lic.in_application_display_allowed or new.published_at<lic.effective_from or (lic.effective_until is not null and new.published_at>=lic.effective_until) then raise exception 'edition license is not publication eligible' using errcode='23514'; end if; end if;
 elsif tg_table_name='passage_texts' then
  if old.publication_state in ('published','withdrawn') and not (old.publication_state='published' and new.publication_state='withdrawn' and (new.id,new.edition_id,new.passage_id,new.text_content,new.normalized_checksum,new.source_checksum,new.published_at,new.created_at) is not distinct from (old.id,old.edition_id,old.passage_id,old.text_content,old.normalized_checksum,old.source_checksum,old.published_at,old.created_at)) then raise exception 'published passage text is immutable' using errcode='23514'; end if;
  select e.* into ed from editions e where e.id=new.edition_id; select p.* into pass from passages p where p.id=new.passage_id; if ed.work_id<>pass.work_id then raise exception 'edition and passage works differ' using errcode='23514'; end if; if new.publication_state='published' and ed.publication_state<>'published' then raise exception 'passage text requires published edition' using errcode='23514'; end if;
 elsif tg_table_name='content_revisions' then
  if old.publication_state in ('published','withdrawn','superseded') and not (old.publication_state='published' and new.publication_state in ('withdrawn','superseded') and (new.id,new.content_item_id,new.predecessor_revision_id,new.revision_number,new.source_text,new.source_language_code,new.verification_state,new.provenance_kind,new.provider_code,new.provider_record_id,new.source_manifest_checksum,new.content_checksum,new.schema_version,new.lock_version,new.published_at,new.created_at) is not distinct from (old.id,old.content_item_id,old.predecessor_revision_id,old.revision_number,old.source_text,old.source_language_code,old.verification_state,old.provenance_kind,old.provider_code,old.provider_record_id,old.source_manifest_checksum,old.content_checksum,old.schema_version,old.lock_version,old.published_at,old.created_at)) then raise exception 'published revision is immutable' using errcode='23514'; end if;
  if new.publication_state='published' then select * into item from content_items where id=new.content_item_id; if (item.content_type='editorial_general_dua' and new.verification_state<>'editorial_only') or (item.content_type<>'editorial_general_dua' and new.verification_state<>'source_verified') then raise exception 'revision verification is not publication eligible' using errcode='23514'; end if; end if;
 end if; return new; end $$;

-- ARC-005 activation-time eligibility validation (ADR-0006 "Activation
-- validation"). Fires only on the false->true transition of is_active_release
-- (a deactivation is always permitted; the existing CHECK constraints above
-- already forbid an ineligible row from being marked active in any case).
-- This is a same-table BEFORE trigger validating referenced rows at the
-- moment of write, matching the existing enforce_publication_rows() pattern;
-- it is not a cross-layer trigger attached to licenses or editions reaching
-- into unrelated state, and it never fires except on an explicit selector
-- write (ADR-0006 "Upstream eligibility loss").
create or replace function enforce_release_selector_activation() returns trigger language plpgsql as $$
declare lic licenses%rowtype; ed editions%rowtype; loc locales%rowtype; begin
 if new.is_active_release and not old.is_active_release then
  if tg_table_name='editions' then
   if new.publication_state<>'published' then raise exception 'Arabic release activation requires a published edition' using errcode='23514'; end if;
   select * into lic from licenses where id=new.license_id;
   if lic.status<>'active' or lic.retention_policy='no_storage' or not lic.in_application_display_allowed or current_timestamp<lic.effective_from or (lic.effective_until is not null and current_timestamp>=lic.effective_until) then
    raise exception 'Arabic release activation requires a currently eligible license' using errcode='23514';
   end if;
  elsif tg_table_name='quran_translation_editions' then
   if new.review_status<>'approved' then raise exception 'translation release activation requires an approved translation edition' using errcode='23514'; end if;
   select * into ed from editions where id=new.edition_id;
   if ed.publication_state<>'published' then raise exception 'translation release activation requires a published backing edition' using errcode='23514'; end if;
   select * into lic from licenses where id=new.license_id;
   if lic.status<>'active' or lic.retention_policy='no_storage' or not lic.in_application_display_allowed or current_timestamp<lic.effective_from or (lic.effective_until is not null and current_timestamp>=lic.effective_until) then
    raise exception 'translation release activation requires a currently eligible license' using errcode='23514';
   end if;
   select * into loc from locales where id=new.locale_id;
   if not loc.is_enabled then raise exception 'translation release activation requires an enabled locale' using errcode='23514'; end if;
  end if;
 end if; return new; end $$;

drop trigger if exists tr_editions__release_selector_activation on editions;
create trigger tr_editions__release_selector_activation before update of is_active_release on editions for each row execute function enforce_release_selector_activation();

drop trigger if exists tr_quran_translation_editions__release_selector_activation on quran_translation_editions;
create trigger tr_quran_translation_editions__release_selector_activation before update of is_active_release on quran_translation_editions for each row execute function enforce_release_selector_activation();
