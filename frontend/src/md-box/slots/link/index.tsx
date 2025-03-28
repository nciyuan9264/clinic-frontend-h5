import React, { useEffect } from 'react';

import { isFunction, omit } from 'lodash-es';
import cs from 'classnames';

import { parseJSON } from './utils';
import { safeParseUrl, useComputeValue } from '../../utils';
import { MdBoxLinkProps, LinkType } from '../../contexts';

import styles from './index.module.less';

const isHttpLink = (link: string) => {
  const parsedLink = safeParseUrl(link);

  if (!parsedLink) {
    return false;
  }

  return parsedLink.protocol === 'http:' || parsedLink.protocol === 'https:';
};

const isCocoLink = (link: string) => {
  const parsedLink = safeParseUrl(link);

  if (!parsedLink) {
    return false;
  }

  return parsedLink.protocol === 'coco:';
};

/** 被链接元素替换成的组件 */
// eslint-disable-next-line max-lines-per-function
export const Link: React.FC<MdBoxLinkProps> = ({
  className,
  style,
  href,
  children,
  customLink = true,
  onSendMessage,
  onLinkClick,
  onLinkRender,
  onOpenLink,
  type: _type,
  raw: _raw,
  parents: _parents,
  ...restProps
}) => {
  const parsedUrl = href ? safeParseUrl(href) : null;

  const isValidLink = useComputeValue(() => {
    if (!href) {
      return false;
    }

    if (isHttpLink(href)) {
      return true;
    }

    if (isFunction(customLink)) {
      return customLink(href);
    }

    return customLink;
  });

  const handleOpenLink = (url?: string) => {
    if (onOpenLink) {
      onOpenLink?.(url);
      return;
    }

    window.open(url);
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    /* istanbul ignore if */
    if (!href || !parsedUrl) {
      event.preventDefault();
      return;
    }

    if (isCocoLink(href)) {
      event.preventDefault();
      const message = parsedUrl.searchParams.get('msg');
      const ext = parsedUrl.searchParams.get('ext');
      const extObj = ext
        ? /* istanbul ignore next */ parseJSON(ext)
        : undefined;
      const wikiLink = extObj?.s$wiki_link;

      /* istanbul ignore if */
      if (wikiLink) {
        if (isHttpLink(wikiLink)) {
          onLinkClick?.(event, {
            url: href,
            parsedUrl,
            exts: { wiki_link: wikiLink, type: LinkType.wiki },
            openLink: handleOpenLink,
          });
        }

        return;
      }

      if (message) {
        onSendMessage?.(message);
        return;
      }

      onLinkClick?.(event, {
        url: href,
        parsedUrl,
        exts: { type: LinkType.coco },
        openLink: handleOpenLink,
      });
    }

    if (!isHttpLink(href)) {
      return;
    }

    /* istanbul ignore else */
    if (onLinkClick) {
      onLinkClick(event, {
        url: href,
        parsedUrl,
        exts: {
          type: LinkType.normal,
        },
        openLink: handleOpenLink,
      });
    } else {
      event.preventDefault();
      event.stopPropagation();
      handleOpenLink(href);
    }
  };

  useEffect(() => {
    if (href && parsedUrl) {
      onLinkRender?.({
        url: href,
        parsedUrl,
      });
    }
  }, [href]);

  if (!isValidLink) {
    return <>{children}</>;
  }

  return (
    <a
      {...omit(restProps, 'href')}
      className={cs(styles.link, className)}
      style={style}
      onClick={handleClick}
      href={parsedUrl ? href : undefined}
      target="_blank"
    >
      {children}
    </a>
  );
};

export default Link;
