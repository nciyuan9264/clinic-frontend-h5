import { useMemo } from 'react';

import { Root } from 'mdast';
import { isArray, isFunction, omit, values } from 'lodash-es';

import {
  addInsertElementSlotToString,
  IAstPlugin,
  InsertedElementItem,
  ISourcePlugin,
  parseMarkdown,
  processAstByPlugins,
  ProcessAstByPluginsParams,
  processSourceByPlugins,
  stringifyMarkdown,
} from '../utils';
import {
  AutofixHeadingAstPlugin,
  AutofixLastCodeBlockAstPlugin,
  AutofixLastInlineCodeBlockAstPlugin,
  AutofixTruncatedEmphasisAstPlugin,
  AutofixTruncatedEscapePlugin,
  AutofixTruncatedHtmlTagAstPlugin,
  AutofixTruncatedImageAstPlugin,
  AutofixTruncatedLinkAstPlugin,
  AutofixTruncatedListAstPlugin,
  AutofixTruncatedStrongAstPlugin,
  AutofixTruncatedTexMathDollarAstPlugin,
  AutoMergeSiblingTextAstPlugin,
  AutoSpacingAllTextAstPlugin,
  RemoveBreakBeforeHtmlAstPlugin,
  CompleteTruncatedLinkSourcePlugin,
  CompleteUnpairedCodeBlockSourcePlugin,
  ConvertEndingMathPandocLatexSourcePlugin,
  ConvertFullMathPandocLatexSourcePlugin,
  DisableIllegalHtmlAstPlugin,
  ExtractCustomAutolinkAstPlugin,
  InsertEllipsisAstPlugin,
  InsertIndicatorAstPlugin,
  RemoveCocoLinkInCodeblockAstPlugin,
  RemoveLastEmptyCodeBlockAstPlugin,
  RestoreMathPandocLatexInContentAstPlugin,
  SetCodeBlockIndentAstPlugin,
  SetEmphasisAsImageTitleAstPlugin,
  TransformEndlineBeforeHtmlAstPlugin,
} from '../plugins';
import { OmitWithType } from '../../types';

interface GetAstPluginsParams {
  /**
   * 扩展的语法树修改插件
   */
  astPlugins?: ((current: IAstPlugin[]) => IAstPlugin[]) | IAstPlugin[];

  /**
   * 自动给中英文之间加空格
   * @default true
   */
  autoSpacing?: boolean;

  /**
   * 自动识别链接
   * @default true
   */
  autolink?: boolean;

  /**
   * 图片后的首个加粗作为图片标题
   * @default false
   */
  imageEmphasisTitle?: boolean;

  /**
   * 允许围栏式代码块首行缩进控制代码块整体缩进
   * @default true
   */
  indentFencedCode?: boolean;

  /**
   * 展示打字机指示点
   * @default false
   */
  showIndicator?: boolean;

  /**
   * 展示省略号
   * @default false
   */
  showEllipsis?: boolean;
}

const getAstPlugins = ({
  astPlugins,
  autoSpacing = true,
  autolink = true,
  imageEmphasisTitle = false,
  indentFencedCode = true,
  showIndicator = false,
  showEllipsis = false,
}: GetAstPluginsParams) => {
  let plugins: IAstPlugin[] = [
    new AutofixTruncatedEscapePlugin(),
    new RemoveLastEmptyCodeBlockAstPlugin(),
    new AutofixLastCodeBlockAstPlugin(),
    new AutofixLastInlineCodeBlockAstPlugin(),
    new RemoveCocoLinkInCodeblockAstPlugin(),
    new AutofixTruncatedTexMathDollarAstPlugin(),
    new AutofixTruncatedImageAstPlugin(),
    new AutofixTruncatedLinkAstPlugin(),
    new AutofixHeadingAstPlugin(),
    new AutofixTruncatedHtmlTagAstPlugin(),
    new AutofixTruncatedStrongAstPlugin(),
    new AutofixTruncatedEmphasisAstPlugin(),
    new AutofixTruncatedListAstPlugin(),
    new RestoreMathPandocLatexInContentAstPlugin(),
    new DisableIllegalHtmlAstPlugin(),
    new RemoveBreakBeforeHtmlAstPlugin(),
    new TransformEndlineBeforeHtmlAstPlugin(),
    new AutoMergeSiblingTextAstPlugin(),
  ];

  if (autolink) {
    plugins.push(new ExtractCustomAutolinkAstPlugin());
  }

  if (autoSpacing) {
    plugins.push(new AutoSpacingAllTextAstPlugin());
  }

  if (imageEmphasisTitle) {
    plugins.push(new SetEmphasisAsImageTitleAstPlugin());
  }

  if (indentFencedCode) {
    plugins.push(new SetCodeBlockIndentAstPlugin());
  }

  if (showEllipsis) {
    plugins.push(new InsertEllipsisAstPlugin());
  }

  if (showIndicator) {
    plugins.push(new InsertIndicatorAstPlugin());
  }

  if (isArray(astPlugins)) {
    plugins.push(...astPlugins);
  }

  if (isFunction(astPlugins)) {
    plugins = astPlugins(plugins);
  }

  return plugins;
};

export interface GetSourcePluginsParams {
  /**
   * 扩展的文本修改插件
   */
  sourcePlugins?:
    | ((current: ISourcePlugin[]) => ISourcePlugin[])
    | ISourcePlugin[];
}

