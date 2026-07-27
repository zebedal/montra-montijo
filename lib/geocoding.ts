export interface GeocodedAddress {
  latitude: number;
  longitude: number;
  displayName: string;
}

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    postcode?: string;
  };
};

const MONTIJO_VIEWBOX = "-9.02,38.86,-8.55,38.52";

export function getStreetNumberForGeocoding(number: string) {
  const match = number.trim().match(/^\d+[a-z]?/i);

  return match?.[0] ?? number.trim();
}

export function getStreetForGeocoding(street: string) {
  const parts = street
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  // Aceita valores como "Centro Comercial Saldanha, Av. Infante Dom
  // Henrique" sem enviar o nome do local como se fizesse parte da rua.
  return parts.at(-1) ?? street.trim();
}

export async function geocodeAddress(
  address: string
): Promise<GeocodedAddress | null> {
  const searchParams = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    q: address,
    countrycodes: "pt",
    addressdetails: "1",
    viewbox: MONTIJO_VIEWBOX,
    bounded: "1"
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`,
    {
      headers: {
        "User-Agent": "MontraMontijo/1.0 (geral@montramontijo.pt)"
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao obter coordenadas.");
  }

  const results = (await response.json()) as NominatimResult[];
  const result = results[0];

  if (!result) {
    return null;
  }

  /*
   * O código postal do OpenStreetMap nem sempre coincide com o dos CTT ou do
   * Google Maps, inclusive para a mesma porta. A pesquisa já está limitada ao
   * concelho do Montijo; uma divergência entre fontes não deve invalidar uma
   * morada que o Nominatim conseguiu localizar.
   */

  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    displayName: result.display_name
  };
}
