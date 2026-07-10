import { supabase } from "@/lib/supabase/client";

export async function uploadFile(file: File, bucket: string, path: string) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${path}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file);

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return {
    path: fileName,
    publicUrl: data.publicUrl
  };
}
