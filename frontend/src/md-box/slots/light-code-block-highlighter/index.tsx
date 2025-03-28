import React from 'react';

import cs from 'classnames';

import { MdBoxCodeBlockHighlighterProps } from '../../contexts';

import styles from './index.module.less';

export const LightCodeBlockHighlighter: React.FC<MdBoxCodeBlockHighlighterProps> = ({
  language,
  code,
  className,
  style,
}) => {
  return (
    <pre
      className={cs(
        language && `language-${language}`,
        styles['light-scrollbar'],
        className,
      )}
      style={style}
    >
      <code>{code}</code>
    </pre>
  );
};

export default LightCodeBlockHighlighter;
