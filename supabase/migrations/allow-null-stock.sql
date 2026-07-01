-- Run once in Supabase SQL Editor if product insert fails with:
-- null value in column "stock" violates not-null constraint

alter table products alter column stock drop not null;
alter table products alter column stock drop default;

alter table products drop constraint if exists products_stock_check;
alter table products add constraint products_stock_check check (stock is null or stock >= 0);
