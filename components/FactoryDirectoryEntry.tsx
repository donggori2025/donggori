"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";
import { productionItems, type Factory } from "@/lib/factoryCatalog";
import FactoryImagePlaceholder from "@/components/FactoryImagePlaceholder";

export default function FactoryDirectoryEntry({ factory, editorial = false }: { factory: Factory; editorial?: boolean }) {
  const { images } = useFactoryImages(factory);
  const [failed, setFailed] = useState("");
  const image = images[0];
  const name = factory.name || factory.company_name || "공장";
  const items = productionItems(factory);
  const minimum = Number(factory.moq || factory.minOrder);
  return (
    <Link href={`/factories/${factory.id}`} className={editorial ? "workshop-profile" : "directory-entry"}>
      <div className="directory-photo">
        {image && image !== failed && image !== "/logo_donggori.png" ?
          <Image src={image} alt="" fill sizes={editorial ? "(max-width: 700px) 90vw, 380px" : "(max-width:600px) 84px, 148px"} onError={() => setFailed(image)} /> :
          <FactoryImagePlaceholder />}
      </div>
      <div className="directory-name">
        <span>{[factory.admin_district, factory.factory_type].filter(Boolean).join(" · ")}</span>
        <h3>{name}</h3>
      </div>
      <div className="directory-field directory-items"><span>생산 품목</span><p>{items.slice(0, 3).join(", ") || "미등록"}</p></div>
      <div className="directory-field"><span>작업 원단</span><p>{factory.main_fabrics || "미등록"}</p></div>
      <div className="directory-field"><span>최소 주문</span><p>{minimum > 0 ? `${minimum.toLocaleString("ko-KR")}장` : "미등록"}</p></div>
      <ArrowUpRight className="directory-arrow" aria-hidden size={18} />
    </Link>
  );
}
