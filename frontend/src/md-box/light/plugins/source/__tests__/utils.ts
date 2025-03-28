import { isArray } from 'lodash-es';

import {
  ISourcePlugin,
  processSourceByPlugins,
  ProcessSourceByPluginsParams,
} from '../../../utils';

interface Newable<T> {
  new (): T;
}

export const generateSourceProcessor = (
  plugins: Newable<ISourcePlugin> | Newable<ISourcePlugin>[],
  config: Pick<ProcessSourceByPluginsParams, 'katex'> = {},
) => {
  return (source: string) =>
    processSourceByPlugins({
      plugins: (isArray(plugins) ? plugins : [plugins]).map(
        (item) => new item(),
      ),
      source,
      fixEnding: true,
      ...config,
    });
};
