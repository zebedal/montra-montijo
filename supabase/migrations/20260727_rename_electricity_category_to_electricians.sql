update public.categories
set
  name = 'Eletricistas',
  search_terms = array[
    'eletricista',
    'eletricistas',
    'eletricidade',
    'instalação elétrica',
    'instalacao eletrica',
    'instalações elétricas',
    'instalacoes eletricas',
    'reparação elétrica',
    'reparacao eletrica',
    'reparações elétricas',
    'reparacoes eletricas',
    'avaria elétrica',
    'avaria eletrica',
    'avarias elétricas',
    'avarias eletricas',
    'quadro elétrico',
    'quadro eletrico',
    'quadros elétricos',
    'quadros eletricos',
    'tomadas',
    'iluminação',
    'iluminacao'
  ]
where slug = 'eletricidade';