const getSourcePlugins = ({ sourcePlugins }: GetSourcePluginsParams) => {
  let plugins: ISourcePlugin[] = [
    new CompleteUnpairedCodeBlockSourcePlugin(),
    new CompleteTruncatedLinkSourcePlugin(),
    new ConvertFullMathPandocLatexSourcePlugin(),
    new ConvertEndingMathPandocLatexSourcePlugin(),
  ];

  if (isArray(sourcePlugins)) {
    plugins.push(...sourcePlugins);
  }

  if (isFunction(sourcePlugins)) {
    plugins = sourcePlugins(plugins);
  }

  return plugins;
};

type ProcessMarkdownAndProcessByPluginsParams = {
  source: string;

  sourcePlugins?: ISourcePlugin[];

  astPlugins?: IAstPlugin[];

  /**
   * 解析语法树
   * @default true
   */
  parseAst?: boolean;

  /**
   * 允许缩进作为代码块
   * @default false
   */
  indentedCode?: boolean;

  /**
   * 插入元素列表
   */
  insertedElements?: InsertedElementItem[];
} & Pick<
  ProcessAstByPluginsParams,
  | 'fixEnding'
  | 'enabledHtmlTags'
  | 'looseTruncateDataSlot'
  | 'removeTruncatedImage'
  | 'katex'
>;

export interface ProcessMarkdownAndProcessByPluginsReturnValue {
  ast?: Root;
  source: string;
}

const parseMarkdownAndProcessByPlugins = ({
  source,
  astPlugins,
  sourcePlugins,
  parseAst = true,
  indentedCode = false,

  insertedElements,
  fixEnding,
  enabledHtmlTags,
  looseTruncateDataSlot,
  removeTruncatedImage,
  katex,
}: ProcessMarkdownAndProcessByPluginsParams): ProcessMarkdownAndProcessByPluginsReturnValue => {
  try {
    /** 插入自定义元素 */
    let currentSource = source;

    if (insertedElements) {
      currentSource = addInsertElementSlotToString(
        currentSource,
        insertedElements,
      );
    }

    if (sourcePlugins) {
      currentSource = processSourceByPlugins({
        source: currentSource,
        plugins: sourcePlugins,
        fixEnding,
        katex,
      });
    }

    let currentAst: Root | undefined;

    if (parseAst) {
      currentAst = parseMarkdown(currentSource, {
        enableIndentedCode: indentedCode,
      });
    }

    if (astPlugins && currentAst) {
      currentAst = processAstByPlugins({
        ast: currentAst,
        plugins: astPlugins,
        source: currentSource,
        fixEnding,
        enabledHtmlTags,
        looseTruncateDataSlot,
        removeTruncatedImage,
        katex,
      });
    }

    return {
      ast: currentAst,
      source: currentAst ? stringifyMarkdown(currentAst) : currentSource,
    };
  } catch (error) {
    console.error('[MdBox] Process markdown error: ', error);

    return { source };
  }
};

export type ProcessMarkdownAndProcessParams = OmitWithType<
  ProcessMarkdownAndProcessByPluginsParams,
  'sourcePlugins' | 'astPlugins'
> &
  GetAstPluginsParams &
  GetSourcePluginsParams & {
    /**
     * 预处理原始文本
     * @default true
     */
    processSource?: boolean;
    /**
     * 预处理语法树
     * @default true
     */
    processAst?: boolean;
  };

export const processMarkdownAndProcess = ({
  source,
  processAst = true,
  processSource = true,
  showEllipsis,
  showIndicator,
  imageEmphasisTitle,
  indentFencedCode,
  indentedCode = false,
  insertedElements,
  autolink,
  autoSpacing,
  astPlugins,
  sourcePlugins,
  fixEnding = false,
  enabledHtmlTags = false,
  looseTruncateDataSlot = false,
  removeTruncatedImage = false,
  katex,
}: ProcessMarkdownAndProcessParams) => {
  const mergedAstPlugins = getAstPlugins({
    autolink,
    autoSpacing,
    imageEmphasisTitle,
    indentFencedCode,
    showEllipsis,
    showIndicator,
    astPlugins,
  });

  const mergedSourcePlugins = getSourcePlugins({ sourcePlugins });

  return parseMarkdownAndProcessByPlugins({
    source,
    astPlugins: processAst ? mergedAstPlugins : undefined,
    sourcePlugins: processSource ? mergedSourcePlugins : undefined,
    parseAst: processAst,
    indentedCode,
    insertedElements,
    fixEnding,
    enabledHtmlTags,
    looseTruncateDataSlot,
    removeTruncatedImage,
    katex,
  });
};

export const useProcessMarkdown = (
  params: ProcessMarkdownAndProcessParams,
): ProcessMarkdownAndProcessByPluginsReturnValue => {
  const { insertedElements } = params;

  const omitKeys: (keyof ProcessMarkdownAndProcessParams)[] = [
    'insertedElements',
    'astPlugins',
    'sourcePlugins',
  ];

  const depsByParams = values(omit(params, omitKeys));

  return useMemo<ProcessMarkdownAndProcessByPluginsReturnValue>(
    () => processMarkdownAndProcess(params),
    [...depsByParams, insertedElements?.length],
  );
};
