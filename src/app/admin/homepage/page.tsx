import React from "react";
import { prisma } from "@/lib/db";
import { parseHomepageConfig } from "@/lib/homepage";
import { HomepageCustomizerClient } from "@/components/admin/HomepageCustomizerClient";

export const metadata = {
  title: "Homepage & Banner Customizer | BLUMAC Admin",
};

export default async function AdminHomepagePage() {
  const record = await prisma.storeSettings.findUnique({
    where: { key: "homepage_config" },
  });

  const config = parseHomepageConfig(record?.value);

  return <HomepageCustomizerClient initialConfig={config} />;
}

