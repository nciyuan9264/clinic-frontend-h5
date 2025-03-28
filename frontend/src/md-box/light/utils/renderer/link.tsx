import React from 'react';

import { pick } from 'lodash-es';
import { domToReact, attributesToProps } from 'html-react-parser';

import { isElementType } from './utils';
import { RenderFunction } from '../../type';
import { createMdBoxSlots, MdBoxLinkProps } from '../../../contexts';

const ComposedLink = createMdBoxSlots('Link');

export type RenderLinkOptions = Pick<MdBoxLinkProps, 'customLink'>;

/**
 * 渲染链接元素
 * @param node html-react-parser解析的原始节点
 * @param options 选项
 * @returns 返回对普通协议的链接的定制
 */
export const renderLink: RenderFunction<true, RenderLinkOptions> = (
  node,
  { renderRest, customLink, callbacks = {}, parents },
) => {
  if (!isElementType(node, 'a')) {
    return;
  }

  const { href, title, ...restAttribs } = node.attribs;

  const isAutoLink = title === 'autolink';

  return (
    <ComposedLink
      {...attributesToProps(restAttribs)}
      raw={node}
      parents={parents}
      href={href}
      customLink={customLink}
      type={isAutoLink ? 'autolink' : 'markdown'}
      title={isAutoLink ? undefined : title}
      {...pick(callbacks, 'onLinkRender', 'onLinkClick', 'onSendMessage')}
    >
      {domToReact(node.children, {
        replace: renderRest,
      })}
    </ComposedLink>
  );
};
