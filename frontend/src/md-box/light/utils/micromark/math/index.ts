/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('./math-text.js').Options} Options
 */

import { Extension } from 'micromark-util-types';

import { mathText } from './math_text';
import type { Options } from './math_text';
import { mathFlow } from './math_flow';

const dollarSign = 36;

/**
 * Create an extension for `micromark` to enable math syntax.
 *
 * @param {Options | null | undefined} [options={}]
 *   Configuration (default: `{}`).
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions`, to
 *   enable math syntax.
 */
export function math(options?: Options): Extension {
  return {
    flow: { [dollarSign]: mathFlow },
    text: { [dollarSign]: mathText(options) },
  };
}
