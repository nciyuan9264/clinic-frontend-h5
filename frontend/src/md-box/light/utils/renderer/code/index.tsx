import React, { FC, Fragment, ReactNode } from 'react';

import { isFunction } from 'lodash-es';
import {
  DOMNode,
  domToReact,
  Element,
  attributesToProps,
  Text,
} from 'html-react-parser';
import { innerText } from 'domutils';

import {
  getIndentFromCodeElememt,
  getLanguageFromElement,
  getMetaFromElement,
} from './utils';
import {
  getInnerText,
  isElementType,
  isEndlineText,
  isTextType,
  renderReactElement,
} from '../utils';
import { HIDE_HEADER_LANGUAGES } from '../../common/constants';
import { RenderFunction, ElementEventCallbacks } from '../../../type';
import { elementAt } from '../../../../utils';
import {
  MdBoxCodeBarProps,
  MdBoxCodeBlockGroupItem,
  createMdBoxSlots,
} from '../../../../contexts';
import {
  BlockElement,
  BlockElementChildrenProps,
} from '../../../../components';

import styles from './index.module.less';

const INDENT_WIDTH = 18;

const ComposedCodeBar = createMdBoxSlots('CodeBar');

const ComposedCodeBlock = createMdBoxSlots('CodeBlock');

export type CodeBarBaseConfig = Pick<
  MdBoxCodeBarProps,
  | 'defaultExpand'
  | 'expandedFinishedText'
  | 'unExpandFinishedText'
  | 'codeBarLoadingText'
> & {
  /**
   * 流式是否结束，用于计算每个代码块的 loading 参数
   */
  finished: boolean;

  /**
   * 简化模式
   * @default false
   */
  compact?: boolean;

  /**
   * 展示代码执行控制栏
   * @default true
   */
  showCodeBar?: boolean;
} & RenderCodeBlockOptions;

export type CodeBarConfig =
  | ((params: CodeBarConfigGetterParams) => CodeBarBaseConfig)
  | CodeBarBaseConfig;

export interface CodeBarConfigGetterParams {
  codeBlocks: MdBoxCodeBlockGroupItem[];
}

const isCodeBlockElement = (node: DOMNode): node is Element => {
  if (!isElementType(node, 'pre')) {
    return false;
  }

  const { childNodes } = node;

  /** 假如pre下没有任何code元素，则取消处理 */
  if (!childNodes.find((childNode) => isElementType(childNode, 'code'))) {
    return false;
  }

  return true;
};

interface RenderCodeBlockOptions {
  autoHideCodeHeaderLanguage?: string | string[];
}

interface EmptyWrapperElementProps {
  children: (params?: BlockElementChildrenProps) => ReactNode;
}

const EmptyWrapperElement: FC<EmptyWrapperElementProps> = ({ children }) => (
  <>{children()}</>
);

interface RenderCodeBlocksConfig {
  renderRest: (node: DOMNode) => JSX.Element | undefined;
  parents?: DOMNode[];
  autoHideCodeHeaderLanguage: string | string[] | undefined;
  compact: boolean;
  callbacks: ElementEventCallbacks;
  indentTabs?: number;
  loading?: boolean;
}

const renderCodeBlocks = (
  codeBlocks: MdBoxCodeBlockGroupItem[],
  config: RenderCodeBlocksConfig,
) => {
  const {
    autoHideCodeHeaderLanguage:
      _autoHideCodeHeaderLanguage = HIDE_HEADER_LANGUAGES,
    renderRest,
    parents,
    compact,
    callbacks = {},
    indentTabs = 0,
    loading,
  } = config;

  const { onCopyCodeBlock, onCodeBlockPreview, onCodeBlockShowEvent } =
    callbacks;
  const autoHideCodeHeaderLanguage = Array.isArray(_autoHideCodeHeaderLanguage)
    ? _autoHideCodeHeaderLanguage
    : [_autoHideCodeHeaderLanguage];

  const GroupItemWrapper = compact ? EmptyWrapperElement : BlockElement;
  const GroupWrapper = compact ? BlockElement : EmptyWrapperElement;

  return (
    <GroupWrapper>
      {({ className } = { className: '' }) =>
        codeBlocks.map(({ target: node }, index) => {
          if (!isCodeBlockElement(node)) {
            return null;
          }

          const classNameOfBlock =
            styles[
              `code-group-item--${
                codeBlocks.length <= 1 || !compact
                  ? 'normal'
                  : (
                      {
                        0: 'begin',
                        [codeBlocks.length - 1]: 'end',
                      } as const
                    )[index] ?? 'center'
              }`
            ];

          const { childNodes = [] } = node;
          return childNodes.map((node, index) => {
            return (
              <GroupItemWrapper>
                {() => {
                  if (isElementType(node, 'code')) {
                    const language = getLanguageFromElement(node);
                    const meta = getMetaFromElement(node);

                    return (
                      <ComposedCodeBlock
                        parents={parents}
                        code={getInnerText(node)}
                        language={language}
                        meta={meta}
                        showHeader={
                          !autoHideCodeHeaderLanguage.includes(
                            language.toLowerCase(),
                          )
                        }
                        key={index}
                        className={classNameOfBlock}
                        onCopyCode={onCopyCodeBlock}
                        onPreview={(text) =>
                          onCodeBlockPreview?.(text, language)
                        }
                        onShow={onCodeBlockShowEvent}
                        style={{
                          marginLeft: indentTabs
                            ? `${indentTabs * INDENT_WIDTH}px`
                            : undefined,
                        }}
                        loading={loading}
                      />
                    );
                  }

                  if (isElementType(node)) {
                    return (
                      <pre key={index} className={className}>
                        {renderRest(node)}
                      </pre>
                    );
                  }

                  return (
                    <pre key={index} className={className}>
                      {domToReact([node])}
                    </pre>
                  );
                }}
              </GroupItemWrapper>
            );
          });
        })
      }
    </GroupWrapper>
  );
};

