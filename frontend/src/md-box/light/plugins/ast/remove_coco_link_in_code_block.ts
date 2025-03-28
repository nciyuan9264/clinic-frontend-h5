import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isLiteralOfContent,
} from '../../utils';

export const removeCocoLink = (v: string) => {
  return v.replace(/\[(.*?)\]\(coco:\/\/.*?\)/g, '$1');
};

export class RemoveCocoLinkInCodeblockAstPlugin extends BaseAstPlugin {
  name = 'remove_coco_link_in_codeblock';

  config: AstPluginConfig = {
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter }) => {
    if (!isLiteralOfContent(item)) {
      return;
    }

    if (item.type === 'code' || item.type === 'inlineCode') {
      const value = removeCocoLink(item.value);

      insertAfter(
        [
          {
            ...item,
            value,
          },
        ],
        true,
      );
    }
  };
}
