export const durations = {
  fast: 150,
  normal: 300,
  slow: 600,
  dramatic: 1200,
  splash: 2200,
  reveal: 2500,
} as const;

export const easings = {
  standard: 'ease-in-out' as const,
  enter: 'ease-out' as const,
  exit: 'ease-in' as const,
};
