/** CSV 보상 수량 라벨 × 입장(번개) 배수 — 마일스톤(×25), 획득 안내(N장), 숫자만 */
export function scaleRewardQtyLabel(label: string, ticketMult: number): string {
  const mult = Math.max(1, Math.floor(ticketMult));
  if (mult <= 1 || !label.trim()) return label;

  const trimmed = label.trim();

  const timesMatch = trimmed.match(/^[×x](\d+)$/i);
  if (timesMatch) return `×${Number(timesMatch[1]) * mult}`;

  const ticketMatch = trimmed.match(/^(\d+)\s*장$/);
  if (ticketMatch) return `${Number(ticketMatch[1]) * mult}장`;

  const numMatch = trimmed.match(/^(\d+)$/);
  if (numMatch) return String(Number(numMatch[1]) * mult);

  return label;
}
