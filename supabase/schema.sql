-- ============================================================
-- つながる子育て家計簿 — Supabase スキーマ
-- ------------------------------------------------------------
-- 使い方: Supabase ダッシュボード → SQL Editor に貼り付けて実行
-- （既存の認証機能には影響しません。auth.users はそのまま利用します）
-- ============================================================

-- ---------- プロフィール ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  role text not null default 'parent' check (role in ('parent', 'grandparent')),
  created_at timestamptz not null default now()
);

-- ---------- 家族 ----------
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  family_code text not null unique,
  name text not null default 'うちの家族',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

-- 1ユーザーは1家族に参加（デモ用途の単純化）
create unique index if not exists family_members_user_id_key
  on public.family_members (user_id);

-- ---------- 支援項目 ----------
create table if not exists public.support_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  name text not null,
  price integer not null check (price > 0),
  category text not null check (category in ('学校', '習いごと', '生活', 'その他')),
  child_name text not null default '',
  memo text not null default '',
  own_contribution integer not null default 0 check (own_contribution >= 0),
  supported_amount integer not null default 0 check (supported_amount >= 0),
  created_at timestamptz not null default now(),
  constraint supported_amount_le_price check (supported_amount <= price)
);

create index if not exists support_items_family_id_idx
  on public.support_items (family_id);

-- ---------- 応援のきろく ----------
create table if not exists public.support_records (
  id uuid primary key default gen_random_uuid(),
  support_item_id uuid not null references public.support_items (id) on delete cascade,
  supporter_id uuid references public.profiles (id) on delete set null,
  amount integer not null check (amount > 0),
  message text,
  created_at timestamptz not null default now()
);

create index if not exists support_records_item_id_idx
  on public.support_records (support_item_id);

-- ============================================================
-- ヘルパー関数（security definer で RLS 再帰を回避）
-- ============================================================
create or replace function public.is_family_member(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where family_id = p_family_id and user_id = auth.uid()
  );
$$;

create or replace function public.shares_family(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members me
    join public.family_members other on other.family_id = me.family_id
    where me.user_id = auth.uid() and other.user_id = p_user_id
  );
$$;

create or replace function public.can_access_item(p_item_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.support_items si
    where si.id = p_item_id and public.is_family_member(si.family_id)
  );
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.support_items enable row level security;
alter table public.support_records enable row level security;

-- profiles: 本人と、同じ家族のメンバーのみ閲覧可
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.shares_family(id));

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- families: 家族のメンバーのみ閲覧可（作成・参加は RPC 経由）
drop policy if exists "families_select" on public.families;
create policy "families_select" on public.families
  for select using (public.is_family_member(id));

-- family_members: 同じ家族のメンバーと自分自身のみ閲覧可
drop policy if exists "family_members_select" on public.family_members;
create policy "family_members_select" on public.family_members
  for select using (user_id = auth.uid() or public.is_family_member(family_id));

drop policy if exists "family_members_delete" on public.family_members;
create policy "family_members_delete" on public.family_members
  for delete using (user_id = auth.uid());

-- support_items: 家族のメンバーのみ閲覧可（書き込みは RPC 経由）
drop policy if exists "support_items_select" on public.support_items;
create policy "support_items_select" on public.support_items
  for select using (public.is_family_member(family_id));

-- support_records: その項目にアクセスできる家族のみ閲覧可（書き込みは RPC 経由）
drop policy if exists "support_records_select" on public.support_records;
create policy "support_records_select" on public.support_records
  for select using (public.can_access_item(support_item_id));

-- ============================================================
-- RPC: 家族コードを発行して家族を作成
-- ============================================================
create or replace function public.create_family(p_name text default 'うちの家族')
returns public.families
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_family public.families;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if exists (select 1 from public.family_members where user_id = auth.uid()) then
    raise exception 'already_in_family';
  end if;

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.families where family_code = v_code);
  end loop;

  insert into public.families (family_code, name, created_by)
  values (v_code, coalesce(nullif(trim(p_name), ''), 'うちの家族'), auth.uid())
  returning * into v_family;

  insert into public.family_members (family_id, user_id)
  values (v_family.id, auth.uid());

  return v_family;
