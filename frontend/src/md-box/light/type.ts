import { Content, Parent } from 'mdast';
import { DOMNode, Element } from 'html-react-parser';
import type { Config } from 'dompurify';
import { Node } from 'domhandler';

import type {
  CodeBarConfig,
  InsertedElementItem,
  InsertedElementItemType,
  KatexType,
  RenderCustomNodeOptions,
  StandardNodeTypeEnum,
} from './utils';
import { SmoothOptions } from './hooks/smooth';
import { ProcessMarkdownAndProcessParams } from './hooks';
import {
  MdBoxSlots,
  MdBoxTranslate,
  ImageOptions,
  OnImageClickCallback,
  OnImageRenderCallback,
  OnLinkClickCallback,
  OnSendMessageCallback,
  OnLinkRenderCallback,
  OnCopyCodeBlockCallback,
  OnCodeBarExpandChangeCallback,
  OnCodeBlockPreviewCallback,
} from '../contexts';

export * from '../contexts/slots/type';

export { StandardNodeTypeEnum };

export type {
  CodeBarConfig,
  InsertedElementItem,
  InsertedElementItemType,
  MdBoxSlots,
  MdBoxTranslate,
  KatexType,
};

export { BaseAstPlugin, BaseSourcePlugin } from './utils';

export type {
  IAstPlugin,
  AstPluginModifier,
  AstPluginModifierParams,
  AstPluginConfig,
  AstPluginPriority,
  AstPluginHookFunctionType,
  ISourcePlugin,
  SourcePluginModifier,
  SourcePluginModifierParams,
  SourcePluginConfig,
  SourcePluginPriority,
  SourcePluginHookFunctionType,
} from './utils';

export interface ElementEventCallbacks {
  /**
   * 链接点击回调
   */
  onLinkClick?: OnLinkClickCallback;

  /**
   * 图片点击回调
   */
  onImageClick?: OnImageClickCallback;

  /**
   * Coco协议发送消息回调
   */
  onSendMessage?: OnSendMessageCallback;

  /**
   * 链接渲染回调，和 MarkDown 中的元素先序遍历顺序严格一致
   */
  onLinkRender?: OnLinkRenderCallback;

  /**
   * 图片渲染回调，和 MarkDown 中的元素先序遍历顺序严格一致
   */
  onImageRender?: OnImageRenderCallback;

  /**
   * 代码复制回调
   */
  onCopyCodeBlock?: OnCopyCodeBlockCallback;

  /**
   * 代码展开关闭回调
   */
  onCodeBarExpandChange?: OnCodeBarExpandChangeCallback;

  /**
   * 代码块预览回调
   */
  onCodeBlockPreview?: OnCodeBlockPreviewCallback;
  onCodeBlockShowEvent?: (codeType?: string) => void;
}

export interface OnHopParams {
  renderedText: string;
  prevRenderedText: string;
  ast?: Parent;
  prevAst?: Parent;
  prevEndNode?: Content | Parent;
  endNode?: Content | Parent;
  prevEndNodeType?: StandardNodeTypeEnum;
  endNodeType?: StandardNodeTypeEnum;
}

export type OnHopCallback = (params: OnHopParams) => void;

export interface AutoFixSyntaxConfig {
  /**
   * 自动修复数学公式语法依赖的katex库
   * 对于 MdBoxLight，不传则不启用数学公式自动修复
   * 对于 MdBoxLazy，不传则使用lazy版本的katex，即按需加载
   * 对于 MdBox，不传则使用原版的katex
   */
  katex?: KatexType;
  /**
   * 是否尝试修复末尾疑似截断的内容
   * @defaults false
   */
  autoFixEnding?: boolean;
  /**
   * 启用图片下一行的强调视为图片下标题的功能
   * @default false
   */
  imageEmphasisTitle?: boolean;
}

export interface RenderHtmlParams {
  /** 标签名称，已转换成小写 */
  tagName: string;
  /** 元素参数 */
  props: Record<string, unknown> & { style?: React.CSSProperties };
  /** 子元素 */
  children: React.ReactNode;
  /** 该元素的抽象节点 */
  node: Element;
  /** 内部节点 HTML */
  childrenHTML: string;
  /** 当前节点 HTML */
  currentHTML: string;
}

export type RenderHtmlType = (
  params: RenderHtmlParams,
) => JSX.Element | null | undefined;

export interface RenderRawHtmlParams {
  /** 标签名称，已转换成小写 */
  tagName: string;
  /** 元素参数 */
  props: Record<string, unknown> & { style?: React.CSSProperties };
  /** 父节点列表，越靠近的父节点越靠前 */
  parents: DOMNode[];
  /** 渲染剩余部分 */
  renderRest: (node: DOMNode) => React.ReactNode;
  /** 该元素的抽象节点 */
  node: Element;
  /** 内部节点 HTML */
  childrenHTML: string;
  /** 当前节点 HTML */
  currentHTML: string;
}

export type RenderRawHtmlType = (
  params: RenderRawHtmlParams,
) => JSX.Element | null | undefined;

export interface RenderDataSlotParamsType {
  /**
   * 插槽类型
   * inline 是行内展示，block 是单行展示
   */
  display: 'inline' | 'block';
  /** 插槽名称 */
  type: string;
  /** 插槽内容 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  /** 兜底文本 */
  alt?: string;
  /** 子元素 */
  children: React.ReactNode;
}

export type RenderDataSlotType = (
  params: RenderDataSlotParamsType,
) => React.ReactNode;

