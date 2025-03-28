import emailValidator from 'email-validator';

import { urlRegExp } from './regex';

export enum HyperNodeType {
  text,
  link,
}

export type HyperNode =
  | {
      type: HyperNodeType.text;
      text: string;
    }
  | {
      type: HyperNodeType.link;
      url: string;
    };

export type HyperNodeTitled = HyperNode & {
  title: string;
};

const openAndCloseCharPairs: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
};
const openChars = Object.keys(openAndCloseCharPairs);
const closeChars = Object.values(openAndCloseCharPairs);
const unreasonableSuffix = ['.', ',', '!', '?', "'", ':', ';', '@', '#'];

/**
 * 分割合理的URL
 * @returns 返回字符串中合理的URL的长度，范围[0, input.length]
 */
const getAReasonableUrl = (input: string) => {
  let index = -1;
  const stack: Array<{
    char: string;
    index: number;
  }> = [];
  for (let i = 0; i < input.length; ++i) {
    const char = input[i];
    if (openChars.includes(char)) {
      stack.push({
        char,
        index: i,
      });
    } else if (closeChars.includes(char)) {
      if (!stack.length) {
        index = i;
        break;
      } else {
        const { char: lastOpenChar } = stack[stack.length - 1];
        if (char === openAndCloseCharPairs[lastOpenChar]) {
          stack.pop();
        } else {
          ({ index } = stack[0]);
          break;
        }
      }
    }
  }
  if (stack.length) {
    ({ index } = stack[0]);
  }
  if (index === -1) {
    index = input.length;
  }

  while (index > 1 && unreasonableSuffix.includes(input[index - 1])) {
    index--;
  }
  return input.slice(0, index);
};

/**
 * 分割字符串中的超链接和常规字符，输出格式化数据 HyperNode[]
 */
export const getHyperLinkNodes = (str: string): HyperNode[] => {
  const nodes: HyperNode[] = [];
  let cur = 0;
  urlRegExp.lastIndex = 0;
  while (true) {
    const result = urlRegExp.exec(str);
    if (!result) {
      break;
    }

    const { index, 0: content } = result;
    const text = str.slice(cur, index);

    // ① 文字部分
    if (text) {
      nodes.push({
        type: HyperNodeType.text,
        text,
      });
    }

    // ② 链接/markdown/email 部分，email 被渲染为文字，code block / inline code 中的链接也当做文字
    if (content) {
      /** 1. 非正常前缀 */
      const abnormalPrefixMatchResult = /^(@|#|\+|-|%)+/.exec(content);
      if (abnormalPrefixMatchResult) {
        nodes.push({
          type: HyperNodeType.text,
          text: abnormalPrefixMatchResult[0],
        });
        cur = result.index + abnormalPrefixMatchResult[0].length;
        urlRegExp.lastIndex = cur;
      } else {
        /** 2. 合理Url作为前缀 */
        const subUrl = getAReasonableUrl(content);

        if (subUrl) {
          if (emailValidator.validate(subUrl)) {
            nodes.push({
              type: HyperNodeType.text,
              text: subUrl,
            });
          } else {
            nodes.push({
              type: HyperNodeType.link,
              url: subUrl,
            });
          }

          cur = result.index + subUrl.length;
          urlRegExp.lastIndex = cur;
        } else {
          const skipStr = content.slice(0, 1);

          nodes.push({
            type: HyperNodeType.text,
            text: skipStr,
          });

          cur = result.index + skipStr.length;
          urlRegExp.lastIndex = cur;
        }
      }
    }
  }
  if (cur !== str.length) {
    nodes.push({ type: HyperNodeType.text, text: str.slice(cur) });
  }
  return nodes;
};
