import React, { useEffect, useState } from 'react';

import copy from 'copy-to-clipboard';
import cs from 'classnames';

import { useAutoDetectLanguage } from './utils';
import NightIcon from './resources/night-icon.svg';
import DoneIcon from './resources/done-icon.svg';
import DayIcon from './resources/day-icon.svg';
import CopyIcon from './resources/copy-icon.svg';
import CodeIcon from './resources/code-icon.svg';
import {
  MdBoxCodeBlockProps,
  useMdBoxConfig,
  useMdBoxSlots,
} from '../../contexts';

import styles from './index.module.less';

export const CodeBlock: React.FC<MdBoxCodeBlockProps> = ({
  className,
  style,
  code,
  language,
  onCopyCode,
  showHeader = true,
  raw,
  parents,
}) => {
  const { mode } = useMdBoxConfig();

  const isGlobalDark = mode === 'dark';

  const [isLocalDark, setIsLocalDark] = useState(isGlobalDark);

  const isDark = isGlobalDark || isLocalDark;

  const { CodeBlockHighlighter } = useMdBoxSlots();

  const [isCopied, setIsCopied] = useState(false);

  const currentLanguage = useAutoDetectLanguage(code, language);

  useEffect(() => {
    setIsLocalDark(isGlobalDark);
  }, [mode]);

  const handleCopy = () => {
    if (isCopied) {
      return;
    }

    copy(code);
    onCopyCode?.(code);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleSwitchIsDark = () => {
    setIsLocalDark(!isLocalDark);
  };

  return (
    <div
      data-testid="code_block"
      className={cs(styles.container, className, 'hide-indicator', {
        [styles.dark]: isDark,
      })}
      style={style}
    >
      <div className={cs(styles['code-area'])} dir="ltr">
        {showHeader && (
          <div className={styles.header}>
            <div className={styles.text}>
              <img src={CodeIcon} className={styles.icon} alt="" />
              {currentLanguage}
            </div>
            <div className={styles.actions}>
              <div className={styles.item} onClick={handleCopy}>
                <div
                  className={cs(styles.icon, styles.hoverable)}
                  data-testid="code_block_copy"
                >
                  {isCopied ? (
                    <img src={DoneIcon} className={styles.img} />
                  ) : (
                    <img src={CopyIcon} className={styles.img} />
                  )}
                </div>
              </div>
              {!isGlobalDark && (
                <div className={styles.item} onClick={handleSwitchIsDark}>
                  <div
                    className={cs(styles.icon, styles.hoverable)}
                    data-testid="code_block_mode_switch"
                  >
                    {isLocalDark ? (
                      <img src={DayIcon} className={styles.img} />
                    ) : (
                      <img src={NightIcon} className={styles.img} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className={cs(
            styles.content,
            styles[`content--${currentLanguage.toLowerCase()}`],
          )}
        >
          {CodeBlockHighlighter && (
            <CodeBlockHighlighter
              code={code}
              language={language}
              raw={raw}
              parents={parents}
              dark={isDark}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;
