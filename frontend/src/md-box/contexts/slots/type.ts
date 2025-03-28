import React, { ComponentType, PropsWithChildren, MouseEvent } from 'react';

import type { DOMNode, Element } from 'html-react-parser';
import type { ViewerProps } from '@/viewer-react';

// eslint-disable-next-line @typescript-eslint/ban-types
type MdBoxComponentsCommonProps<T = {}> = T &
  Omit<
    {
      className?: string;
      style?: React.CSSProperties;
      children?: React.ReactNode;
      renderRest?: (node: DOMNode) => React.ReactNode;
      raw?: DOMNode;
      parents?: DOMNode[];
    },
    keyof T
  >;

export type MdBoxBreakLineProps = MdBoxComponentsCommonProps<
  NonNullable<unknown>
>;

export type MdBoxTexProps = MdBoxComponentsCommonProps<{
  tex: string;
  mode?: 'display' | 'inline';
}>;

export type MdBoxCodeBlockProps = MdBoxComponentsCommonProps<{
  language?: string;
  code: string;
  showHeader?: boolean;
  meta?: string;
  onCopyCode?: (text: string) => void;
  onPreview?: (text: string) => void;
  onShow?: (codeType?: string) => void;
  /**
   * 缩进的空格数
   * @default 0
   */
  indent?: number;
  viewOnly?: boolean;
  /**
   * 加载状态
   * @default false
   */
  loading?: boolean;
}>;

export type MdBoxCodeBlockHighlighterProps = MdBoxComponentsCommonProps<{
  language?: string;
  code: string;
  dark?: boolean;
}>;

export interface MdBoxCodeBlockGroupItem {
  target: Element;
  language: string;
  code: string;
}

export type MdBoxCodeBarProps = MdBoxComponentsCommonProps<{
  loading: boolean;
  defaultExpand?: boolean;
  showBar?: boolean;
  children?: (expand: boolean) => React.ReactNode;
  /** 完成并展开时展示的文案，覆盖默认文案，用于动态控制文案渲染 */
  expandedFinishedText?: string;
  /** 完成并未折叠态时展示的文案，覆盖默认文案，用于动态控制文案渲染 */
  unExpandFinishedText?: string;
  /** 加载中的文案信息 */
  codeBarLoadingText?: string;
  /** 触发点击收起按钮的回调, 传入的是改后状态 */
  onCodeBarExpandChange?: (expand: boolean) => void;
  /** 包含的代码块列表 */
  codeBlocks: MdBoxCodeBlockGroupItem[];
}>;

export type MdBoxTableProps = MdBoxComponentsCommonProps<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>;

export type MdBoxEmphasisProps = MdBoxComponentsCommonProps<{
  node: Element;
}>;

export type MdBoxStrongProps = MdBoxComponentsCommonProps<{
  node: Element;
}>;

export type MdBoxHeaderProps = MdBoxComponentsCommonProps<{
  node: Element;
}>;

export type MdBoxBlockquoteProps = MdBoxComponentsCommonProps<{
  node: Element;
}>;

export type MdBoxListProps = MdBoxComponentsCommonProps<{
  node: Element;
}>;

export type OnImageClickCallback<T = unknown> = (
  event: MouseEvent,
  eventData: ImageEventData,
  image?: T,
  imageList?: T[],
) => void;

export type OnImageRenderCallback = (event: ImageEventData) => void;

/** 图片右键点击 */
export type OnImageContextMenu = (e: MouseEvent) => void;

/** 图片 hover 触发 */
export type onImageMouseEnter = (e: MouseEvent) => void;

export type OnCopyCodeBlockCallback = (content: string) => void;

export type OnCodeBlockPreviewCallback = (
  content: string,
  language: string,
) => void;

export type OnCodeBarExpandChangeCallback = (
  currentState: boolean,
  codeType?: string,
) => void;

export interface ResponsiveNaturalSizeOptions {
  /**
   * @default 0
   */
  minWidth?: number;
  /**
   * @default 0
   */
  minHeight?: number;
  /**
   * @default 同 imageOptions.width
   */
  maxWidth?: number;
  /**
   * @default 同 imageOptions.height
   */
  maxHeight?: number;
}

export type ImageOptions = Omit<ViewerProps, 'src' | 'error'> & {
  squareContainer?: boolean;
  forceHttps?: boolean;
  /**
   * 是否根据图片原始尺寸渲染，指定宽高时则按比例缩小
   *
   * **开启时，imageOptions.width、imageOptions.height 为 loading 区大小，同时作为 maxWidth、maxHeight 默认值**
   * @default false
   */
  responsiveNaturalSize?: boolean | ResponsiveNaturalSizeOptions;
  /**
   * 展示图片标题
   * @default false
   */
  showTitle?: boolean;
  /**
   * 图片居中
   * @default false
   */
  centered?: boolean;
};

export type MdBoxImageProps = MdBoxComponentsCommonProps<
  PropsWithChildren<{
    className?: string;
    style?: React.CSSProperties;
    wrapperClassName?: string;
    wrapperStyle?: React.CSSProperties;
    /** 当此项为空时展示缩略图 */
    src?: string | null;
    otherFormatSrc?: {
      webpSrc?: string;
      avifSrc?: string;
    };
    layout?: 'fill' | 'raw';
    onImageClick?: OnImageClickCallback;
    onImageRender?: OnImageRenderCallback;
    onImageContextMenu?: OnImageContextMenu;
    onImageMouseEnter?: onImageMouseEnter;
    /** 只要传任何非空参数，则会覆盖默认参数 */
    imageOptions?: ImageOptions;
    errorClassName?: string;
    onImageLoadComplete?: () => void;
    useCustomPlaceHolder?: boolean;
    customPlaceHolder?: React.ReactNode;
  }>
