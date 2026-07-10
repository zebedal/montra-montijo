import { optimizeImage } from "../helpers";
import { uploadFile } from "../supabase/upload";

export async function uploadBusinessLogo(
  businessId: string,
  logo: File
): Promise<string> {
  const optimizedLogo = await optimizeImage(logo);

  const uploaded = await uploadFile(
    optimizedLogo,
    "business-media",
    `businesses/${businessId}/logo`
  );

  return uploaded.path;
}
