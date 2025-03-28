import htmlEntity from 'he';
import { AnyNode } from 'domhandler';
import domSerializer from 'dom-serializer';

import { elementAt } from '../../../utils';

const DEFAULT_ENABLED_ROOT_TAGS = ['span', 'u', 'br'];

const matchTagNameOfHtmlTag = (html: string) => {
  const regexList = [
    /<(?<tag>[a-zA-Z]+)(\s+([a-zA-Z]+=(("[^"]*")|('[^']*'))))*\s*\/?>/,
    /<\/(?<tag>[a-zA-Z]+)>/,
  ];

  for (const regex of regexList) {
    const matchResult = regex.exec(html);
    if (matchResult) {
      return matchResult.groups?.tag?.toLowerCase();
    }
  }
};

const getTagNameOfHtml = (html: string) => {
  const matchedTagName = matchTagNameOfHtmlTag(html);

  if (typeof DOMParser === 'undefined') {
    return matchedTagName;
  }

  const parser = new DOMParser();

  const targetElementHtml = elementAt(
    [...parser.parseFromString(html, 'text/html').body.children],
    0,
  );

  const tagName = targetElementHtml?.tagName?.toLowerCase() || matchedTagName;

  return tagName;
};

export const autoDisableHtmlTag = (
  html: string,
  extraEnabledTags: string[] | boolean = [],
) => {
  const tagName = getTagNameOfHtml(html);

  if (extraEnabledTags === true) {
    return html;
  }

  const enabledRootTags = [
    ...DEFAULT_ENABLED_ROOT_TAGS,
    ...(extraEnabledTags || []),
  ];

  if (tagName && !enabledRootTags.includes(tagName)) {
    return htmlEntity.encode(html, {
      strict: false,
    });
  }

  return html;
};

export const stringifyDomNode = (node: AnyNode | AnyNode[]) => {
  return domSerializer(node, {
    encodeEntities: false,
    decodeEntities: true,
  });
};