>;

export enum ImageStatus {
  Loading = 'loading',
  Success = 'success',
  Failed = 'failed',
}

export interface ImageEventData {
  src: string | null;
  status: ImageStatus;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type MdBoxIndicatorProps = MdBoxComponentsCommonProps<{}>;

export type MdBoxParagraphProps = MdBoxComponentsCommonProps<
  PropsWithChildren<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    > & {
      forceBrInterSpacing?: boolean;
    }
  >
>;

export type OnLinkClickCallback = (
  event: MouseEvent,
  eventData: LinkEventData,
) => void;

export type OnSendMessageCallback = (message: string) => void;

export type OnLinkRenderCallback = (
  event: Omit<LinkEventData, 'exts' | 'openLink'>,
) => void;

export type OnOpenLinkCallback = (url?: string) => void;

export const enum LinkType {
  'wiki' = 'wiki',
  'normal' = 'normal',
  /** 除了有msg、wiki_link的coco链接 */
  coco = 'coco',
}

export interface LinkEventData {
  url: string;
  parsedUrl: URL;
  exts: {
    type: LinkType;
    wiki_link?: string;
  };
  openLink: (url?: string) => void;
}

export type MdBoxLinkCustomLinkAllowed = boolean | ((link: string) => void);

export type MdBoxLinkProps = MdBoxComponentsCommonProps<
  PropsWithChildren<{
    href?: string;
    type?: 'markdown' | 'autolink';
    title?: string;
    /**
     * @default true
     * 启用自定义链接，可传入判断方法
     */
    customLink?: MdBoxLinkCustomLinkAllowed;
    onLinkClick?: OnLinkClickCallback;
    onSendMessage?: OnSendMessageCallback;
    onLinkRender?: OnLinkRenderCallback;
    onOpenLink?: OnOpenLinkCallback;
  }>
>;

/**
 * 以下任意组件，当传 null 时强制关闭，不传（或 undefined）时走默认行为
 */
export interface MdBoxSlots {
  /**
   * 换行插槽
   * 不传则使用默认组件
   */
  BreakLine?: ComponentType<MdBoxBreakLineProps> | null;
  /**
   * 公式渲染器插槽
   * 对于 MdBoxLight，不传则默认为 null
   * 对于 MdBox / MdBoxLazy，不传则使用默认组件（包含 mathjax）
   */
  Tex?: ComponentType<MdBoxTexProps> | null;
  /**
   * 代码块高亮器插槽
   * 对于 MdBoxLight，不传则默认为简化组件（不包含 prism）
   * 对于 MdBox / MdBoxLazy，不传则使用默认组件（包含 prism）
   */
  CodeBlockHighlighter?: ComponentType<MdBoxCodeBlockHighlighterProps> | null;
  /**
   * 代码块插槽
   * 不传则使用默认组件
   * 注意，此组件插槽的默认组件依赖 Tooltip、CodeBlockHighlighter
   */
  CodeBlock?: ComponentType<MdBoxCodeBlockProps> | null;
  /**
   * 代码块控制条插槽
   * 不传则使用默认组件
   */
  CodeBar?: ComponentType<MdBoxCodeBarProps> | null;
  /**
   * 表格插槽
   * 不传则使用默认组件
   */
  Table?: ComponentType<MdBoxTableProps> | null;
  /**
   * 图片插槽
   * 不传则使用默认组件
   */
  Image?: ComponentType<MdBoxImageProps> | null;
  /**
   * 打字机指示点插槽
   * 不传则使用默认组件
   */
  Indicator?: ComponentType<MdBoxIndicatorProps> | null;
  /**
   * 段落插槽
   * 不传则使用默认组件
   */
  Paragraph?: ComponentType<MdBoxParagraphProps> | null;
  /**
   * 链接插槽
   * 不传则使用默认组件
   */
  Link?: ComponentType<MdBoxLinkProps> | null;
  /**
   * 斜体插槽
   * 不传则使用默认组件
   */
  Emphasis?: ComponentType<MdBoxEmphasisProps> | null;
  /**
   * 加粗插槽
   * 不传则使用默认组件
   */
  Strong?: ComponentType<MdBoxStrongProps> | null;
  /**
   * 标题插槽
   * 不传则使用默认组件
   */
  Header?: ComponentType<MdBoxHeaderProps> | null;
  /**
   * 列表插槽
   * 不传则使用默认组件
   */
  List?: ComponentType<MdBoxListProps> | null;
  /**
   * 引用插槽
   * 不传则使用默认组件
   */
  Blockquote?: ComponentType<MdBoxBlockquoteProps> | null;
}

export type MdBoxSlotsWithRequired = Required<MdBoxSlots>;

export type MdBoxSlotsWrapper = {
  [K in keyof MdBoxSlotsWithRequired]?: (
    raw: MdBoxSlotsWithRequired[K],
  ) => MdBoxSlotsWithRequired[K];
};
