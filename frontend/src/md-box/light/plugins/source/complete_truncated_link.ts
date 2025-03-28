import { BaseSourcePlugin, SourcePluginModifier } from '../../utils';

export class CompleteTruncatedLinkSourcePlugin extends BaseSourcePlugin {
  name = 'complete_truncated_link';

  modifier: SourcePluginModifier = ({ source }) => {
    return source.replace(
      /(^|[^!])\[(?<text>[^\]\n]+)\]\([^\)\n]*$/,
      '$1[$2](#)',
    );
  };
}
