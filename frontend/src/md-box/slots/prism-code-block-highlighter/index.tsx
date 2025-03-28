import React, { FC } from 'react';

import cs from 'classnames';

import { useHighLight } from './utils';
import styles from './styles/index.module.less';
import { purifyHtml } from '../../utils';
import { MdBoxCodeBlockHighlighterProps } from '../../contexts';

export const PrismCodeBlockHighlighter: FC<MdBoxCodeBlockHighlighterProps> = ({
  code,
  language = '',
  className,
  style,
  dark = false,
}) => {
  const highlightedHtml = useHighLight(code, language);

  return (
    <pre
      className={cs(
        styles.container,
        className,
        language && `language-${language}`,
        {
          [styles.dark]: dark,
        },
      )}
      style={style}
    >
      <code
        className={language && `language-${language}`}
        dangerouslySetInnerHTML={{
          __html: purifyHtml(highlightedHtml),
        }}
      />
    </pre>
  );
};

export default PrismCodeBlockHighlighter;