end;
$$;

-- ============================================================
-- RPC: 家族コードで家族に参加
-- ============================================================
create or replace function public.join_family_by_code(p_code text)
returns public.families
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family public.families;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if exists (select 1 from public.family_members where user_id = auth.uid()) then
    raise exception 'already_in_family';
  end if;

  select * into v_family
  from public.families
  where family_code = upper(trim(coalesce(p_code, '')));

  if not found then
    raise exception 'family_not_found';
  end if;

  insert into public.family_members (family_id, user_id)
  values (v_family.id, auth.uid());

  return v_family;
end;
$$;

-- ============================================================
-- RPC: 支援項目を作成（「種を植える」）
-- 自分が出せる額は、作成時に最初の応援のきろくとして記録する
-- ============================================================
create or replace function public.create_support_item(
  p_family_id uuid,
  p_name text,
  p_price integer,
  p_category text,
  p_child_name text default '',
  p_memo text default '',
  p_own integer default 0
)
returns public.support_items
language plpgsql
security definer
set search_path = public
as $$
declare
  v_own integer;
  v_item public.support_items;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_family_member(p_family_id) then
    raise exception 'not_a_member';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name_required';
  end if;

  if p_price is null or p_price <= 0 then
    raise exception 'invalid_price';
  end if;

  if p_category not in ('学校', '習いごと', '生活', 'その他') then
    raise exception 'invalid_category';
  end if;

  v_own := greatest(0, least(coalesce(p_own, 0), p_price));

  insert into public.support_items
    (family_id, created_by, name, price, category, child_name, memo, own_contribution, supported_amount)
  values
    (p_family_id, auth.uid(), trim(p_name), p_price, p_category,
     coalesce(trim(p_child_name), ''), coalesce(trim(p_memo), ''), v_own, v_own)
  returning * into v_item;

  if v_own > 0 then
    insert into public.support_records (support_item_id, supporter_id, amount, message)
    values (v_item.id, auth.uid(), v_own, '自分で用意できる分');
  end if;

  return v_item;
end;
$$;

-- ============================================================
-- RPC: 支援する（目標金額を超えないようサーバー側で上限を適用）
-- ============================================================
create or replace function public.add_support(
  p_item_id uuid,
  p_amount integer,
  p_message text default null
)
returns public.support_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.support_items;
  v_remaining integer;
  v_amount integer;
  v_record public.support_records;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_item from public.support_items where id = p_item_id;
  if not found then
    raise exception 'item_not_found';
  end if;

  if not public.is_family_member(v_item.family_id) then
    raise exception 'not_a_member';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  v_remaining := v_item.price - v_item.supported_amount;
  if v_remaining <= 0 then
    raise exception 'goal_already_reached';
  end if;

  -- 目標金額を超えないように調整する
  v_amount := least(p_amount, v_remaining);

  insert into public.support_records (support_item_id, supporter_id, amount, message)
  values (p_item_id, auth.uid(), v_amount, nullif(trim(coalesce(p_message, '')), ''))
  returning * into v_record;

  update public.support_items
     set supported_amount = supported_amount + v_amount
   where id = p_item_id;

  return v_record;
end;
$$;

-- ============================================================
-- 権限
-- ============================================================
revoke all on function public.create_family(text) from public, anon;
revoke all on function public.join_family_by_code(text) from public, anon;
revoke all on function public.create_support_item(uuid, text, integer, text, text, text, integer) from public, anon;
revoke all on function public.add_support(uuid, integer, text) from public, anon;

grant execute on function public.create_family(text) to authenticated;
grant execute on function public.join_family_by_code(text) to authenticated;
grant execute on function public.create_support_item(uuid, text, integer, text, text, text, integer) to authenticated;
grant execute on function public.add_support(uuid, integer, text) to authenticated;

grant select on public.profiles to authenticated;
grant select on public.families to authenticated;
grant select, delete on public.family_members to authenticated;
grant select on public.support_items to authenticated;
grant select on public.support_records to authenticated;
grant insert, update on public.profiles to authenticated;


