import type { ReactNode } from "react";

const URL_PATTERN = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;

function toHref(url: string) {
  return url.startsWith("www.") ? `https://${url}` : url;
}

export function linkifyText(text: string): ReactNode[] {
  const parts = text.split(URL_PATTERN);

  return parts.map((part, index) => {
    if (!part) return null;
    if (/^(https?:\/\/|www\.)/i.test(part)) {
      return (
        <a
          key={`link-${index}`}
          href={toHref(part)}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
        >
          {part}
        </a>
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
}
