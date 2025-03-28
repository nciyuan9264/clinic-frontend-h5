import React, { FC, useState, useEffect } from 'react';

import cs from 'classnames';

import  IconLoading from './resources/loading_icon.svg';
import  IconChevronDown from './resources/chevron_down_icon.svg';
import {
  MdBoxCodeBarProps,
  useMdBoxConfig,
  useMdBoxTranslate,
} from '../../contexts';

import styles from './index.module.less';

export const CodeBar: FC<MdBoxCodeBarProps> = (props) => {
  const t = useMdBoxTranslate();

  const { mode } = useMdBoxConfig();

  const {
    loading,
    defaultExpand = false,
    showBar = true,
    children,
    expandedFinishedText = t('codeBarExpandedFinishedText'),
    unExpandFinishedText = t('codeBarUnExpandFinishedText'),
    codeBarLoadingText = t('codeBarLoadingText'),
    className: outerClassName,
    style,
    onCodeBarExpandChange,
  } = props;

  const [expand, setExpand] = useState(defaultExpand);

  useEffect(() => {
    setExpand(defaultExpand);
  }, [defaultExpand]);

  const renderContent = () => {
    if (loading) {
      return (
        <div
          className={cs(styles.loading, outerClassName)}
          onClick={() => setExpand((prev) => !prev)}
          style={style}
        >
          <IconLoading className={cs(styles.icon, styles.rotating)} />
          <span className={styles.loadingName}>{codeBarLoadingText}</span>
        </div>
      );
    }

    return (
      <div
        className={cs(styles.button, styles.hoverable, outerClassName)}
        data-testid="code-bar"
        onClick={() => {
          const targetExpandState = !expand;
          onCodeBarExpandChange?.(targetExpandState);
          setExpand(targetExpandState);
        }}
        style={style}
      >
        <div className={styles.title}>
          {expand ? expandedFinishedText : unExpandFinishedText}
        </div>
        <IconChevronDown
          className={cs(styles.icon, {
            [styles.reverse]: expand,
          })}
        />
      </div>
    );
  };

  return (
    <>
      {showBar && (
        <div className={cs(styles.container, styles[mode])}>
          {renderContent()}
        </div>
      )}
      {children?.(expand)}
    </>
  );
};

export default CodeBar;
