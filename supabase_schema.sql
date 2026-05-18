-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  display_name text,
  handle text,
  date_of_birth text,
  height numeric default 0,
  weight numeric default 0,
  age integer default 0,
  bmi numeric default 0,
  fitness_goal text,
  diet_preference text,
  equipment_access text,
  is_onboarded boolean default false,
  streak integer default 0,
  last_streak_date text,
  photo_url text,
  bmi_history jsonb default '[]'::jsonb,
  measurements jsonb default '[]'::jsonb,
  progress_photos jsonb default '[]'::jsonb,
  targets_nutrition jsonb,
  targets_workout_split text,
  plan_weekly_schedule jsonb,
  allowFollow boolean default true,
  twoFAEnabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EXERCISES
create table if not exists public.exercises (
  id text primary key,
  name text not null,
  category text,
  muscleGroups jsonb,
  equipment text,
  difficulty text,
  purpose text,
  instructions jsonb
);

-- WORKOUTS
create table if not exists public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date text not null,
  notes text,
  durationMin integer,
  calories integer,
  exercises jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROUTINES
create table if not exists public.routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  exercises jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NUTRITION LOGS
create table if not exists public.nutrition_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date text not null,
  meals jsonb default '[]'::jsonb,
  waterMl integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- GENERATED PLANS
create table if not exists public.generated_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date text not null,
  plan jsonb not null,
  saved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- RLS RULES (Optional but recommended)
-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.routines enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.generated_plans enable row level security;

-- Create Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
create policy "Users can delete own profile." on public.profiles for delete using (auth.uid() = id);

create policy "Exercises are viewable by everyone." on public.exercises for select using (true);
create policy "Exercises can be inserted by everyone." on public.exercises for insert with check (true);
create policy "Exercises can be updated by everyone." on public.exercises for update using (true);

create policy "Users can view own workouts." on public.workouts for select using (auth.uid() = user_id);
create policy "Users can insert own workouts." on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users can update own workouts." on public.workouts for update using (auth.uid() = user_id);
create policy "Users can delete own workouts." on public.workouts for delete using (auth.uid() = user_id);

create policy "Users can view own routines." on public.routines for select using (auth.uid() = user_id);
create policy "Users can insert own routines." on public.routines for insert with check (auth.uid() = user_id);
create policy "Users can update own routines." on public.routines for update using (auth.uid() = user_id);
create policy "Users can delete own routines." on public.routines for delete using (auth.uid() = user_id);

create policy "Users can view own nutrition logs." on public.nutrition_logs for select using (auth.uid() = user_id);
create policy "Users can insert own nutrition logs." on public.nutrition_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own nutrition logs." on public.nutrition_logs for update using (auth.uid() = user_id);

create policy "Users can view own generated plans." on public.generated_plans for select using (auth.uid() = user_id);
create policy "Users can insert own generated plans." on public.generated_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own generated plans." on public.generated_plans for update using (auth.uid() = user_id);

-- STORAGE BUCKET
insert into storage.buckets (id, name, public) values ('progress', 'progress', true);
create policy "Public Access" on storage.objects for select using (bucket_id = 'progress');
create policy "Authenticated users can upload photos" on storage.objects for insert with check (bucket_id = 'progress' and auth.role() = 'authenticated');
