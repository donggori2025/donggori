"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import InfoSection from "@/components/InfoSection";
import { fetchFactoriesFromDB, type Factory } from "@/lib/factoryCatalog";
import FactoryMap from "./FactoryMap";
import FactoryPortraits from "./FactoryPortraits";
import UsageStats from "./UsageStats";

export default function FactoryShowcase() {
  const [rows, setRows] = useState<Factory[] | null>(null);
  useEffect(() => {
    let active = true;
    fetchFactoriesFromDB().then((data) => { if (active) setRows(data); });
    return () => { active = false; };
  }, []);

  return <>
    <div className="pg-entry">
      <HeroSection />
      <FactoryPortraits rows={rows ?? []} />
    </div>
    <UsageStats />
    <InfoSection rows={rows ?? []} loading={rows === null} />
    <FactoryMap rows={rows ?? []} loading={rows === null} />
  </>;
}
