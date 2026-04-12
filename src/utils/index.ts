export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

export function groupTipoServico(tipoServico: string | null | undefined): Array<{ name: string; count: number }> {
  if (!tipoServico) return [];
  const parts = tipoServico.split('+').map(s => s.trim()).filter(Boolean);
  const counts: Record<string, number> = {};
  for (const part of parts) {
    counts[part] = (counts[part] || 0) + 1;
  }
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}