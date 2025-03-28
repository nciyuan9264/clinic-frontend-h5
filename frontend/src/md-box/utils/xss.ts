import { Config } from 'dompurify';
import 'isomorphic-dompurify';  // 保证加载 isomorphic-dompurify

export const purifyHtml = (value: string, config?: Config) => {
  const DOMPurify = (window as any).DOMPurify; // DOMPurify 在浏览器环境下是全局变量

  if (!DOMPurify || !DOMPurify.sanitize) {
    console.error('[MdBox] Cannot load isomorphic-dompurify');
    return value;
  }

  return DOMPurify.sanitize(value, config) as string;
};
