import React, { forwardRef, useMemo } from 'react';

import { isUndefined } from 'lodash-es';
import cs from 'classnames';

import styles from './index.module.less';

export interface RawMathjaxTexProps {
  className?: string;
  style?: React.CSSProperties;
  tex: string;
  html?: string;
}

export const RawMathjaxTex = forwardRef<HTMLSpanElement, RawMathjaxTexProps>(
  function _RawMathjaxTex({ className, style, tex, html }, ref) {
    const isSingleChar = useMemo(
      () => /^[a-zA-Z0-9\s]+$/.test(tex.trim()),
      [tex],
    );

    const hasError = Boolean(html?.includes('data-mjx-error'));

    const shouldMountHtml = !isUndefined(html) && !hasError;

    return (
      <span
        ref={ref}
        className={cs(styles.container, className, 'math-inline', {
          [styles.single]: isSingleChar,
          [styles.error]: hasError,
        })}
        style={style}
        dangerouslySetInnerHTML={
          shouldMountHtml
            ? {
                __html: html,
              }
            : undefined
        }
        data-custom-copy-text={`\\(${tex}\\)`}
      >
        {!shouldMountHtml ? tex : null}
      </span>
    );
  },
);