export type MdBoxLightProps = Pick<
  ProcessMarkdownAndProcessParams,
  | 'enabledHtmlTags'
  | 'autolink'
  | 'autoSpacing'
  | 'insertedElements'
  | 'indentFencedCode'
  | 'indentedCode'
  | 'showEllipsis'
  | 'showIndicator'
  | 'astPlugins'
  | 'sourcePlugins'
> &
  Pick<RenderCustomNodeOptions, 'customLink'> & {
    className?: string;
    style?: React.CSSProperties;

    /**
     * Markdown 字符串
     */
    markDown: string;

    /**
     * 风格，default为默认样式，samantha为新版豆包 / Cici对齐样式
     * @default "default"
     */
    theme?: 'default' | 'samantha';

    /**
     * 模式，light为亮色模式，dark为暗色模式
     * @default "light"
     */
    mode?: 'light' | 'dark';

    /**
     * 事件回调
     */
    eventCallbacks?: ElementEventCallbacks;

    /**
     * 启用 Markdown 语法修复
     * @default false
     */
    autoFixSyntax?: boolean | AutoFixSyntaxConfig;

    /**
     * 内容更新平滑化
     * 具体算法见：[Flow Markdown 流式输出平滑化设计文档](https://bytedance.larkoffice.com/wiki/CIYSwotMXiCNvxksY0LcyxfbnWb)
     * @default false
     */
    smooth?: boolean | SmoothOptions;

    /**
     * 图片设置参数
     * @default
     * {
     *   objectFit: 'cover',
     *   objectPosition: 'center',
     *   height: 256,
     *   width: 400,
     * }
     */
    imageOptions?: ImageOptions;

    /**
     * 自动适配RTL内容
     * @default false
     */
    autoFitRTL?: boolean;

    /**
     * 代码块控制条配置，不传则不展示代码块控制条
     */
    codeBarConfig?: CodeBarConfig;

    /**
     * 相邻代码块合并为一组，一组共用一个 loading 参数、代码块控制条配置等上下文
     * @default true
     */
    adjacentCodeAsGroup?: boolean;

    /**
     * 强制段落内换行展示段间距
     * @default false
     */
    forceBrInterSpacing?: boolean;

    /**
     * 在中文斜体字符与非斜体字符之间留出间距，默认为2px
     * @default 2
     */
    spacingAfterChineseEm?: boolean | number;

    /**
     * 是否启用 html smartypants 转换规则
     * 具体见：[smartypants.js](https://github.com/othree/smartypants.js)
     * @default false
     */
    smartypants?: boolean;

    /**
     * 是否启用强化的复制行为，可以精确地复制代码块、公式等内容
     * @default false
     */
    enhancedCopy?: boolean;

    /**
     * 过滤最终生成的 HTML 字符串中的不安全内容
     * 传 true 则使用 dompurify 库的默认配置过滤，传 false 则不做过滤；传方法则使用自定义
     * 的方法过滤，方法的第二个参数 `config` 表示 DOMPurify 配置
     * @default true
     */
    purifyHtml?: boolean | ((source: string, config: Config) => string);

    /**
     * HTML 净化配置，用于内部传入 DOMPurify 净化 HTML
     */
    purifyHtmlConfig?: Config | ((config: Config) => Config);

    /**
     * 修改 Html 抽象节点，可以直接修改引用，或创建新的引用返回
     */
    modifyHtmlNode?: (node: Node[]) => Node[] | undefined;

    /**
     * AST 变化回调
     */
    onAstChange?: (ast?: Parent) => void;

    /**
     * 渲染跳变回调
     */
    onHop?: OnHopCallback;

    /**
     * 自定义渲染的组件（插槽）
     */
    slots?: MdBoxSlots;

    /**
     * 自定义文案
     */
    translate?: MdBoxTranslate;

    /**
     * HTML 自定义渲染，最低优先级访问并渲染任何 Markdown HTML 标签外的自定义标签
     * 当不传或返回 undefined 时，继续内部的默认渲染行为
     */
    renderHtml?: RenderHtmlType;

    /**
     * 原生 HTML 自定义渲染，可以最先访问并渲染任何 Markdown HTML 标签
     * 当不传或返回 undefined 时，继续内部的默认渲染行为
     */
    renderRawHtml?: RenderRawHtmlType;

    /**
     * [Markdown 复杂富媒体方案](https://bytedance.larkoffice.com/docx/Tvr9du0xXoRvlNxpoekciBj7nDb) 渲染方法。
     * 当不传时，不启用复杂富媒体标签；当返回 undefined 时，返回标签的 alt 内容
     */
    renderDataSlot?: RenderDataSlotType;
  };

interface RenderRestOptionSlice {
  renderRest: (node: DOMNode) => JSX.Element | undefined;
}

type RenderFunctionOptionsType<ShouldRenderRest extends boolean = true> = {
  callbacks?: ElementEventCallbacks;
  parents?: DOMNode[];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & (ShouldRenderRest extends true ? RenderRestOptionSlice : {});

export type RenderFunction<
  ShouldRenderRest extends boolean = true,
  ExtraOptions extends NonNullable<unknown> = NonNullable<unknown>,
> = RenderFunctionOptionsType<ShouldRenderRest> &
  ExtraOptions extends infer Options
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {} extends Options
    ? (node: DOMNode, options?: Options) => JSX.Element | undefined
    : (node: DOMNode, options: Options) => JSX.Element | undefined
  : never;

export interface MdBoxLightController {
  getRootElement: () => HTMLElement | null;
  flushSmoothCursor: () => void;
}
