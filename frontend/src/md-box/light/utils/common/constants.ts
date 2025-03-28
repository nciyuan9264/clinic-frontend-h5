export const HIDE_HEADER_LANGUAGES = ['result', 'stderr', 'stdout'] as const;
type Tuple2Union<T extends readonly unknown[]> = T extends readonly [
  infer K,
  ...infer O,
]
  ? K | Tuple2Union<O>
  : never;
export type T_PRESET_LANGUAGE_KEYWORD = Tuple2Union<
  typeof HIDE_HEADER_LANGUAGES
>;
