-- AUD-ARC005-001 correction. Migration 0008's enforce_release_selector_activation()
-- fires only as BEFORE UPDATE OF is_active_release, so a row INSERTed directly
-- with is_active_release = true bypasses activation-eligibility validation
-- entirely. This redefines the function so the same eligibility checks
-- already approved for the false->true UPDATE path also run for
-- TG_OP = 'INSERT' with is_active_release = true, and rewires both triggers
-- to also fire BEFORE INSERT. No new eligibility rule is added; unrelated
-- updates to an already-active row are still not re-validated. Migration
-- 0008 is immutable and is not edited; this is a forward-only correction.
create or replace function enforce_release_selector_activation() returns trigger language plpgsql as $$
declare lic licenses%rowtype; ed editions%rowtype; loc locales%rowtype; activating boolean; begin
 if tg_op = 'INSERT' then
  activating := new.is_active_release;
 else
  activating := new.is_active_release and not old.is_active_release;
 end if;
 if activating then
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
create trigger tr_editions__release_selector_activation before insert or update of is_active_release on editions for each row execute function enforce_release_selector_activation();

drop trigger if exists tr_quran_translation_editions__release_selector_activation on quran_translation_editions;
create trigger tr_quran_translation_editions__release_selector_activation before insert or update of is_active_release on quran_translation_editions for each row execute function enforce_release_selector_activation();
