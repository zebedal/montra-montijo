import type { LucideIcon } from "lucide-react";

import {
  Apple,
  Baby,
  Beef,
  BookOpen,
  Brain,
  Building2,
  CalendarDays,
  Camera,
  Car,
  CarFront,
  Cake,
  Coffee,
  Disc3,
  Droplets,
  Dumbbell,
  Flower2,
  GraduationCap,
  HandCoins,
  Hammer,
  HardHat,
  HeartPulse,
  Hotel,
  Laptop,
  Paintbrush,
  PawPrint,
  Pill,
  Plug,
  Scissors,
  Shirt,
  ShoppingCart,
  Sparkles,
  Store,
  Stethoscope,
  Trees,
  UtensilsCrossed,
  Wrench,
  Eye,
  Fish,
  ShoppingBag,
  Home,
  Beer,
  School,
  Dog,
  Plane
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  // Setores
  "alimentacao-restauracao": UtensilsCrossed,
  comercio: Store,
  saude: HeartPulse,
  "beleza-bem-estar": Sparkles,
  servicos: Wrench,
  "casa-construcao": Home,
  automovel: Car,
  "educacao-formacao": GraduationCap,
  desporto: Dumbbell,
  "cultura-lazer-eventos": CalendarDays,
  "imobiliario-financas": Building2,
  "turismo-alojamento": Hotel,
  animais: PawPrint,

  // Alimentação
  restaurantes: UtensilsCrossed,
  cafes: Coffee,
  bares: Beer,
  "snack-bars": UtensilsCrossed,
  takeaway: ShoppingBag,
  padarias: Cake,
  pastelarias: Cake,
  supermercados: ShoppingCart,
  talhos: Beef,
  peixarias: Fish,
  frutarias: Apple,

  // Saúde
  "clinicas-medicas": HeartPulse,
  dentistas: Stethoscope,
  farmacias: Pill,
  fisioterapia: HeartPulse,
  psicologia: Brain,
  veterinarios: PawPrint,

  // Beleza
  cabeleireiros: Scissors,
  barbearias: Scissors,
  estetica: Sparkles,
  nails: Sparkles,
  spas: Flower2,

  // Automóvel
  stands: CarFront,
  oficinas: Wrench,
  pneus: Car,
  "lavagem-auto": Car,
  tecnologia: Laptop,

  // Casa
  eletricidade: Plug,
  canalizacao: Droplets,
  pintura: Paintbrush,
  reparacoes: Hammer,
  "construcao-remodelacoes": HardHat,
  jardinagem: Trees,
  mudancas: Building2,

  // Comércio
  "lojas-locais": Store,
  "lojas-especializadas": Store,
  "grossistas-distribuicao": ShoppingCart,
  roupa: Shirt,
  calcado: ShoppingBag,
  papelaria: BookOpen,
  oticas: Eye,
  lavandarias: Shirt,
  floristas: Flower2,

  // Educação
  "centros-estudo": GraduationCap,
  explicacoes: GraduationCap,
  formacao: GraduationCap,
  creches: Baby,
  atl: School,
  "atl-apoio-escolar": School,

  // Serviços financeiros
  "intermediacao-credito": HandCoins,

  // Eventos
  eventos: CalendarDays,
  dj: Disc3,
  fotografia: Camera,
  video: Camera,

  // Imobiliário
  imobiliario: Building2,
  arrendamento: Home,
  "mediacao-imobiliaria": Building2,

  // Novas categorias
  ginasios: Dumbbell,
  hoteis: Hotel,
  "lojas-animais": PawPrint,
  "pet-shop": Dog,
  "agencias-viagem": Plane
};
