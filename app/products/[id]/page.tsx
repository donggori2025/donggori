"use client";

import { useParams } from "next/navigation";
import { ProductWorkspace } from "@/components/product-workspace";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductWorkspace productId={id} />;
}
