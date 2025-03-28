import { Parent, Content } from 'mdast';
import { isEqual } from 'lodash-es';

import { isParent, isParentOfContent } from './common/ast';
import { elementAt } from '../../utils';

export type GetHopDiffReturnValue = {
  prevEndNode: Content | undefined;
  endNode: Content | undefined;
} | null;

export const getHopDiff = (from: Parent, to: Parent): GetHopDiffReturnValue => {
  if (from.type !== to.type) {
    if (isParentOfContent(from) && isParentOfContent(to)) {
      return {
        prevEndNode: from,
        endNode: to,
      };
    }

    return null;
  }
  if (
    !isEqual(
      from.children.map((item) => item.type),
      to.children.map((item) => item.type),
    )
  ) {
    return {
      prevEndNode: elementAt(from.children, from.children.length - 1),
      endNode: elementAt(to.children, to.children.length - 1),
    };
  }

  for (let index = 0; index < from.children.length; index++) {
    const fromItem = from.children[index];

    const toItem = to.children[index];

    if (isParent(fromItem) && isParent(toItem)) {
      const subResult = getHopDiff(fromItem, toItem);

      if (subResult) {
        return subResult;
      }
    } else if (!isParent(fromItem) && !isParent(toItem)) {
      if (fromItem.type !== toItem.type) {
        return {
          prevEndNode: fromItem,
          endNode: toItem,
        };
      }
    } else {
      return {
        prevEndNode: fromItem,
        endNode: toItem,
      };
    }
  }

  return null;
};

export enum StandardNodeTypeEnum {
  Thematic = 'thematic',
  Heading = 'heading',
  CodeBlock = 'code_block',
  Html = 'html',
  LinkDefRef = 'link_def_ref',
  Paragraph = 'paragraph',
  Table = 'table',
  BlockQuote = 'block_quote',
  List = 'list',
  ListItem = 'list_item',
  InlineCode = 'inline_code',
  Emphasis = 'emphasis',
  Strong = 'strong',
  Link = 'link',
  Image = 'image',
  StrikeThrough = 'strike_through',
  Text = 'text',
  MathBlock = 'math_block',
  InlineMath = 'inline_math',
  /** 表示节点不存在 */
  Empty = 'empty',
  /** 表示节点类型未知 */
  Unknown = 'unknown',
}

const standardNodeTypeMapping: Partial<
  Record<Content['type'], StandardNodeTypeEnum>
> = {
  thematicBreak: StandardNodeTypeEnum.Thematic,
  heading: StandardNodeTypeEnum.Heading,
  code: StandardNodeTypeEnum.CodeBlock,
  html: StandardNodeTypeEnum.Html,
  linkReference: StandardNodeTypeEnum.LinkDefRef,
  paragraph: StandardNodeTypeEnum.Paragraph,
  table: StandardNodeTypeEnum.Table,
  blockquote: StandardNodeTypeEnum.BlockQuote,
  list: StandardNodeTypeEnum.List,
  listItem: StandardNodeTypeEnum.ListItem,
  inlineCode: StandardNodeTypeEnum.InlineCode,
  emphasis: StandardNodeTypeEnum.Emphasis,
  strong: StandardNodeTypeEnum.Strong,
  link: StandardNodeTypeEnum.Link,
  image: StandardNodeTypeEnum.Image,
  delete: StandardNodeTypeEnum.StrikeThrough,
  text: StandardNodeTypeEnum.Text,
  // math: StandardNodeTypeEnum.MathBlock,
  // inlineMath: StandardNodeTypeEnum.InlineMath,
};

export const convertToStanardNodeTypeEnum = (
  type: Content['type'] | undefined,
): StandardNodeTypeEnum => {
  if (!type) {
    return StandardNodeTypeEnum.Empty;
  }

  return standardNodeTypeMapping[type] ?? StandardNodeTypeEnum.Unknown;
};
