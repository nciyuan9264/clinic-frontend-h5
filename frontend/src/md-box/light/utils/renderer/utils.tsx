import React, { createElement } from 'react';

import { isRegExp } from 'lodash-es';
import { DOMNode, Element, Text, domToReact } from 'html-react-parser';

import { RenderFunction } from '../../type';

export const isTextType = (node: DOMNode): node is Text => {
  return node.type === 'text';
};

export const isEndlineText = (node: DOMNode): node is Text => {
  return isTextType(node) && /^\n+$/.test(getInnerText(node));
};

/**
 * 此处断言的是Element的子类型：即为A标签的类型，但是Element不可进一步进行类型收窄，因此
 * 返回node is Element
 */
export const isElementType = (
  node: DOMNode,
  ...names: (string | RegExp)[]
): node is Element => {
  if (!('attribs' in node) || typeof node.attribs !== 'object') {
    return false;
  }
  return (
    node.type === 'tag' &&
    (!names?.length ||
      names.some((item) => {
        if (isRegExp(item)) {
          return item.test(node.name);
        } else {
          return item === node.name;
        }
      }))
  );
};

export const getInnerText = (node: DOMNode): string => {
  if (isTextType(node)) {
    return node.data;
  }
  if (isElementType(node)) {
    return node.children.map(getInnerText).join('');
  }
  return '';
};

/**
 * 检测字符或字符串是否包含中文字符
 * https://github.com/anton-bot/contains-chinese/blob/master/index.js#L7
 * @param char 字符或字符串
 * @returns 是否包含中文字符
 */
export const detectIsChinese = (char: string) => {
  const HAN_REGEX =
    // eslint-disable-next-line max-len
    /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FD5\uF900-\uFA6D\uFA70-\uFAD9]/;
  return HAN_REGEX.test(char);
};

export const renderDom: RenderFunction<false> = (node) => {
  return <>{domToReact([node])}</>;
};

export const renderReactElement = <P extends Record<string, unknown>>(
  tag: string,
  props: P,
  children?: React.ReactNode[],
) => {
  if (props.className === 'markdown-root') {
    return <>{children}</>;
  } else {
    return (
      <>{createElement(tag, props, children?.length ? children : undefined)}</>
    );
  }
};
