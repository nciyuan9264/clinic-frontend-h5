import { DOMNode, Element } from 'html-react-parser';

import { isElementType } from '../utils';

const DEFAULT_LANGUAGE = 'plaintext';

const getCodeElement = (node: DOMNode): Element | undefined => {
  if (isElementType(node, 'code')) {
    return node;
  }

  if (isElementType(node, 'pre')) {
    return node.childNodes.find((childNode): childNode is Element =>
      isElementType(childNode, 'code'),
    );
  }
};

export const getLanguageFromElement = (
  node: DOMNode,
  defaultLanguage = DEFAULT_LANGUAGE,
): string => {
  const codeElement = getCodeElement(node);

  if (codeElement) {
    return (
      codeElement.attribs?.class?.match(/language-(.*)/)?.[1] || defaultLanguage
    );
  }

  return defaultLanguage;
};

export const getMetaFromElement = (node: DOMNode, removeBuiltIn = true) => {
  const codeElement = getCodeElement(node);

  const metaString = codeElement?.attribs['data-meta'];

  if (!metaString) {
    return;
  }

  if (!removeBuiltIn) {
    return metaString;
  }

  return (
    metaString
      .split(/\s+/)
      .filter((item) => !item.match(/^__[^_].*/))
      .join(' ') || undefined
  );
};

export const getIndentFromCodeElememt = (node: DOMNode) => {
  const metaString = getMetaFromElement(node, false);

  if (!metaString) {
    return 0;
  }

  const matchResult = metaString.match(
    /(\s|^)__indent=(?<indent>[0-9]+)(\s|$)/,
  );

  if (!matchResult) {
    return 0;
  }

  const indentValue = Number(matchResult.groups?.indent);

  return isNaN(indentValue) ? 0 : indentValue;
};
