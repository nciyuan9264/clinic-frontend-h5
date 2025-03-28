import React, {
  forwardRef,
  useEffect,
  useRef,
  useMemo,
  useContext,
  useImperativeHandle,
} from 'react';

import { defaults, isBoolean } from 'lodash-es';
import cs from 'classnames';

import { MdBoxLightProps, MdBoxLightController } from './type';
import styles from './styles/index.module.less';
import {
  useIsRTL,
  useProcessMarkdown,
  useSmoothText,
  useHop,
  useCopy,
} from './hooks';
import { Markdown } from './components';
import { Table } from '../slots/table';
import { Strong } from '../slots/strong';
import { MdBoxSlotsContext } from '../slots/provider';
import { Paragraph } from '../slots/paragraph';
import { List } from '../slots/list';
import { Link } from '../slots/link';
import { LightTex } from '../slots/light-tex';
import { LightCodeBlockHighlighter } from '../slots/light-code-block-highlighter';
import { Indicator } from '../slots/indicator';
import { Image } from '../slots/image';
import { Header } from '../slots/header';
import { Emphasis } from '../slots/emphasis';
import { CodeBlock } from '../slots/code-block';
import { CodeBar } from '../slots/code-bar';
import { BreakLine, withMdBoxBreakLine } from '../slots/break-line';
import { Blockquote } from '../slots/blockquote';
import {
  MdBoxSlotsInnerProvider,
  MdBoxI18nProvider,
  MdBoxSlots,
  MdBoxSlotsWithRequired,
  MdBoxConfigProvider,
  MdBoxConfig,
} from '../contexts';

export * from './type';

export * from './hooks';

export * from './extra';

export const MdBoxLight = forwardRef<MdBoxLightController, MdBoxLightProps>(
  // eslint-disable-next-line max-lines-per-function
  function MdBoxLight(
    {
      className,
      style,
      theme = 'default',
      mode = 'light',
      markDown,
      eventCallbacks,
      showIndicator = false,
      autoFixSyntax = true,
      smooth = false,
      insertedElements = [],
      showEllipsis = false,
      imageOptions,
      autoFitRTL = false,
      codeBarConfig,
      adjacentCodeAsGroup = true,
      forceBrInterSpacing,
      spacingAfterChineseEm = 2,
      indentFencedCode,
      indentedCode,
      smartypants,
      enhancedCopy = false,
      autolink,
      customLink,
      autoSpacing,
      slots = {},
      translate = {},
      enabledHtmlTags: _enabledHtmlTags,
      purifyHtml,
      purifyHtmlConfig,
      astPlugins,
      sourcePlugins,
      modifyHtmlNode,
      renderHtml,
      renderRawHtml,
      renderDataSlot,
      onAstChange,
      onHop,
      ...restProps
    },
    ref,
  ) {
    const globalSlots = useContext(MdBoxSlotsContext);

    const requiredSlots = defaults<
      MdBoxSlots,
      MdBoxSlots,
      MdBoxSlotsWithRequired
    >(
      { ...slots },
      { ...globalSlots },
      {
        BreakLine,
        Tex: LightTex,
        CodeBlockHighlighter: LightCodeBlockHighlighter,
        CodeBlock,
        CodeBar,
        Table,
        Image,
        Indicator,
        Paragraph,
        Link,
        Emphasis,
        Header,
        List,
        Strong,
        Blockquote,
      },
    );

    const config: MdBoxConfig = {
      theme,
      mode,
    };

    const { Indicator: IndicatorSlot } = requiredSlots;

    const { text: smoothedText, flushCursor } = useSmoothText(markDown, smooth);

    const { katex, autoFixEnding, imageEmphasisTitle } = defaults(
      isBoolean(autoFixSyntax) ? {} : autoFixSyntax,
      {
        autoFixEnding: false,
      },
    );

    const enabledHtmlTags = useMemo(() => {
      if (renderDataSlot && _enabledHtmlTags !== true) {
        return [...(_enabledHtmlTags || []), 'data-block', 'data-inline'];
      }

      return _enabledHtmlTags;
    }, [_enabledHtmlTags, Boolean(renderDataSlot)]);

    const { source, ast } = useProcessMarkdown({
      source: smoothedText,
      processAst: Boolean(autoFixSyntax),
      showEllipsis,
      showIndicator,
      imageEmphasisTitle,
      indentFencedCode,
      indentedCode,
      insertedElements,
      autolink,
      autoSpacing,
      astPlugins,
      sourcePlugins,
      fixEnding: autoFixEnding,
      enabledHtmlTags,
      looseTruncateDataSlot: Boolean(renderDataSlot),
      katex,
    });

    const rtl = useIsRTL(autoFitRTL ? ast : undefined);

    const handleCopy = useCopy();

    const currentRef = useRef<HTMLDivElement>(null);

    useHop({
      onHop,
      ast,
      text: smoothedText,
      getRenderedText: () => currentRef.current?.textContent ?? '',
    });

    useEffect(() => {
      onAstChange?.(ast);
    }, [ast]);

    useImperativeHandle(
      ref,
      () => ({
        getRootElement: () => currentRef.current,
        flushSmoothCursor: flushCursor,
      }),
      [],
    );

    const handleSlotsAfterMemoedProcess = (
      memoedSlots: MdBoxSlotsWithRequired | null,
    ) => {
      if (!memoedSlots) {
        return memoedSlots;
      }

      return {
        ...memoedSlots,
        BreakLine: withMdBoxBreakLine(memoedSlots.BreakLine),
      };
    };

    /**
     * 当规格化内容为空且应展示指示符时，强制展示指示符，避免某些后缀不能加指示符的内容由于自动
     * 修复被切割成空串，导致整体字符串为空；省略号展示同理
     */
    if (!source.trim()) {
      return (
        <>
          {showEllipsis && '...'}
          {showIndicator && IndicatorSlot && <IndicatorSlot />}
        </>
      );
    }

    return (
      <MdBoxConfigProvider value={config}>
        <MdBoxSlotsInnerProvider
          value={requiredSlots}
          afterMemoedProcess={handleSlotsAfterMemoedProcess}
        >
          <MdBoxI18nProvider value={translate}>
            <div
              {...restProps}
              ref={currentRef}
              theme-mode={mode}
              className={cs(
                styles.container,
                'flow-markdown-body',
                styles[`theme-${theme}`],
                className,
              )}
              style={style}
              dir={rtl ? 'rtl' : 'ltr'}
              data-show-indicator={showIndicator}
              onCopy={enhancedCopy ? handleCopy : undefined}
            >
              <Markdown
                markDown={source}
                callbacks={eventCallbacks}
                insertedElements={insertedElements}
                imageOptions={imageOptions}
                codeBarConfig={codeBarConfig}
                adjacentCodeAsGroup={adjacentCodeAsGroup}
                forceBrInterSpacing={forceBrInterSpacing}
                spacingAfterChineseEm={spacingAfterChineseEm}
                smartypants={smartypants}
                customLink={customLink}
                enabledHtmlTags={enabledHtmlTags}
                purifyHtml={purifyHtml}
                purifyHtmlConfig={purifyHtmlConfig}
                modifyHtmlNode={modifyHtmlNode}
                renderHtml={renderHtml}
                renderRawHtml={renderRawHtml}
                renderDataSlot={renderDataSlot}
              />
            </div>
          </MdBoxI18nProvider>
        </MdBoxSlotsInnerProvider>
      </MdBoxConfigProvider>
    );
  },
);
