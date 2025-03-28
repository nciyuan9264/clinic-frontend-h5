import XRegExp from 'xregexp';
import { SVG } from 'mathjax-full/js/output/svg';
import { mathjax } from 'mathjax-full/js/mathjax';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { TeX } from 'mathjax-full/js/input/tex';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';

import { safeKatexTexToHtml } from '../katex-tex/utils';

const adaptor = liteAdaptor();

/** 需要副作用执行 */
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  packages: [
    ...AllPackages.sort()
      .join(', ')
      .split(/\s*,\s*/),
    'physics',
    'mhchem',
  ],
  macros: {
    equalparallel:
      '{\\lower{2.6pt}{\\arrowvert\\hspace{-4.2pt}\\arrowvert}\\above{-2pt}\\raise{7.5pt}{=}}',
    number: ['{#1}', 1],
    unit: ['{#1}', 1],
    div: '{÷}',
  },
});

const svg = new SVG({ fontCache: 'none' });

const html = mathjax.document('', {
  InputJax: tex,
  OutputJax: svg,
});

export const texToSvg = (tex: string) => {
  /** 假如包含控制字符，可能会导致 mathjax 崩溃 */
  const legalCharTex = XRegExp.replace(
    tex,
    XRegExp(String.raw`[^\P{C}\n\t]+`, 'ug'),
    '',
  );

  try {
    const node = html.convert(legalCharTex, {
      display: true,
      em: 16,
      ex: 8,
      containerWidth: 80 * 16,
    });

    return adaptor.outerHTML(node?.children?.[0]);
  } catch (error) {
    return safeKatexTexToHtml(tex) ?? tex;
  }
};
