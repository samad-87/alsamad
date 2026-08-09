do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'licenses'
      and column_name = 'redistribution_allowed'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'licenses'
      and column_name = 'standalone_redistribution_allowed'
  ) then
    alter table licenses rename column redistribution_allowed to standalone_redistribution_allowed;
  end if;
end $$;

alter table licenses
  add column if not exists in_application_display_allowed boolean not null default false;

create or replace function enforce_publication_rows() returns trigger language plpgsql as $$ declare lic licenses%rowtype; item content_items%rowtype; ed editions%rowtype; pass passages%rowtype; begin
 if tg_table_name='editions' then
  if old.publication_state in ('published','withdrawn') and (new.* is distinct from old.*) and not (old.publication_state='published' and new.publication_state='withdrawn' and new.updated_at is distinct from old.updated_at and (new.id,new.work_id,new.license_id,new.edition_key,new.version,new.language_code,new.script_code,new.display_name,new.provider_code,new.provider_edition_id,new.import_version,new.source_manifest_checksum,new.provider_metadata,new.published_at,new.created_at) is not distinct from (old.id,old.work_id,old.license_id,old.edition_key,old.version,old.language_code,old.script_code,old.display_name,old.provider_code,old.provider_edition_id,old.import_version,old.source_manifest_checksum,old.provider_metadata,old.published_at,old.created_at)) then raise exception 'published edition is immutable' using errcode='23514'; end if;
  if new.publication_state='published' and old.publication_state<>'published' then select * into lic from licenses where id=new.license_id; if lic.status<>'active' or lic.retention_policy='no_storage' or not lic.in_application_display_allowed or new.published_at<lic.effective_from or (lic.effective_until is not null and new.published_at>=lic.effective_until) then raise exception 'edition license is not publication eligible' using errcode='23514'; end if; end if;
 elsif tg_table_name='passage_texts' then
  if old.publication_state in ('published','withdrawn') and not (old.publication_state='published' and new.publication_state='withdrawn' and (new.id,new.edition_id,new.passage_id,new.text_content,new.normalized_checksum,new.source_checksum,new.published_at,new.created_at) is not distinct from (old.id,old.edition_id,old.passage_id,old.text_content,old.normalized_checksum,old.source_checksum,old.published_at,old.created_at)) then raise exception 'published passage text is immutable' using errcode='23514'; end if;
  select e.* into ed from editions e where e.id=new.edition_id; select p.* into pass from passages p where p.id=new.passage_id; if ed.work_id<>pass.work_id then raise exception 'edition and passage works differ' using errcode='23514'; end if; if new.publication_state='published' and ed.publication_state<>'published' then raise exception 'passage text requires published edition' using errcode='23514'; end if;
 elsif tg_table_name='content_revisions' then
  if old.publication_state in ('published','withdrawn','superseded') and not (old.publication_state='published' and new.publication_state in ('withdrawn','superseded') and (new.id,new.content_item_id,new.predecessor_revision_id,new.revision_number,new.source_text,new.source_language_code,new.verification_state,new.provenance_kind,new.provider_code,new.provider_record_id,new.source_manifest_checksum,new.content_checksum,new.schema_version,new.lock_version,new.published_at,new.created_at) is not distinct from (old.id,old.content_item_id,old.predecessor_revision_id,old.revision_number,old.source_text,old.source_language_code,old.verification_state,old.provenance_kind,old.provider_code,old.provider_record_id,old.source_manifest_checksum,old.content_checksum,old.schema_version,old.lock_version,old.published_at,old.created_at)) then raise exception 'published revision is immutable' using errcode='23514'; end if;
  if new.publication_state='published' then select * into item from content_items where id=new.content_item_id; if (item.content_type='editorial_general_dua' and new.verification_state<>'editorial_only') or (item.content_type<>'editorial_general_dua' and new.verification_state<>'source_verified') then raise exception 'revision verification is not publication eligible' using errcode='23514'; end if; end if;
 end if; return new; end $$;
