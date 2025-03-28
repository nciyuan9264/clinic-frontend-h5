import { KatexType } from '../../common';

export const enum SourcePluginPriority {
  BeforeAll = -1,
  Normal = 0,
  AfterAll = 1,
}

export interface SourcePluginConfig {
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
  priority?: SourcePluginPriority;
}

export interface SourcePluginModifierParams {
  source: string;
  katex?: KatexType;
}

export type SourcePluginModifier = (
  params: SourcePluginModifierParams,
) => string;

export type SourcePluginHookFunctionType = (value: string) => void;

export interface ISourcePlugin {
  name: string;

  config: SourcePluginConfig;

  modifier: SourcePluginModifier | SourcePluginModifier[];

  before: SourcePluginHookFunctionType;

  after: SourcePluginHookFunctionType;

  beforeEach: SourcePluginHookFunctionType;

  afterEach: SourcePluginHookFunctionType;
}
