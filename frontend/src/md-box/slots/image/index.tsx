/* eslint-disable max-lines-per-function */
import React, { useEffect, useState } from 'react';

import { defaults, isBoolean, isNumber } from 'lodash-es';
import cs from 'classnames';
import { Viewer } from '@/viewer-react';

import ErrorIcon from './resources/icon-error.svg';
import { resizeImage } from '../../utils';
import { MdBoxImageProps, ImageEventData, ImageStatus } from '../../contexts';

import styles from './index.module.less';

const convertHttpToHttps = (url: string) => {
  const parsedUrl = new URL(url);

  if (parsedUrl.protocol === 'http:') {
    parsedUrl.protocol = 'https:';
  }

  return parsedUrl.toString();
};

/** 被图片元素替换成的组件 */
export const Image: React.FC<MdBoxImageProps> = ({
  className,
  style,
  raw: _raw,
  parents: _parents,
  wrapperClassName,
  wrapperStyle,
  src = null,
  otherFormatSrc,
  onImageClick,
  onImageRender,
  /* istanbul ignore next */
  imageOptions = {
    layout: 'intrinsic',
    objectFit: 'contain',
  },
  errorClassName,
  children,
  onImageLoadComplete,
  useCustomPlaceHolder = false,
  customPlaceHolder,
  onImageContextMenu,
  onImageMouseEnter,
  ...restProps
}) => {
  const {
    squareContainer = false,
    forceHttps = false,
    responsiveNaturalSize = false,
    width: propWidth = 400,
    height: propHeight = 256,
    showTitle = false,
    centered = false,
    ...restImageOptions
  } = imageOptions;

  const { alt } = imageOptions;

  const [width, setWidth] = useState(propWidth);
  const [height, setHeight] = useState(propHeight);

  useEffect(() => {
    if (propWidth || propHeight) {
      setWidth(propWidth);
      setHeight(propHeight);
    }
  }, [propWidth, propHeight]);

  const { minHeight, minWidth, maxHeight, maxWidth } = defaults(
    isBoolean(responsiveNaturalSize) ? {} : { ...responsiveNaturalSize },
    {
      minHeight: 0,
      minWidth: 0,
      // for 类型安全
      maxWidth: propWidth ?? 400,
      maxHeight: propHeight ?? 256,
    },
  );

  const srcString = src && (forceHttps ? convertHttpToHttps(src) : src);

  const [status, setStatus] = useState(ImageStatus.Loading);

  const imageReady = status !== ImageStatus.Loading;

  const eventData: ImageEventData = {
    src: srcString,
    status,
  };

  //viewer组件在safari下面设置width、height不生效，导致viewer没有隐藏
  const hideViewer =
    (responsiveNaturalSize || useCustomPlaceHolder) && !imageReady;

  useEffect(() => {
    if (srcString) {
      onImageRender?.(eventData);
    }
  }, [srcString]);

  const wrapperSize = isNumber(width) &&
    isNumber(height) && {
      width: '100%',
      height: 0,
      paddingBottom: `min(${(height / width) * 100}%, ${height}px)`,
      maxWidth: width,
    };

  return (
    <div
      className={cs(styles.container, {
        [styles.centered]: centered,
      })}
      style={wrapperStyle}
    >
      <div
        onClick={(event) => {
          if (onImageClick && eventData) {
            onImageClick(event, eventData);
            // FIXME: 某些场景是需要冒泡的，应该交给接入方自己去控制是否阻止冒泡。
            event.stopPropagation();
          }
        }}
        className={cs(
          styles['image-wrapper'],
          {
            [styles.clickable]: Boolean(onImageClick),
            [styles.square]: squareContainer,
          },
          wrapperClassName,
        )}
        style={{ ...wrapperSize }}
        data-testid="mdbox_image"
      >
        {children || (
          <>
            {responsiveNaturalSize && !imageReady && !useCustomPlaceHolder && (
              // 用于展示 loading 态
              <span className={styles['loading-image']}>
                <Viewer
                  {...restProps}
                  {...restImageOptions}
                  height={height}
                  width={width}
                  placeholder="skeleton"
                  src=""
                />
              </span>
            )}
            <span
              style={{
                display: 'inline-block',
                ...(hideViewer
                  ? {
                      width: 0,
                      height: 0,
                    }
                  : {}),
              }}
            >
              <Viewer
                {...restProps}
                {...restImageOptions}
                onContextMenu={onImageContextMenu}
                onMouseEnter={onImageMouseEnter}
                height={height}
                width={width}
                alt="image"
                src={srcString ?? ''}
                formats={['avif', 'webp']}
                placeholder="skeleton"
                loader={({ extra: { origin }, format }) => {
                  /* istanbul ignore next */
                  if (otherFormatSrc?.avifSrc && format === 'avis') {
                    return otherFormatSrc?.avifSrc;
                  } else if (otherFormatSrc?.webpSrc && format === 'awebp') {
                    return otherFormatSrc?.webpSrc;
                  } else {
                    return srcString ?? origin;
                  }
                }}
                error={
                  <div
                    className={cs(
                      styles['error-wrapper'],
                      errorClassName,
                      'error-wrapper',
                    )}
                    ref={() => {
                      setStatus(ImageStatus.Failed);
                      onImageLoadComplete?.();
                    }}
                  >
                    <ErrorIcon className={styles.fallbackIcon} />
                  </div>
                }
                onLoadingComplete={(result) => {
                  /* istanbul ignore next */
                  setStatus(ImageStatus.Success);
                  onImageLoadComplete?.();

                  const { naturalWidth, naturalHeight } = result;
                  if (responsiveNaturalSize && naturalWidth && naturalHeight) {
                    const size = resizeImage({
                      width: naturalWidth,
                      height: naturalHeight,
                      minHeight,
                      minWidth,
                      maxHeight,
                      maxWidth,
                    });

                    setWidth(size.width);
                    setHeight(size.height);
                  }

                  restImageOptions.onLoadingComplete?.(result);
                }}
                className={cs(className, styles.image)}
                style={style}
              />
            </span>
            {useCustomPlaceHolder && !imageReady && customPlaceHolder}
          </>
        )}
      </div>

      {showTitle && alt && <div className={styles.title}>{alt}</div>}
    </div>
  );
};

export default Image;
