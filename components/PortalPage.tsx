import type { ReactNode } from "react";
import "@/app/home.css";

export default function PortalPage({ title, description, children }: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="pg-page pg-interior">
      <header className="pg-entry pg-interior-heading">
        <div className="site-wide">
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </header>
      <div className="site-wide pg-interior-content">{children}</div>
    </div>
  );
}
