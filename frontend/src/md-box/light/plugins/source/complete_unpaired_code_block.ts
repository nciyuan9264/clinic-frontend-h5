import { BaseSourcePlugin, SourcePluginModifier } from '../../utils';

/**
 * 发现代码块不配对时，末尾添加使其配对
 */
export class CompleteUnpairedCodeBlockSourcePlugin extends BaseSourcePlugin {
  name = 'complete_unpaired_code_block';

  modifier: SourcePluginModifier = ({ source }) => {
    const matchResult = source.match(/(^|\n)[\s]*?```/g);

    if (!matchResult) {
      return source;
    }

    if (matchResult.length % 2 === 0) {
      return source;
    }

    return `${source.trimEnd()}\n\`\`\``;
  };
}
