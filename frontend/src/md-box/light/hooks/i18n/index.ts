import { useEffect, useState } from 'react';

import { Content, Parent } from 'mdast';

import { rtlLocaleList } from './consts';
import { getTextOfAst, isLiteralOfContent } from '../../utils/common';
import { elementAt } from '../../../utils';

export const retryLoad = <T>(
  fn: () => Promise<T>,
  retriesLeft = 3,
  interval = 1000,
): Promise<T> =>
  new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((err: Error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(err);
            return;
          }
          retryLoad(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });

const notStringifiedAstType: Content['type'][] = [
  'code',
  'inlineCode',
  'math',
  'inlineMath',
];

const DETECT_MIN_LENGTH = 20;

const isRTLChar = (str: string) => {
  const ltrChars =
      'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
      '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
    rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
    rtlDirCheck = new RegExp(`^[^${ltrChars}]*[${rtlChars}]`);

  return rtlDirCheck.test(str);
};

const isRTLOfAstLanguage = async (ast: Parent) => {
  try {
    const text = getTextOfAst(ast, {
      filter: (ast) => {
        if (
          isLiteralOfContent(ast) &&
          notStringifiedAstType.includes(ast.type)
        ) {
          return false;
        }
        return true;
      },
    }).trim();

    const firstLine = elementAt(text.split('\n'), 0);

    if (!firstLine) {
      return false;
    }
    const { franc } = await retryLoad(() => import('franc'));
    const language = franc(firstLine, { minLength: DETECT_MIN_LENGTH });

    if (language === 'und') {
      return isRTLChar(firstLine.charAt(0));
    }

    return rtlLocaleList.includes(language);
  } catch (error) {
    return false;
  }
};

export const useIsRTL = (ast?: Parent) => {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    if (ast) {
      (async () => {
        const isRTL = await isRTLOfAstLanguage(ast);
        setIsRTL(isRTL);
      })();
    } else {
      setIsRTL(false);
    }
  }, [ast]);

  return isRTL;
};
