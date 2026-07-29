export const OTP_LENGTH = 6;

export const onlyDigits = (value: string): string =>
  (value ?? "").replace(/\D/g, "");

export const toDigitBoxes = (value: string, length: number): string[] => {
  const clean = onlyDigits(value).slice(0, length);
  return Array.from({ length }, (_, index) => clean[index] ?? "");
};

export const writeDigits = (
  boxes: string[],
  start: number,
  incoming: string,
  length: number,
): { boxes: string[]; cursor: number } => {
  const next = [...boxes];
  let cursor = Math.max(0, Math.min(start, length - 1));

  for (const char of onlyDigits(incoming)) {
    if (cursor >= length) break;
    next[cursor] = char;
    cursor += 1;
  }

  return { boxes: next, cursor };
};

export const clearDigit = (
  boxes: string[],
  index: number,
): string[] => {
  const next = [...boxes];
  if (index >= 0 && index < next.length) next[index] = "";
  return next;
};
