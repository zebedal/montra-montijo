alter table public.business_hours
add column if not exists period_order smallint not null default 0;

-- A versão anterior admitia apenas uma linha por dia. Remove apenas restrições
-- UNIQUE compostas exatamente por business_id e day, sem tocar na chave primária.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select constraint_data.conname
    from (
      select
        constraint_row.conname,
        array_agg(attribute.attname order by attribute.attname) as columns
      from pg_constraint constraint_row
      join unnest(constraint_row.conkey) as key_number(attnum) on true
      join pg_attribute attribute
        on attribute.attrelid = constraint_row.conrelid
       and attribute.attnum = key_number.attnum
      where constraint_row.conrelid = 'public.business_hours'::regclass
        and constraint_row.contype = 'u'
      group by constraint_row.conname
    ) as constraint_data
    where constraint_data.columns = array['business_id', 'day']::name[]
  loop
    execute format(
      'alter table public.business_hours drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

-- Algumas instalações podem ter a mesma regra criada como índice, em vez de
-- constraint. Remove esses índices legados depois das constraints.
do $$
declare
  index_name text;
begin
  for index_name in
    select index_data.index_name
    from (
      select
        index_row.indexrelid::regclass::text as index_name,
        array_agg(attribute.attname order by attribute.attname) as columns
      from pg_index index_row
      join unnest(index_row.indkey) as key_number(attnum) on true
      join pg_attribute attribute
        on attribute.attrelid = index_row.indrelid
       and attribute.attnum = key_number.attnum
      where index_row.indrelid = 'public.business_hours'::regclass
        and index_row.indisunique
        and not index_row.indisprimary
      group by index_row.indexrelid
    ) as index_data
    where index_data.columns = array['business_id', 'day']::name[]
  loop
    execute format('drop index if exists %s', index_name);
  end loop;
end $$;

create unique index if not exists business_hours_business_day_period_idx
on public.business_hours (business_id, day, period_order);

notify pgrst, 'reload schema';
