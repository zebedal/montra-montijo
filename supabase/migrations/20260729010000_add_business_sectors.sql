create table if not exists public.business_sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories
  add column if not exists sector_id uuid
  references public.business_sectors(id) on delete restrict;

create index if not exists categories_sector_id_idx
  on public.categories(sector_id);

alter table public.business_sectors enable row level security;

drop policy if exists "Setores são públicos" on public.business_sectors;
create policy "Setores são públicos"
on public.business_sectors for select using (true);

insert into public.business_sectors (slug, name, description, position)
values
  ('alimentacao-restauracao', 'Alimentação e restauração', 'Restaurantes, cafés, pastelarias, comércio alimentar e outros espaços de alimentação.', 0),
  ('comercio', 'Comércio', 'Lojas, retalho, grossistas e comércio especializado no concelho do Montijo.', 1),
  ('saude', 'Saúde', 'Clínicas, profissionais de saúde, farmácias e cuidados especializados.', 2),
  ('beleza-bem-estar', 'Beleza e bem-estar', 'Cabeleireiros, barbearias, estética, unhas, spas e bem-estar.', 3),
  ('servicos', 'Serviços', 'Serviços pessoais, empresariais, criativos, mudanças, limpezas e assistência.', 4),
  ('casa-construcao', 'Casa e construção', 'Construção, remodelações, reparações, jardinagem e manutenção da casa.', 5),
  ('automovel', 'Automóvel', 'Oficinas, stands, pneus, lavagem e outros serviços automóveis.', 6),
  ('educacao-formacao', 'Educação e formação', 'Creches, centros de estudo, explicações, escolas e formação.', 7),
  ('desporto', 'Desporto', 'Ginásios, clubes, treino, atividade física e desporto.', 8),
  ('cultura-lazer-eventos', 'Cultura, lazer e eventos', 'Eventos, música, animação, cultura e experiências de lazer.', 9),
  ('tecnologia', 'Tecnologia', 'Tecnologia, informática, software, telecomunicações e assistência técnica.', 10),
  ('imobiliario-financas', 'Imobiliário e finanças', 'Imobiliário, crédito, seguros e serviços financeiros.', 11),
  ('turismo-alojamento', 'Turismo e alojamento', 'Hotéis, alojamento, turismo e agências de viagens.', 12),
  ('animais', 'Animais', 'Veterinários, lojas para animais e outros serviços dedicados aos animais.', 13)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  position = excluded.position;

insert into public.categories (name, slug, search_terms)
values
  ('Grossistas e distribuição', 'grossistas-distribuicao', array['grossista', 'grossista alimentar', 'cash and carry', 'cash & carry', 'distribuição', 'fornecedores horeca']),
  ('Lojas especializadas', 'lojas-especializadas', array['loja de música', 'instrumentos musicais', 'lojas especializadas', 'comércio especializado'])
on conflict (slug) do update set
  name = excluded.name,
  search_terms = excluded.search_terms;

