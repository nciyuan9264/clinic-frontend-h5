import { Content } from 'mdast';

import { getHyperLinkNodes, completeProtocol, HyperNodeType } from './utils';
import {
  AstPluginConfig,
  AstPluginModifier,
  AstPluginPriority,
  BaseAstPlugin,
  isParent,
  isParentOfContent,
} from '../../../utils';

/**
 * 将Ast中的文本中的链接，使用自定义的提取算法提取出来
 */
export class ExtractCustomAutolinkAstPlugin extends BaseAstPlugin {
  name = 'extract_custom_autolink';

  config: AstPluginConfig = {
    priority: AstPluginPriority.After,
  };

  modifier: AstPluginModifier = (item, { insertAfter, skip }) => {
    if (isParent(item)) {
      if (isParentOfContent(item) && item.type === 'link') {
        skip();
      }
      return;
    }

    if (item.type !== 'text') {
      return;
    }

    const hyperLinkNodes = getHyperLinkNodes(item.value);

    const contentList = hyperLinkNodes
      .map<Content | null>((item) => {
        if (item.type === HyperNodeType.link) {
          return {
            type: 'link',
            url: completeProtocol(item.url),
            title: 'autolink',
            children: [
              {
                type: 'text',
                value: item.url,
              },
            ],
          };
        } else if (item.type === HyperNodeType.text) {
          return {
            type: 'text',
            value: item.text,
          };
        }
        return null;
      })
      .filter((item): item is Content => Boolean(item));

    insertAfter(contentList, true);
  };
}
