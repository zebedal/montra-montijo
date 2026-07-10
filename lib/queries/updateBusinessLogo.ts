import { optimizeImage } from "../helpers";
import { uploadFile } from "../supabase/upload";

export async function uploadBusinessLogo(
  businessId: string,
  logo: File
): Promise<string> {
  const optimizedLogo = await optimizeImage(logo);

  return uploadFile(
    optimizedLogo,
    "business-media",
    `businesses/${businessId}/logo`
  );
}
