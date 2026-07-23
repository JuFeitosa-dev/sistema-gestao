const STYLES: Record<string, string> = {
  ativo: "bg-green-100 text-green-800",
  pausado: "bg-yellow-100 text-yellow-800",
  concluido: "bg-gray-200 text-gray-700",
  a_fazer: "bg-gray-100 text-gray-700",
  fazendo: "bg-magenta/10 text-magenta",
  feito: "bg-green-100 text-green-800",
  interno: "bg-roxo/10 text-roxo",
  cliente: "bg-blue-100 text-blue-800",
};

export default function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: string;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STYLES[variant] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {children}
    </span>
  );
}
