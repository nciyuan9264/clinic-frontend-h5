import { FC, useMemo } from 'react';

import { KatexOptions } from 'katex';
import cs from 'classnames';

import { safeKatexTexToHtml } from './utils';
import { purifyHtml, useDeepCompareMemo } from '../../utils';
import { MdBoxTexProps } from '../../contexts';

import styles from './index.module.less';

export type KatexTexProps = MdBoxTexProps & {
  fallback?: React.ReactNode;
  katexOptions?: KatexOptions;
};

export const KatexTex: FC<KatexTexProps> = ({
  tex,
  /** 目前由于渲染样式要求，不消费 mode 参数 */
  mode: _mode,
  className,
  style,
  fallback,
  katexOptions,
}) => {
  const htmlStringOfInline = useDeepCompareMemo(
    () => safeKatexTexToHtml(tex, katexOptions),
    [tex, katexOptions],
  );

  const htmlStringOfBlock = useDeepCompareMemo(() => {
    if (htmlStringOfInline) {
      return null;
    }
    return safeKatexTexToHtml(tex, { ...katexOptions, displayMode: true });
  }, [tex, katexOptions, Boolean(htmlStringOfInline)]);

  const isSingleChar = useMemo(
    () => /^[a-zA-Z0-9\s]+$/.test(tex.trim()),
    [tex],
  );

  if (fallback && !htmlStringOfInline && !htmlStringOfBlock) {
    return <>{fallback}</>;
  }

  return (
    <span
      className={cs(styles.container, className, 'math-inline', {
        [styles.single]: isSingleChar,
        [styles.block]: Boolean(htmlStringOfBlock),
      })}
      style={style}
      dangerouslySetInnerHTML={{
        __html: purifyHtml((htmlStringOfInline || htmlStringOfBlock) ?? tex),
      }}
      data-custom-copy-text={isSingleChar ? tex : `\\(${tex}\\)`}
    />
  );
};

export default KatexTex;
