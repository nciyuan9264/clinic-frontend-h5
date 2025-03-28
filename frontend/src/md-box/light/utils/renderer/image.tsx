import React from 'react';

import { Element, attributesToProps } from 'html-react-parser';

import { isElementType, isTextType } from './utils';
import { RenderFunction } from '../../type';
import { safeParseUrl } from '../../../utils';
import { ImageOptions, createMdBoxSlots } from '../../../contexts';

interface HasSiblingTextOptions {
  /**
   * 是否将相邻的br换行也作为文本看待，当相邻是br时返回true。默认为true
   */
  regardSiblingBrAsText?: boolean;
}

const ComposedImage = createMdBoxSlots('Image');

const hasSiblingText = (node: Element, options: HasSiblingTextOptions = {}) => {
  const { regardSiblingBrAsText = true } = options;

  const defaultValue = {
    hasLeftText: false,
    hasRightText: false,
  };

  if (!node.parent) {
    return defaultValue;
  }

  const { children } = node.parent;

  const index = children.indexOf(node);

  if (index < 0) {
    return defaultValue;
  }

  const isTextLikeOfIndex = (targetIndex: number) =>
    targetIndex < children.length &&
    targetIndex >= 0 &&
    (isTextType(children[targetIndex]) ||
      (regardSiblingBrAsText
        ? isElementType(children[targetIndex], 'br')
        : false));

  return {
    hasLeftText: isTextLikeOfIndex(index - 1),
    hasRightText: isTextLikeOfIndex(index + 1),
  };
};

export interface RenderImageOptions {
  imageOptions?: ImageOptions;
  /**
   * 如果相邻是br换行，是否使用图片独立的上下margin分隔。默认为true
   * 影响行内图片展示效果，当段内换行具有段间距时，行内图片上下margin会导致margin过大
   */
  marginWithSiblingBr?: boolean;
}

/**
 * 渲染图片
 * @param node html-react-parser解析的原始节点
 * @param options 选项
 * @returns 返回对图片元素的定制
 */
export const renderImage: RenderFunction<false, RenderImageOptions> = (
  node,
  options = {},
) => {
  const {
    callbacks = {},
    imageOptions,
    marginWithSiblingBr = true,
    parents,
  } = options;

  const { onImageRender, onImageClick } = callbacks;

  if (!isElementType(node, 'img')) {
    return;
  }

  const { src, alt, width, height } = node.attribs;

  const attrWidth = Number(width);
  const attrHeight = Number(height);

  const { hasLeftText, hasRightText } = hasSiblingText(node, {
    regardSiblingBrAsText: marginWithSiblingBr,
  });

  return (
    <ComposedImage
      {...attributesToProps(node.attribs)}
      raw={node}
      parents={parents}
      src={safeParseUrl(src) && src}
      onImageClick={onImageClick}
      onImageRender={onImageRender}
      imageOptions={{
        alt,
        objectFit: 'cover',
        objectPosition: 'center',
        height: isNaN(attrHeight) ? 256 : attrHeight,
        width: isNaN(attrWidth) ? 400 : attrWidth,
        ...imageOptions,
      }}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
      }}
      wrapperStyle={{
        marginTop: hasLeftText ? 12 : undefined,
        marginBottom: hasRightText ? 12 : undefined,
      }}
      {...callbacks}
    />
  );
};
