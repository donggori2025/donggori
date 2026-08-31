import type { Metadata } from "next";
import { getFactoryImages } from "@/lib/factoryImages";
import { getServiceSupabase } from "@/lib/supabaseService";

type FactoryMetadataRow = {
  company_name?: string | null;
  admin_district?: string | null;
  intro?: string | null;
  intro_text?: string | null;
  description?: string | null;
  image?: unknown;
  images?: unknown;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const { data } = await getServiceSupabase()
      .from("donggori")
      .select("company_name,admin_district,intro,intro_text,description,image,images")
      .eq("id", id)
      .maybeSingle();
    const factory = data as FactoryMetadataRow | null;

    if (!factory?.company_name || factory.company_name === "희망사") {
      return { title: "공장 정보", robots: { index: false, follow: false } };
    }

    const region = String(factory.admin_district || "").trim();
    const rawDescription = String(factory.intro_text || factory.intro || factory.description || "").trim();
    const description = (rawDescription || `${region ? `${region} ` : ""}봉제공장 정보를 확인하고 문의할 수 있습니다.`)
      .replace(/\s+/g, " ")
      .slice(0, 160);
    const images = getFactoryImages(factory).filter((url) => /^https?:\/\//i.test(url));
    const canonical = `/factories/${encodeURIComponent(id)}`;

    return {
      title: factory.company_name,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        title: factory.company_name,
        description,
        images: images.slice(0, 1),
      },
    };
  } catch {
    return { title: "공장 정보", robots: { index: false, follow: false } };
  }
}

export default function FactoryDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
