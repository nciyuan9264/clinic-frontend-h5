import { Renderer, MarkedOptions, Tokens } from 'marked';

import { escapeMarkdownText } from './utils';
import { autoDisableHtmlTag } from '../common';

export interface MdBoxRendererOptions extends MarkedOptions {
  enabledHtmlTags?: string[] | boolean;
}

export const getMdBoxRenderer = (options: MdBoxRendererOptions = {}) => {
  const { enabledHtmlTags } = options;

  class MdboxRenderer extends Renderer {
    html({ text }: Tokens.HTML | Tokens.Tag): string {
      return autoDisableHtmlTag(text, enabledHtmlTags);
    }

    code({ text, lang = '', escaped }: Tokens.Code) {
      const matchResult = lang.match(
        /^\s*(?<language>\S+)\s*(?<meta>[\S\s]*?)\s*$/,
      );

      const code = `${text.replace(/\n$/, '')}\n`;

      if (!matchResult) {
        return `<pre><code>${
          escaped ? code : escapeMarkdownText(code, true)
        }</code></pre>\n`;
      }

      const { groups = {} } = matchResult;

      const { language, meta } = groups;

      return `<pre><code type="test" class="language-${escapeMarkdownText(
        language,
      )}"${meta ? ` data-meta="${escapeMarkdownText(meta)}"` : ''}>${
        escaped ? code : escapeMarkdownText(code, true)
      }</code></pre>\n`;
    }
  }

  return new MdboxRenderer(options);
};
