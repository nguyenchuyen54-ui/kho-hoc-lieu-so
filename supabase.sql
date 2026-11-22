-- Chạy toàn bộ trong Supabase > SQL Editor > New query > Run.
create extension if not exists pgcrypto;
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 1 and 180),
 description text not null default '',
 grade text not null check (grade in ('Lớp 1','Lớp 2','Lớp 3','Lớp 4','Lớp 5')),
 category text not null,
 image_url text,
 image_path text,
 file_path text not null,
 created_at timestamptz not null default now()
);
create index if not exists posts_created_idx on public.posts(created_at desc);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.admins where user_id=(select auth.uid())) $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
alter table public.admins enable row level security;
alter table public.posts enable row level security;
drop policy if exists "admins can read self" on public.admins;
create policy "admins can read self" on public.admins for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "public read posts" on public.posts;
create policy "public read posts" on public.posts for select to anon,authenticated using (true);
drop policy if exists "admin insert posts" on public.posts;
create policy "admin insert posts" on public.posts for insert to authenticated with check (public.is_admin());
drop policy if exists "admin update posts" on public.posts;
create policy "admin update posts" on public.posts for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete posts" on public.posts;
create policy "admin delete posts" on public.posts for delete to authenticated using (public.is_admin());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('covers','covers',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('documents','documents',false,20971520,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png','image/webp','video/mp4','application/octet-stream']) on conflict (id) do update set public=false,file_size_limit=20971520,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "admin upload covers" on storage.objects;
create policy "admin upload covers" on storage.objects for insert to authenticated with check (bucket_id='covers' and public.is_admin());
drop policy if exists "admin delete covers" on storage.objects;
create policy "admin delete covers" on storage.objects for delete to authenticated using (bucket_id='covers' and public.is_admin());
drop policy if exists "admin upload documents" on storage.objects;
create policy "admin upload documents" on storage.objects for insert to authenticated with check (bucket_id='documents' and public.is_admin());
drop policy if exists "admin delete documents" on storage.objects;
create policy "admin delete documents" on storage.objects for delete to authenticated using (bucket_id='documents' and public.is_admin());
drop policy if exists "public download documents" on storage.objects;
create policy "public download documents" on storage.objects for select to anon,authenticated using (bucket_id='documents');
-- SAU KHI TẠO USER trong Authentication > Users, thay UUID và chạy riêng:
-- insert into public.admins(user_id) values ('THAY_UUID_USER_VAO_DAY');
