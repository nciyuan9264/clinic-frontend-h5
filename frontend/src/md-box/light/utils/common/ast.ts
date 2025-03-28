import { gfmTaskListItem } from 'micromark-extension-gfm-task-list-item';
import { gfmTable } from 'micromark-extension-gfm-table';
import { gfmStrikethrough } from 'micromark-extension-gfm-strikethrough';
import { toMarkdown } from 'mdast-util-to-markdown';
import { mathFromMarkdown, mathToMarkdown } from 'mdast-util-math';
import {
  gfmTaskListItemFromMarkdown,
  gfmTaskListItemToMarkdown,
} from 'mdast-util-gfm-task-list-item';
import { gfmTableFromMarkdown, gfmTableToMarkdown } from 'mdast-util-gfm-table';
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown,
} from 'mdast-util-gfm-strikethrough';
import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Content, Parent, Literal, Root, Heading, Image } from 'mdast';
import { isUndefined } from 'lodash-es';

import { math, disableSetextHeading, disableIndentedCode } from '../micromark';

export interface ParseMarkdownOptions {
  enableIndentedCode?: boolean;
}

export const parseMarkdown = (
  source: string,
  options: ParseMarkdownOptions = {},
) => {
  return fromMarkdown(source, {
    extensions: [
      math(),
      gfmTable,
      disableSetextHeading(),
      ...(options.enableIndentedCode ? [] : [disableIndentedCode()]),
      gfmStrikethrough({ singleTilde: false }),
      gfmTaskListItem,
    ],
    mdastExtensions: [
      mathFromMarkdown(),
      gfmTableFromMarkdown,
      gfmStrikethroughFromMarkdown,
      gfmTaskListItemFromMarkdown,
    ],
  } as any );
};

export const stringifyMarkdown = (ast: Root | Content, strip = false) => {
  const source = toMarkdown(ast, {
    extensions: [
      mathToMarkdown(),
      gfmTableToMarkdown(),
      gfmStrikethroughToMarkdown,
      gfmTaskListItemToMarkdown,
    ],
    resourceLink: true,
    fences: true,
  });
  return strip ? source.trim() : source;
};

export const stringifyChildren = (
  children: Content[],
  inline = false,
): string => {
  if (!children.length) {
    return '';
  }
  const stringifyResult = stringifyMarkdown(
    {
      type: 'root',
      children,
    },
    true,
  );

  return inline ? stringifyResult.replace(/\n/g, '') : stringifyResult;
};

export const isParentOfContent = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is Extract<Content, Parent> => {
  return !isUndefined(value?.children);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isParent = (value: any): value is Parent => {
  return !isUndefined(value?.children);
};

export const isLiteralOfContent = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is Extract<Content, Literal> => {
  return !isUndefined(value?.value);
};

export const isImage = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is Image => {
  return value?.type === 'image';
};

export const isRoot = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is Root => {
  return value?.type === 'root';
};

type ContentTypeMapType = {
  [key in Content['type']]: Extract<Content, { type: key }>;
};

export const isTypeOfContent = <T extends keyof ContentTypeMapType>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  ...type: T[]
): value is ContentTypeMapType[T] => {
  return type.some((item) => value?.type === item);
};

export const isHeading = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is Heading => {
  return isParentOfContent(value) && value.type === 'heading';
};

export interface GetTextOfAstOptions {
  filter?: (ast: Parent | Content) => boolean;
}

export const getTextOfAst = (
  ast: Parent | Content,
  options: GetTextOfAstOptions = {},
): string => {
  const { filter } = options;

  if (filter && !filter(ast)) {
    return '';
  }

  if (isParentOfContent(ast)) {
    return `${ast.children
      .map((item) => getTextOfAst(item, options))
      .join('')}\n`;
  }

  if (isLiteralOfContent(ast)) {
    return ast.value;
  }

  return '';
};
