create or replace function enforce_m4_identity_and_immutability() returns trigger language plpgsql as $$ begin
 if new.id is distinct from old.id then raise exception 'M4 id is immutable' using errcode='23514'; end if;
 if tg_table_name='licenses' then
  if (new.provider_code,new.license_key,new.version,new.effective_from) is distinct from (old.provider_code,old.license_key,old.version,old.effective_from) then raise exception 'license identity is immutable' using errcode='23514'; end if;
  if old.status<>'draft' and (new.rights_scope,new.attribution_text,new.terms_url,new.retention_policy,new.retention_days,new.in_application_display_allowed,new.standalone_redistribution_allowed,new.derivatives_allowed,new.effective_until) is distinct from (old.rights_scope,old.attribution_text,old.terms_url,old.retention_policy,old.retention_days,old.in_application_display_allowed,old.standalone_redistribution_allowed,old.derivatives_allowed,old.effective_until) then raise exception 'license rights-bearing content is immutable after first reliance' using errcode='23514'; end if;
 elsif tg_table_name='works' then
  if (new.canonical_key,new.work_type) is distinct from (old.canonical_key,old.work_type) then raise exception 'work identity is immutable' using errcode='23514'; end if;
 elsif tg_table_name='passages' then
  if (new.work_id,new.canonical_locator) is distinct from (old.work_id,old.canonical_locator) then raise exception 'passage identity is immutable' using errcode='23514'; end if;
 elsif tg_table_name='content_items' then
  if exists(select 1 from content_revisions where content_item_id=old.id) and (new.canonical_key,new.content_type,new.origin_kind,new.owning_module) is distinct from (old.canonical_key,old.content_type,old.origin_kind,old.owning_module) then raise exception 'content identity is immutable after first revision' using errcode='23514'; end if;
 end if;
 return new; end $$;
