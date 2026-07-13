import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/area-cliente/ProfileForm";
import { getMyProfile } from "@/lib/queries/getMyProfile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil"
};

export default async function ProfilePage() {
  const profile = await getMyProfile();

  if (!profile) {
    redirect("/");
  }

  return (
    <ProfileForm
      initialData={{
        fullName: profile?.fullName ?? "",
        phone: profile?.phone ?? "",
        email: profile?.email ?? "",
        alternativeEmail: profile?.email ?? ""
      }}
    />
  );
}
