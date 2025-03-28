import { Content, Parent, Root } from 'mdast';
import { cloneDeep, isFunction, noop, sortBy } from 'lodash-es';

import { updateAst } from './utils';
import {
  AstPluginCommonConfig,
  AstPluginConfig,
  AstPluginHookFunctionType,
  AstPluginModifier,
  AstPluginPriority,
  IAstPlugin,
} from './type';

export * from './type';
export * from './utils';

export abstract class BaseAstPlugin implements IAstPlugin {
  abstract name: string;

  config: AstPluginConfig = {};

  abstract modifier: AstPluginModifier | AstPluginModifier[];

  before: AstPluginHookFunctionType = noop;

  after: AstPluginHookFunctionType = noop;

  beforeEach: AstPluginHookFunctionType = noop;

  afterEach: AstPluginHookFunctionType = noop;
}

type ModifyByCurrentPluginParams<T extends Parent | Content> = {
  plugin: IAstPlugin;
  ast: T;

  /**
   * 错误时跳过插件
   * @default true
   */
  skipWhenError?: boolean;
} & AstPluginCommonConfig;

const modifyByCurrentPlugin = <T extends Parent | Content>({
  plugin,
  ast,
  skipWhenError = true,
  ...restParams
}: ModifyByCurrentPluginParams<T>) => {
  const modifiers = isFunction(plugin.modifier)
    ? [plugin.modifier.bind(plugin)]
    : plugin.modifier.map((item) => item.bind(plugin));

  plugin.before(ast);

  for (const modifier of modifiers) {
    plugin.beforeEach(ast);

    try {
      updateAst(
        ast,
        (current, params) =>
          modifier(current, {
            ...params,
            recursiveModifier(ast: Parent) {
              modifyByCurrentPlugin<Parent>({ plugin, ast, ...restParams });
            },
            ...restParams,
          }),
        plugin.config,
      );
    } catch (error) {
      if (!skipWhenError) {
        throw error;
      }

      console.error(`[MdBox source plugin error: ${plugin.name}]`, error);
    }

    plugin.afterEach(ast);
  }

  plugin.after(ast);
};

export type ProcessAstByPluginsParams<T extends Parent | Content = Root> = {
  /**
   * 解析后的语法树
   */
  ast: T;
  /**
   * 插件列表
   */
  plugins: IAstPlugin[];
  /**
   * 末尾修复模式，开启时会启用支持末尾修复模式的插件
   * @default false
   */
  fixEnding?: boolean;
} & Pick<ModifyByCurrentPluginParams<T>, 'skipWhenError'> &
  AstPluginCommonConfig;

export const processAstByPlugins = <T extends Parent | Content>({
  ast,
  plugins,
  fixEnding = false,
  skipWhenError,
  ...restParams
}: ProcessAstByPluginsParams<T>) => {
  const currentPlugins = sortBy(
    plugins,
    (item) => item.config?.priority ?? AstPluginPriority.Normal,
  ).filter((item) => {
    const { fixEndingOnly = false } = item.config ?? {};

    return fixEndingOnly ? fixEnding : true;
  });

  const clonedAst = cloneDeep(ast);

  for (const plugin of currentPlugins) {
    modifyByCurrentPlugin({
      plugin,
      ast: clonedAst,
      skipWhenError,
      ...restParams,
    });
  }

  return clonedAst;
};
