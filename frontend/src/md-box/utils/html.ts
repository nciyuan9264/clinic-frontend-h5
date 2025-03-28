/**
 * 来源：[HTML 规范](https://html.spec.whatwg.org/multipage/syntax.html#void-elements)
 */
const voidTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
];

export const transformSelfClosing = (value: string) => {
  return value.replace(
    /<([\w\-]+)([^>/]*)\/\s*>/g,
    (raw: string, tagName: string, content: string) => {
      if (voidTags.includes(tagName.toLowerCase())) {
        return raw;
      }
      return `<${tagName}${content}></${tagName}>`;
    },
  );
};
