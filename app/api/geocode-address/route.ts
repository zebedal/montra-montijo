import {
  geocodeAddress,
  getStreetForGeocoding,
  getStreetNumberForGeocoding
} from "@/lib/geocoding";
import { isBusinessLocality } from "@/lib/business-localities";

type AddressRequest = {
  street?: string;
  number?: string;
  postalCode?: string;
  city?: string;
};

export async function POST(request: Request) {
  let body: AddressRequest;

  try {
    body = (await request.json()) as AddressRequest;
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const street = body.street?.trim();
  const number = body.number?.trim();
  const postalCode = body.postalCode?.trim();
  const city = body.city?.trim() ?? "Montijo";

  if (
    !street ||
    !number ||
    !/^\d{4}-\d{3}$/.test(postalCode ?? "") ||
    !isBusinessLocality(city)
  ) {
    return Response.json(
      { error: "Preenche uma rua, um número e um código postal válidos." },
      { status: 400 }
    );
  }

  try {
    const streetNumber = getStreetNumberForGeocoding(number);
    const searchableStreet = getStreetForGeocoding(street);
    const result = await geocodeAddress(
      `${searchableStreet} ${streetNumber}, ${postalCode}, ${city}, Portugal`
    );

    if (!result) {
      return Response.json(
        {
          error:
            "Não encontrámos esta morada no Montijo. Confirma a rua, o número e o código postal."
        },
        { status: 404 }
      );
    }

    return Response.json({
      ...result,
      displayName: `${street} ${number}, ${postalCode}, ${city}`
    });
  } catch (error) {
    console.error("Erro ao validar morada:", error);

    return Response.json(
      { error: "Não foi possível validar a morada. Tenta novamente." },
      { status: 502 }
    );
  }
}
