import { Content, Parent, Root } from 'mdast';
import { isArray } from 'lodash-es';

import {
  AstPluginCommonConfig,
  IAstPlugin,
  parseMarkdown,
  processAstByPlugins,
  stringifyMarkdown,
} from '../../../utils';

interface Newable<T> {
  new (): T;
}

export const logAst = (ast: Content | Parent) => {
  console.log('[logAst]', JSON.stringify(ast, null, 4));
};

export const generateAstProcessor = (
  plugins: Newable<IAstPlugin> | Newable<IAstPlugin>[],
  config: Partial<AstPluginCommonConfig> = {},
) => {
  const { source, ...restConfig } = config;

  return <T extends Parent | Content>(root: T) =>
    processAstByPlugins({
      plugins: (isArray(plugins) ? plugins : [plugins]).map(
        (item) => new item(),
      ),
      ast: root,
      source: source ?? stringifyMarkdown(root as Root),
      fixEnding: true,
      ...restConfig,
    });
};

export const generateAstStringProcessor = (
  plugins: Newable<IAstPlugin> | Newable<IAstPlugin>[],
  config: Omit<AstPluginCommonConfig, 'source'> = {},
) => {
  return (source: string) => {
    const ast = parseMarkdown(source);

    return stringifyMarkdown(generateAstProcessor(plugins, config)(ast), true);
  };
};