with mapping(category_slug, sector_slug) as (
  values
    ('bares', 'alimentacao-restauracao'),
    ('cafes', 'alimentacao-restauracao'),
    ('frutarias', 'alimentacao-restauracao'),
    ('padarias', 'alimentacao-restauracao'),
    ('pastelarias', 'alimentacao-restauracao'),
    ('peixarias', 'alimentacao-restauracao'),
    ('restaurantes', 'alimentacao-restauracao'),
    ('snack-bars', 'alimentacao-restauracao'),
    ('supermercados', 'alimentacao-restauracao'),
    ('takeaway', 'alimentacao-restauracao'),
    ('talhos', 'alimentacao-restauracao'),
    ('calcado', 'comercio'),
    ('floristas', 'comercio'),
    ('grossistas-distribuicao', 'comercio'),
    ('lojas-especializadas', 'comercio'),
    ('lojas-locais', 'comercio'),
    ('papelarias', 'comercio'),
    ('roupa', 'comercio'),
    ('clinicas-medicas', 'saude'),
    ('dentistas', 'saude'),
    ('farmacias', 'saude'),
    ('fisioterapia', 'saude'),
    ('oticas', 'saude'),
    ('psicologia', 'saude'),
    ('barbearias', 'beleza-bem-estar'),
    ('cabeleireiros', 'beleza-bem-estar'),
    ('estetica', 'beleza-bem-estar'),
    ('nails', 'beleza-bem-estar'),
    ('spas', 'beleza-bem-estar'),
    ('fotografia', 'servicos'),
    ('lavandarias', 'servicos'),
    ('limpezas', 'servicos'),
    ('mudancas', 'servicos'),
    ('video', 'servicos'),
    ('canalizacao', 'casa-construcao'),
    ('construcao-remodelacoes', 'casa-construcao'),
    ('eletricidade', 'casa-construcao'),
    ('jardinagem', 'casa-construcao'),
    ('pintura', 'casa-construcao'),
    ('reparacoes', 'casa-construcao'),
    ('lavagem-auto', 'automovel'),
    ('oficinas', 'automovel'),
    ('pneus', 'automovel'),
    ('stands', 'automovel'),
    ('centros-estudo', 'educacao-formacao'),
    ('creches', 'educacao-formacao'),
    ('explicacoes', 'educacao-formacao'),
    ('formacao', 'educacao-formacao'),
    ('ginasios', 'desporto'),
    ('dj', 'cultura-lazer-eventos'),
    ('eventos', 'cultura-lazer-eventos'),
    ('tecnologia', 'tecnologia'),
    ('imobiliarias', 'imobiliario-financas'),
    ('intermediacao-credito', 'imobiliario-financas'),
    ('agencias-viagem', 'turismo-alojamento'),
    ('hoteis', 'turismo-alojamento'),
    ('lojas-animais', 'animais'),
    ('veterinarios', 'animais')
)
update public.categories
set sector_id = business_sectors.id
from mapping
join public.business_sectors
  on business_sectors.slug = mapping.sector_slug
where categories.slug = mapping.category_slug;

with seed(category_slug, specialty_slug, specialty_name, position) as (
  values
    ('grossistas-distribuicao', 'grossista-alimentar', 'Grossista alimentar', 0),
    ('grossistas-distribuicao', 'cash-carry', 'Cash & Carry', 1),
    ('grossistas-distribuicao', 'distribuicao', 'Distribuição', 2),
    ('grossistas-distribuicao', 'produtos-alimentares', 'Produtos alimentares', 3),
    ('grossistas-distribuicao', 'bebidas', 'Bebidas', 4),
    ('grossistas-distribuicao', 'fornecimento-horeca', 'Fornecimento para hotelaria e restauração', 5),
    ('lojas-especializadas', 'instrumentos-musicais', 'Instrumentos musicais', 0),
    ('lojas-especializadas', 'acessorios-musicais', 'Acessórios musicais', 1),
    ('lojas-especializadas', 'discos-musica', 'Discos e música', 2),
    ('lojas-especializadas', 'reparacao-instrumentos', 'Reparação de instrumentos', 3)
)
insert into public.specialties (slug, name)
select distinct specialty_slug, specialty_name
from seed
on conflict (slug) do update set name = excluded.name;

with seed(category_slug, specialty_slug, position) as (
  values
    ('grossistas-distribuicao', 'grossista-alimentar', 0),
    ('grossistas-distribuicao', 'cash-carry', 1),
    ('grossistas-distribuicao', 'distribuicao', 2),
    ('grossistas-distribuicao', 'produtos-alimentares', 3),
    ('grossistas-distribuicao', 'bebidas', 4),
    ('grossistas-distribuicao', 'fornecimento-horeca', 5),
    ('lojas-especializadas', 'instrumentos-musicais', 0),
    ('lojas-especializadas', 'acessorios-musicais', 1),
    ('lojas-especializadas', 'discos-musica', 2),
    ('lojas-especializadas', 'reparacao-instrumentos', 3)
)
insert into public.category_specialties (category_id, specialty_id, position)
select categories.id, specialties.id, seed.position
from seed
join public.categories on categories.slug = seed.category_slug
join public.specialties on specialties.slug = seed.specialty_slug
on conflict (category_id, specialty_id)
do update set position = excluded.position;

notify pgrst, 'reload schema';
