import { pipe } from '../../../../utils';

const escapeRegExp = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

const escapeChars = (source: string, chars: string[]) => {
  const illegalChars = chars.filter((item) => item.length !== 1);

  if (illegalChars.length) {
    throw Error(`illegal chars length: ${chars.join(', ')}`);
  }

  return chars.reduce((prev, curr) => {
    const regexp = new RegExp(
      String.raw`([^\\]|^)(${escapeRegExp(curr)})`,
      'g',
    );
    return prev.replace(regexp, (_all, preChatMatch, charMatch) => {
      return `${preChatMatch}\\${charMatch}`;
    });
  }, source);
};

const escapeCharsInLatex = (source: string) => {
  return escapeChars(source, ['#']);
};

/** TODO: 迁移逻辑 */
export const texPreProcessor = pipe(escapeCharsInLatex);
