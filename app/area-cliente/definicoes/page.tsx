import type { Metadata } from "next";

import AccountSettings from "@/components/area-cliente/AccountSettings";

export const metadata: Metadata = {
  title: "Definições",
  robots: {
    index: false,
    follow: false
  }
};

export default function SettingsPage() {
  return <AccountSettings />;
}
