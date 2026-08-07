"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/factory-my-page")) {
    return null;
  }
  return <Footer />;
}
