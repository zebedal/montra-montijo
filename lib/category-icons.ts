import type { LucideIcon } from "lucide-react";

import {
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
  Hammer,
  HeartPulse,
  Hotel,
  Laptop,
  Paintbrush,
  PawPrint,
  Pill,
  Plug,
  Scissors,
  Shirt,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Store,
  Stethoscope,
  Trees,
  UtensilsCrossed,
  Wrench,
  Eye,
  ShoppingBag,
  Home,
  Beer,
  School,
  Dog,
  Plane
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  // Alimentação
  restaurantes: UtensilsCrossed,
  cafes: Coffee,
  bares: Beer,
  "snack-bars": UtensilsCrossed,
  takeaway: ShoppingBag,
  padarias: Cake,
  pastelarias: Cake,
  supermercados: ShoppingCart,
  talhos: ShoppingBasket,
  peixarias: ShoppingBasket,
  frutarias: ShoppingBasket,

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
  jardinagem: Trees,
  mudancas: Building2,

  // Comércio
  "lojas-locais": Store,
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
  atl: School,
  "atl-apoio-escolar": School,

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
