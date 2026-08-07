export const WORRY_BUBBLE_COLORS = [
  "#fb930a",
  "#f4728a",
  "#80c826",
  "#9087e6",
  "#229ff7",
] as const;

export function getWorryBubbleColor(index: number): string {
  return WORRY_BUBBLE_COLORS[index] ?? WORRY_BUBBLE_COLORS[1];
}
