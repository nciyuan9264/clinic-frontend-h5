import {
  BaseSourcePlugin,
  renderBlockMathSpanString,
  renderInlineMathSpanString,
  SourcePluginModifier,
} from '../../utils';

export class ConvertFullMathPandocLatexSourcePlugin extends BaseSourcePlugin {
  name = 'convert_full_math_pandoc_latex';

  modifier: SourcePluginModifier = ({ source }) => {
    return source
      .replace(
        /\\\(([\s\S]*?)\\\)/g,
        (_firstMatch: string, secondMatch: string) => {
          return renderInlineMathSpanString(secondMatch);
        },
      )
      .replace(
        /\\\[([\s\S]*?)\\\]/g,
        (_firstMatch: string, secondMatch: string) => {
          return renderBlockMathSpanString(secondMatch);
        },
      );
  };
}
