create or replace function enforce_m5_publication() returns trigger language plpgsql as $$
declare e editions%rowtype; s quran_surahs%rowtype; begin
 if new.publication_state='published' and old.publication_state<>'published' then
  if tg_table_name='quran_surahs' then
   if (
    (select count(*) from quran_surahs where work_id=new.work_id)<>114
    or exists(select 1 from quran_surahs qs where qs.work_id=new.work_id and (select count(*) from quran_ayahs qa where qa.surah_id=qs.id)<>qs.ayah_count)
    or (select min(qa.global_sequence_number) from quran_ayahs qa join quran_surahs qs on qs.id=qa.surah_id where qs.work_id=new.work_id)<>1
    or (select max(qa.global_sequence_number) from quran_ayahs qa join quran_surahs qs on qs.id=qa.surah_id where qs.work_id=new.work_id)<>(select count(*) from quran_ayahs qa join quran_surahs qs on qs.id=qa.surah_id where qs.work_id=new.work_id)
    or not exists(select 1 from editions where work_id=new.work_id and publication_state='published')
   ) then raise exception 'Quran surah publication is not eligible' using errcode='23514'; end if;
  elsif tg_table_name='quran_ayahs' then
   select * into s from quran_surahs where id=new.surah_id; if s.publication_state<>'published' then raise exception 'Quran ayah publication is not eligible' using errcode='23514'; end if;
  elsif tg_table_name='quran_structural_markers' then
   select * into e from editions where id=new.edition_id; if e.publication_state<>'published' then raise exception 'Quran marker publication is not eligible' using errcode='23514'; end if;
  end if;
 end if; return new; end $$;
