import { Tokenizer, Tokens } from 'marked';

const gfmDelRegex = /^(~~)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/;

export class MdboxTokenizer extends Tokenizer {
  override autolink(_src: string): Tokens.Link | undefined {
    return;
  }

  override del(src: string): Tokens.Del | undefined {
    const cap = gfmDelRegex.exec(src);
    if (cap) {
      return {
        type: 'del',
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2]),
      };
    }
  }

  override url(): Tokens.Link | undefined {
    return;
  }
}
