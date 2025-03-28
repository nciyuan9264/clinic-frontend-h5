import { Content, Parent } from 'mdast';

import {
  UpdateAstOptions,
  UpdateAstDetectorAction,
  UpdateAstDetectorParams,
} from './utils';
import { KatexType } from '../../common';

export const enum AstPluginPriority {
  BeforeAll = -2,
  Before = -1,
  Normal = 0,
  After = 1,
  AfterAll = 2,
}

export type AstPluginConfig = {
  /**
   * 仅在尾部修复开启时启用
   * @default false
   */
  fixEndingOnly?: boolean;
  /**
   * 优先级
   * Normal: 普通
   * BeforeAll: 在其它之前
   * AfterAll: 在其它之后
   * @default 'normal'
   */
  priority?: AstPluginPriority;
} & UpdateAstOptions;

export interface AstPluginCommonConfig {
  /**
   * 原始文本
   */
  source: string;
  /**
   * Katex 实例，公式转换依赖
   */
  katex?: KatexType;
  /**
   * 宽松地截断 Data Slot
   * @default false
   */
  looseTruncateDataSlot?: boolean;
  /**
   * 指定可以启用的 HTML 标签，会和内部默认启用的标签合并
   * 为 true 时代表启用全部 [安全的 html 标签](https://github.com/cure53/DOMPurify/blob/1.0.8/src/tags.js)，为 false 时代表使用内部默认启用的标签
   * @default false
   */
  enabledHtmlTags?: string[] | boolean;
  /**
   * 清除截断的图片语法，否则将截断的图片替换成空图片
   * @default false
   */
  removeTruncatedImage?: boolean;
}

export interface AstPluginModifierExtraParams {
  /**
   * 递归调用的变更方法
   */
  recursiveModifier: (ast: Parent) => void;
}

export type AstPluginModifierParams = UpdateAstDetectorAction &
  UpdateAstDetectorParams &
  AstPluginModifierExtraParams &
  AstPluginCommonConfig;

export type AstPluginModifier = (
  current: Parent | Content,
  params: AstPluginModifierParams,
) => void;

export type AstPluginHookFunctionType = (ast: Parent | Content) => void;

export interface IAstPlugin {
  name: string;

  config: AstPluginConfig;

  modifier: AstPluginModifier | AstPluginModifier[];

  before: AstPluginHookFunctionType;

  after: AstPluginHookFunctionType;

  beforeEach: AstPluginHookFunctionType;

  afterEach: AstPluginHookFunctionType;
}
