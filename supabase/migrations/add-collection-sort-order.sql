-- Run in Supabase SQL Editor: collection display order (1 = first on website)

alter table collections add column if not exists sort_order integer not null default 0;

create index if not exists idx_collections_sort_order on collections (sort_order asc);

with numbered as (
  select id, row_number() over (order by created_at asc) as rn
  from collections
)
update collections c
set sort_order = numbered.rn
from numbered
where c.id = numbered.id and c.sort_order = 0;
