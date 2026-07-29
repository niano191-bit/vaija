export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const CATEGORY_LABELS: Record<string, string> = {
  economico: "Econômico",
  comfort: "Comfort",
  suv: "SUV",
  moto: "Moto",
};

export const STATUS_LABELS: Record<string, string> = {
  solicitada: "Solicitada",
  aceita: "Aceita",
  a_caminho: "A caminho",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};
