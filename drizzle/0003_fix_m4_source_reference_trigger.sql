create or replace function validate_revision_publication_sources() returns trigger language plpgsql as $$
declare
 rid uuid;
 r content_revisions%rowtype;
 item content_items%rowtype;
begin
 if tg_table_name = 'source_references' then
  if tg_op = 'DELETE' then
   rid := old.content_revision_id;
  else
   rid := new.content_revision_id;
  end if;
 else
  rid := new.id;
 end if;

 select * into r from content_revisions where id = rid;
 if not found or r.publication_state <> 'published' then
  if tg_op = 'DELETE' then return old; end if;
  return new;
 end if;

 select * into item from content_items where id = r.content_item_id;
 if item.content_type <> 'editorial_general_dua'
    and not exists(
      select 1
      from source_references
      where content_revision_id = rid
        and reference_role = 'primary_source'
    ) then
  raise exception 'published revision requires primary provenance' using errcode = '23514';
 end if;

 if tg_op = 'DELETE' then return old; end if;
 return new;
end $$;
