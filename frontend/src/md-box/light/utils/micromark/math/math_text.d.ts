/**
 * @param {Options | null | undefined} [options]
 * @returns {Construct}
 */
export function mathText(options?: Options | null | undefined): Construct;
export type Construct = import('micromark-util-types').Construct;
export type TokenizeContext = import('micromark-util-types').TokenizeContext;
export type Tokenizer = import('micromark-util-types').Tokenizer;
export type Previous = import('micromark-util-types').Previous;
export type Resolver = import('micromark-util-types').Resolver;
export type State = import('micromark-util-types').State;
export type Token = import('micromark-util-types').Token;
/**
 * Configuration.
 */
export interface Options {
  /**
   * Whether to support math (text) with a single dollar.
   * Single dollars work in Pandoc and many other places, but often interfere
   * with “normal” dollars in text.
   * If you turn this off, you can use two or more dollars for text math.
   */
  singleDollarTextMath?: boolean | null | undefined;
}
