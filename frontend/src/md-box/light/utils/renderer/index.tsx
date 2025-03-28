import { attributesToProps, DOMNode } from 'html-react-parser';

import { isElementType, renderDom } from './utils';
import { renderTable } from './table';
import { renderStrong } from './strong';
import { renderSimpleHtml } from './simple_html';
import { renderParagraph } from './paragraph';
import { renderMath } from './math';
import { renderList } from './list';
import { renderLink, RenderLinkOptions } from './link';
import { renderInsertElement } from './insert_element';
import { renderIndicator } from './indicator';
import { renderImage } from './image';
import { renderHeader } from './header';
import { renderEm } from './emphasis';
import { renderDanger } from './danger';
import { CodeBarConfig, renderCodeBlockGroup } from './code';
import { InsertedElementItem, stringifyDomNode } from '../common';
import {
  ElementEventCallbacks,
  RenderDataSlotType,
  RenderHtmlType,
  RenderRawHtmlType,
} from '../../type';
import { ImageOptions } from '../../../contexts';

export type { CodeBarConfig } from './code';

export type RenderCustomNodeOptions = {
  parents?: DOMNode[];
  callbacks?: ElementEventCallbacks;
  insertedElements?: InsertedElementItem[];
  imageOptions?: ImageOptions;
  codeBarConfig?: CodeBarConfig;
  adjacentCodeAsGroup?: boolean;
  forceBrInterSpacing?: boolean;
  spacingAfterChineseEm?: boolean | number;
  renderHtml?: RenderHtmlType;
  renderRawHtml?: RenderRawHtmlType;
  renderDataSlot?: RenderDataSlotType;
} & RenderLinkOptions;

/**
 * 渲染任意元素
 * @param node html-react-parser解析的原始节点
 * @param options 选项
 * @returns 返回任意元素的定制
 */
export const renderCustomNode = (
  node: DOMNode,
  options: RenderCustomNodeOptions = {},
): JSX.Element | undefined => {
  const {
    parents = [],
    callbacks = {},
    insertedElements,
    imageOptions,
    codeBarConfig,
    adjacentCodeAsGroup,
    forceBrInterSpacing,
    spacingAfterChineseEm,
    customLink,
    renderHtml,
    renderRawHtml: _renderRawHtml,
    renderDataSlot,
  } = options;

  const renderRest = (subNode: DOMNode) =>
    renderCustomNode(subNode, { ...options, parents: [node, ...parents] });

  const tagName = isElementType(node) ? node.name.toLowerCase() : '';

  const props = isElementType(node) ? attributesToProps(node.attribs) : {};

  const renderRawHtml = () => {
    if (!_renderRawHtml || !isElementType(node)) {
      return;
    }

    return _renderRawHtml({
      tagName,
      props,
      parents,
      renderRest,
      node,
      currentHTML: stringifyDomNode(node),
      childrenHTML: stringifyDomNode(node.children),
    });
  };

  return (
    renderRawHtml() ??
    renderMath(node, { parents }) ??
    (insertedElements && renderInsertElement(node, { insertedElements })) ??
    renderDanger(node) ??
    renderLink(node, {
      callbacks,
      customLink,
      parents,
      renderRest,
    }) ??
    renderImage(node, {
      callbacks,
      imageOptions,
      marginWithSiblingBr: !forceBrInterSpacing,
      parents,
    }) ??
    renderCodeBlockGroup(node, {
      codeBarConfig,
      adjacentCodeAsGroup,
      callbacks,
      parents,
      renderRest,
    }) ??
    renderIndicator(node, { parents }) ??
    renderParagraph(node, {
      forceBrInterSpacing,
      parents,
      renderRest,
    }) ??
    renderTable(node, { parents, renderRest }) ??
    renderList(node, { parents, renderRest }) ??
    renderHeader(node, { parents, renderRest }) ??
    renderEm(node, { parents, renderRest, spacingAfterChineseEm }) ??
    renderStrong(node, { parents, renderRest }) ??
    renderSimpleHtml(node, {
      parents,
      renderRest,
      renderDataSlot,
      renderHtml,
    }) ??
    renderDom(node)
  );
};
