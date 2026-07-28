import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

import { createSlug } from "../lib/utils";
import { geocodeFirstMatchingAddress } from "../lib/geocoding";

type Candidate = {
  category: string;
  name: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  street: string;
  number?: string;
  postalCode: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  source: string;
};

const candidates: Candidate[] = [
  { category: "cafes", name: "Café da Praça", description: "Café localizado na Praça da República, no centro do Montijo.", street: "Praça da República", postalCode: "2870-235", latitude: 38.705438, longitude: -8.9744691, source: "https://www.openstreetmap.org/way/328680384" },
  { category: "cafes", name: "Café Cinema", description: "Café situado na Rua Joaquim de Almeida, na Baixa do Montijo.", street: "Rua Joaquim de Almeida", postalCode: "2870-161", latitude: 38.7061423, longitude: -8.9706037, source: "https://www.openstreetmap.org/way/328680386" },
  { category: "cafes", name: "Café Tamar", description: "Café local situado na Rua Alexandre Herculano, no Montijo.", street: "Rua Alexandre Herculano", postalCode: "2870-117", latitude: 38.7063986, longitude: -8.9783438, source: "https://www.openstreetmap.org/way/1047797514" },

  { category: "pastelarias", name: "Gaya Gelato", description: "Gelataria e pastelaria artesanal com produção diária no Montijo.", website: "https://www.gayagelato.com/", street: "Rua Miguel Pais", number: "34, r/c", postalCode: "2870-356", source: "https://baixadomontijo.pt/cat/pastelarias/" },
  { category: "pastelarias", name: "Pastelaria Coppelia", description: "Pastelaria localizada na Praça da República, na Baixa do Montijo.", street: "Praça da República", number: "26", postalCode: "2870-235", source: "https://baixadomontijo.pt/cat/pastelarias/" },
  { category: "pastelarias", name: "Pastelaria Searinha", description: "Pastelaria situada na Avenida dos Pescadores, no Montijo.", phone: "216 096 097", street: "Avenida dos Pescadores", number: "91", postalCode: "2870-114", source: "https://www.openstreetmap.org/" },

  { category: "farmacias", name: "Farmácia Fórum Montijo", description: "Farmácia localizada no centro comercial Alegro Montijo.", phone: "212 321 053", email: "encomendas@farmaciaforummontijo.pt", website: "https://www.farmaciaforummontijo.pt/", street: "Rua da Azinheira", number: "Alegro Montijo, Loja 0.37", postalCode: "2870-100", source: "https://www.farmaciaforummontijo.pt/" },
  { category: "farmacias", name: "Farmácia União Mutualista", description: "Farmácia da União Mutualista Nossa Senhora da Conceição no centro do Montijo.", phone: "212 320 345", website: "https://umutualista.pt/servicos/farmacia-uniao-mutualista/", street: "Rua Almirante Cândido dos Reis", number: "91/93", postalCode: "2870-253", source: "https://umutualista.pt/servicos/farmacia-uniao-mutualista/" },
  { category: "farmacias", name: "Farmácia Moderna Montijo", description: "Farmácia situada no Bogaris Retail Park, junto às Portas da Cidade.", phone: "915 990 767", email: "gestao@modernamontijo.pt", street: "Avenida das Portas da Cidade", number: "Bogaris Retail Park", postalCode: "2870-448", source: "https://play.google.com/store/apps/details?id=com.manuelacola.modernamontijo" },

  { category: "ginasios", name: "PumpAddicted", description: "Ginásio e health club no Montijo com sala de treino, aulas de grupo e piscina.", phone: "961 096 016", email: "geral@pumpaddicted.pt", website: "https://pumpaddicted.pt/", street: "Rua Manuel Neves Nunes de Almeida", number: "52", postalCode: "2870-352", latitude: 38.7042, longitude: -8.9763, source: "https://pumpaddicted.pt/contactos/" },
  { category: "ginasios", name: "Be-Fit Montijo", description: "Ginásio no Montijo Retail Park com espaços de fitness, musculação e aulas de grupo.", phone: "210 523 648", email: "montijo@be-fit.pt", website: "https://www.be-fit.pt/", street: "Estrada do Pau Queimado", number: "Montijo Retail Park, Loja 4", postalCode: "2870-100", source: "https://www.montijoretailpark.com/be_fit/" },
  { category: "ginasios", name: "Kalorias Clube Montijo", description: "Ginásio localizado no Alegro Montijo com treino e aulas de grupo.", phone: "911 873 030", street: "Rua da Azinheira", number: "Alegro Montijo", postalCode: "2870-100", latitude: 38.6934109, longitude: -8.9416215, source: "https://www.multi-portugal.com/web/forum-montijo/informations" },

  { category: "dentistas", name: "OralMED Montijo", description: "Clínica dentária no centro do Montijo dedicada a cuidados de saúde oral.", phone: "210 529 071", email: "montijo@oralmed.pt", website: "https://www.oralmed.pt/montijo", street: "Rua Serpa Pinto", number: "6", postalCode: "2870-363", latitude: 38.706895, longitude: -8.973713, source: "https://www.oralmed.pt/montijo" },
  { category: "dentistas", name: "Lusocare Montijo", description: "Clínica no Montijo com serviços de medicina dentária e saúde oral.", website: "https://lusocare-montijo.pt/medicina-dentaria/", street: "Rua Coronel Melo Antunes", number: "306", postalCode: "2870-052", source: "https://lusocare-montijo.pt/medicina-dentaria/" },
  { category: "dentistas", name: "Clínica Médica e Dentária da Atalaia", description: "Clínica médica e dentária localizada na Atalaia, no concelho do Montijo.", phone: "212 308 097", email: "geral@clinicadaatalaia.com", website: "https://clinicadaatalaia.com/", street: "Rua dos Ex-Votos", number: "211", postalCode: "2870-723", city: "Atalaia", source: "https://clinicadaatalaia.com/contactos/" },

  { category: "veterinarios", name: "Vetmonti", description: "Clínica veterinária no centro do Montijo com consultas, diagnóstico e cirurgia.", phone: "212 326 053", email: "vetmonti@gmail.com", website: "https://vetmonti.pt/", street: "Rua D. Augusto P. Coutinho", number: "4", postalCode: "2870-309", source: "https://vetmonti.pt/" },
  { category: "veterinarios", name: "Centro Veterinário Estuário do Tejo", description: "Centro veterinário no Afonsoeiro com consultas e cuidados para animais de companhia.", phone: "210 962 654", email: "cvet.montijo@gmail.com", website: "https://cvetmontijo.com/", street: "Rua Rui de Pina", number: "168", postalCode: "2870-431", latitude: 38.7021, longitude: -8.9595, source: "https://cvetmontijo.com/" },
  { category: "veterinarios", name: "Centro Veterinário Dr. José Leite", description: "Centro veterinário no Montijo com consultas, vacinação, análises e cirurgia.", phone: "212 311 627", email: "geral@cvetleite.com", website: "https://cvetleite.com/", street: "Avenida dos Pescadores", number: "137", postalCode: "2870-114", source: "https://cvetleite.com/" }
];

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const adminUserId = process.env.ADMIN_USER_ID!;
  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", [...new Set(candidates.map((item) => item.category))]);
  if (categoryError) throw categoryError;
  const categoryIds = new Map((categories ?? []).map((item) => [item.slug, item.id]));
  const { data: existing, error: existingError } = await supabase
    .from("businesses")
    .select("name, slug");
  if (existingError) throw existingError;
  const existingSlugs = new Set((existing ?? []).map((item) => item.slug));
  const enrichedCandidates = [];

  for (const item of candidates) {
    let coordinates =
      item.latitude !== undefined && item.longitude !== undefined
        ? { latitude: item.latitude, longitude: item.longitude }
        : null;

    if (!coordinates) {
      coordinates = await geocodeFirstMatchingAddress([
        [
          [item.street, item.number].filter(Boolean).join(" "),
          item.postalCode,
          item.city ?? "Montijo",
          "Portugal"
        ].join(", "),
        [item.name, item.city ?? "Montijo", "Portugal"].join(", ")
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1100));
    }

    enrichedCandidates.push({ ...item, coordinates });
  }

  const rows = enrichedCandidates
    .map((item) => ({
      user_id: adminUserId,
      category_id: categoryIds.get(item.category),
      name: item.name,
      slug: createSlug(`${item.name}-${item.city ?? "Montijo"}`),
      description: item.description,
      phone: item.phone ?? "",
      email: item.email ?? null,
      website: item.website ?? null,
      street: item.street,
      number: item.number ?? null,
      postal_code: item.postalCode,
      city: item.city ?? "Montijo",
      latitude: item.coordinates?.latitude ?? null,
      longitude: item.coordinates?.longitude ?? null,
      plan: "free",
      is_visible: true,
      is_24_hours: false
    }))
    .filter((item) => !existingSlugs.has(item.slug));
  if (rows.some((item) => !item.category_id)) throw new Error("Categoria em falta.");
  const { data, error } = await supabase.from("businesses").insert(rows).select("id,name,slug");
  if (error) throw error;
  console.log(JSON.stringify({ inserted: data?.length ?? 0, businesses: data }, null, 2));
}

void main();
