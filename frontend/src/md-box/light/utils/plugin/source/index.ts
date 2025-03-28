import { isFunction, noop, sortBy } from 'lodash-es';

import {
  SourcePluginConfig,
  SourcePluginPriority,
  ISourcePlugin,
  SourcePluginModifier,
  SourcePluginHookFunctionType,
} from './type';
import { KatexType } from '../../common';
export * from './type';

export abstract class BaseSourcePlugin implements ISourcePlugin {
  abstract name: string;

  config: SourcePluginConfig = {};

  abstract modifier: SourcePluginModifier | SourcePluginModifier[];

  before: SourcePluginHookFunctionType = noop;

  after: SourcePluginHookFunctionType = noop;

  beforeEach: SourcePluginHookFunctionType = noop;

  afterEach: SourcePluginHookFunctionType = noop;
}

export interface ProcessSourceByPluginsParams {
  source: string;
  plugins: ISourcePlugin[];
  /**
   * 末尾修复模式，开启时会启用支持末尾修复模式的插件
   * @default false
   */
  fixEnding?: boolean;

  /**
   * Katex 实例，公式转换依赖
   */
  katex?: KatexType;

  /**
   * 错误时跳过插件
   * @default true
   */
  skipWhenError?: boolean;
}

export const processSourceByPlugins = ({
  source,
  plugins,
  fixEnding = false,
  katex,
  skipWhenError = true,
}: ProcessSourceByPluginsParams) => {
  const currentPlugins = sortBy(
    plugins,
    (item) => item.config?.priority ?? SourcePluginPriority.Normal,
  ).filter((item) => {
    const { fixEndingOnly = false } = item.config ?? {};

    return fixEndingOnly ? fixEnding : true;
  });

  return currentPlugins.reduce((prev, plugin) => {
    plugin.before(prev);

    const modifiers = isFunction(plugin.modifier)
      ? [plugin.modifier.bind(plugin)]
      : plugin.modifier.map((item) => item.bind(plugin));

    const newValue = modifiers.reduce((acc, modifier) => {
      try {
        plugin.beforeEach(acc);

        const eachNewValue = modifier({ source: acc, katex });

        plugin.afterEach(eachNewValue);

        return eachNewValue;
      } catch (error) {
        if (!skipWhenError) {
          throw error;
        }

        console.error(`[MdBox source plugin error: ${plugin.name}]`, error);

        return acc;
      }
    }, prev);

    plugin.after(newValue);

    return newValue;
  }, source);
};
