import {
  geocodeAddress,
  getStreetNumberForGeocoding
} from "@/lib/geocoding";

type AddressRequest = {
  street?: string;
  number?: string;
  postalCode?: string;
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

  if (!street || !number || !/^\d{4}-\d{3}$/.test(postalCode ?? "")) {
    return Response.json(
      { error: "Preenche uma rua, um número e um código postal válidos." },
      { status: 400 }
    );
  }

  try {
    const streetNumber = getStreetNumberForGeocoding(number);
    const result = await geocodeAddress(
      `${street} ${streetNumber}, ${postalCode}, Montijo, Portugal`,
      postalCode
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

    return Response.json(result);
  } catch (error) {
    console.error("Erro ao validar morada:", error);

    return Response.json(
      { error: "Não foi possível validar a morada. Tenta novamente." },
      { status: 502 }
    );
  }
}
