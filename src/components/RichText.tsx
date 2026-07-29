// Renderiza um texto simples preservando quebras de linha (parágrafos) e
// transformando endereços (https://... ou www...) em links clicáveis.
// Seguro: nunca injeta HTML; o React escapa o texto automaticamente.

import { Fragment } from "react";

const URL_SPLIT = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const URL_START = /^(https?:\/\/|www\.)/i;

function linkify(text: string) {
  return text.split(URL_SPLIT).map((part, i) => {
    if (!part) return null;

    if (URL_START.test(part)) {
      // Separa pontuação final que não faz parte do link (ex.: "site.com.")
      let url = part;
      let trailing = "";
      const m = url.match(/[.,;:!?)]+$/);
      if (m) {
        trailing = m[0];
        url = url.slice(0, -trailing.length);
      }
      const href = url.toLowerCase().startsWith("http") ? url : `https://${url}`;
      return (
        <Fragment key={i}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-magenta underline break-words"
          >
            {url}
          </a>
          {trailing}
        </Fragment>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function RichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={`whitespace-pre-wrap break-words ${className ?? ""}`}>
      {linkify(text)}
    </div>
  );
}
