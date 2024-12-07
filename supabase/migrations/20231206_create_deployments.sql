-- Create deployments table
create table if not exists public.deployments (
    id uuid default gen_random_uuid() primary key,
    container_id text not null,
    code text not null,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger handle_deployments_updated_at
    before update on public.deployments
    for each row
    execute function public.handle_updated_at();