type SplitItem =
  | {
      isCodeBlockGroup: true;
      codeBlocks: MdBoxCodeBlockGroupItem[];
    }
  | {
      isCodeBlockGroup: false;
      target: DOMNode;
      code: string;
    };

interface SplitToCodeBlockGroupParams {
  children: DOMNode[];
  adjacentCodeAsGroup?: boolean;
}

const splitToCodeBlockGroup = ({
  children,
  adjacentCodeAsGroup = true,
}: SplitToCodeBlockGroupParams): SplitItem[] => {
  const ret: SplitItem[] = [];
  let eof: Text | Element | null = null;

  for (const item of children) {
    if (isCodeBlockElement(item)) {
      const last = elementAt(ret, ret.length - 1);

      const language = getLanguageFromElement(item, '');

      const codeBlockItem: MdBoxCodeBlockGroupItem = {
        target: item,
        language,
        code: innerText(item),
      };

      if (last?.isCodeBlockGroup && adjacentCodeAsGroup) {
        last.codeBlocks.push(codeBlockItem);
      } else {
        ret.push({
          isCodeBlockGroup: true,
          codeBlocks: [codeBlockItem],
        });
      }
      continue;
    }

    if (isEndlineText(item)) {
      eof = item;
      continue;
    }

    if (eof) {
      ret.push({
        isCodeBlockGroup: false,
        target: eof,
        code: innerText(eof),
      });
      eof = null;
    }
    ret.push({
      isCodeBlockGroup: false,
      target: item,
      code: isElementType(item) || isTextType(item) ? innerText(item) : '',
    });
  }

  return ret;
};

export const renderCodeBlockGroup: RenderFunction<
  true,
  {
    codeBarConfig?: CodeBarConfig;
    callbacks?: ElementEventCallbacks;
    adjacentCodeAsGroup?: boolean;
  }
> = (
  node,
  { renderRest, codeBarConfig, adjacentCodeAsGroup, callbacks = {}, parents },
) => {
  if (!isElementType(node)) {
    return;
  }

  const { childNodes } = node;

  if (childNodes.every((item) => !isCodeBlockElement(item))) {
    return;
  }

  const splitResult = splitToCodeBlockGroup({
    children: childNodes,
    adjacentCodeAsGroup,
  });

  const { onCodeBarExpandChange } = callbacks;

  return renderReactElement(
    node.name,
    attributesToProps(node.attribs),
    splitResult.map((item, index) => {
      if (item.isCodeBlockGroup) {
        const { codeBlocks } = item;

        const isLastItem = index === splitResult.length - 1;

        const {
          finished,
          compact = false,
          showCodeBar,
          autoHideCodeHeaderLanguage,
          ...restConfig
        } = (isFunction(codeBarConfig)
          ? codeBarConfig({ codeBlocks })
          : codeBarConfig) || {};

        const showBar = showCodeBar ?? Boolean(codeBarConfig);

        const indentTabs = Math.min(
          /** 最大支持的缩进级别 */ 8,
          ...codeBlocks.map((codeBlockItem) =>
            Math.floor(getIndentFromCodeElememt(codeBlockItem.target) / 2),
          ),
        );

        const loading = isLastItem && !finished;

        return (
          <ComposedCodeBar
            raw={node}
            parents={parents}
            showBar={showBar}
            loading={loading}
            key={index}
            onCodeBarExpandChange={(currentState: boolean) =>
              onCodeBarExpandChange?.(currentState, codeBlocks?.at(0)?.language)
            }
            style={{
              marginLeft: indentTabs
                ? `${indentTabs * INDENT_WIDTH}px`
                : undefined,
            }}
            codeBlocks={codeBlocks}
            {...restConfig}
          >
            {(expand) =>
              (showBar ? expand : true) && (
                <>
                  {renderCodeBlocks(codeBlocks, {
                    renderRest,
                    autoHideCodeHeaderLanguage,
                    compact,
                    callbacks,
                    indentTabs,
                    loading,
                  })}
                </>
              )
            }
          </ComposedCodeBar>
        );
      } else {
        return <Fragment key={index}>{renderRest(item.target)}</Fragment>;
      }
    }),
  );
};
