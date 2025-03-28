import React, { Fragment } from 'react';

import { isUndefined } from 'lodash-es';
import { attributesToProps } from 'html-react-parser';
import htmlEntity from 'he';

import { isElementType, isTextType, renderReactElement } from './utils';
import { parseJSONWithNull, stringifyDomNode } from '../common';
import { RenderDataSlotType, RenderFunction, RenderHtmlType } from '../../type';
import { createMdBoxSlots } from '../../../contexts';
import { BlockElement } from '../../../components';

const ComposedBreakLine = createMdBoxSlots('BreakLine');

const ComposedBlockquote = createMdBoxSlots('Blockquote');

export interface RenderSimpleHtmlOptions {
  renderHtml?: RenderHtmlType;
  renderDataSlot?: RenderDataSlotType;
}

export const renderSimpleHtml: RenderFunction<true, RenderSimpleHtmlOptions> = (
  node,
  { renderRest, renderHtml, renderDataSlot, parents },
) => {
  if (!isElementType(node)) {
    return;
  }

  const tagName = node.name.toLowerCase();

  const props = attributesToProps(node.attribs);

  const children = node.children.length
    ? node.children.map((item, index) => (
        <Fragment key={index}>{renderRest(item)}</Fragment>
      ))
    : undefined;

  if (renderDataSlot && ['data-inline', 'data-block'].includes(tagName)) {
    const { type, value, alt } = props;

    return (
      <>
        {renderDataSlot({
          display: tagName === 'data-inline' ? 'inline' : 'block',
          type,
          value: parseJSONWithNull(htmlEntity.decode(value, { strict: false })),
          alt,
          children,
        }) ?? alt}
      </>
    );
  }

  let customRenderedElement: React.ReactNode;

  if (renderHtml) {
    customRenderedElement = renderHtml?.({
      tagName,
      props,
      children,
      node,
      currentHTML: stringifyDomNode(node),
      childrenHTML: stringifyDomNode(node.childNodes),
    });
  }

  if (!isUndefined(customRenderedElement)) {
    return <>{customRenderedElement}</>;
  }

  if (tagName === 'br') {
    return <ComposedBreakLine raw={node} parents={parents} />;
  }

  if (tagName === 'blockquote') {
    return (
      <ComposedBlockquote
        raw={node}
        node={node}
        parents={parents}
        renderRest={renderRest}
      />
    );
  }

  if (tagName === 'hr') {
    return <BlockElement node={node} renderRest={renderRest} />;
  }

  if (node.children.length === 1) {
    const firstChildren = node.children[0];

    if (isTextType(firstChildren) && !firstChildren.data.trim()) {
      return <></>;
    }
  }

  return renderReactElement(tagName, props, children);
};
