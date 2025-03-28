import katex, { KatexOptions } from 'katex';
import 'katex/dist/katex.min.css';

export const safeKatexTexToHtml = (src: string, options: KatexOptions = {}) => {
  try {
    return katex.renderToString(src, {
      throwOnError: false,
      strict: false,
      output: 'html',
      trust: false,
      ...options,
    });
  } catch (error) {
    return null;
  }
};
