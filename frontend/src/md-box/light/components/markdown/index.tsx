import React, { FC, useMemo } from 'react';

import { markedSmartypants } from 'marked-smartypants';
import { mangle } from 'marked-mangle';
import { Marked } from 'marked';
import { assign, isArray, isFunction, isUndefined } from 'lodash-es';
import { htmlToDOM, domToReact } from 'html-react-parser';
import type { Config } from 'dompurify';

import {
  inlineTex,
  displayTex,
  MdboxTokenizer,
  getMdBoxRenderer,
  insertElementSlotExtension,
  renderCustomNode,
  RenderCustomNodeOptions,
} from '../../utils';
import type { MdBoxLightProps } from '../../type';
import {
  pipe,
  purifyHtml,
  transformSelfClosing,
  useDeepCompareMemo,
} from '../../../utils';

const wrapHtmlByMarkdownRoot = (value: string) => {
  return `<div class="markdown-root">${value}</div>`;
};

export type MarkdownProps = Pick<
  MdBoxLightProps,
  | 'markDown'
  | 'smartypants'
  | 'enabledHtmlTags'
  | 'purifyHtml'
  | 'purifyHtmlConfig'
  | 'modifyHtmlNode'
> &
  RenderCustomNodeOptions;

// eslint-disable-next-line max-lines-per-function
export const Markdown: FC<MarkdownProps> = ({
  markDown,
  smartypants = false,
  enabledHtmlTags,
  purifyHtml: customPurifyHtml = true,
  purifyHtmlConfig,
  modifyHtmlNode,
  ...restProps
}) => {
  const tokenizer = useMemo(() => new MdboxTokenizer(), []);

  const renderer = useDeepCompareMemo(() => {
    return getMdBoxRenderer({
      enabledHtmlTags,
    });
  }, [enabledHtmlTags]);

  const marked = useDeepCompareMemo(() => {
    const _marked = new Marked({
      extensions: [insertElementSlotExtension(), inlineTex(), displayTex()],
    });

    _marked.setOptions({
      gfm: true,
      silent: true,
      breaks: true,
    });

    _marked.use({
      extensions: [insertElementSlotExtension(), inlineTex(), displayTex()],
    });

    _marked.use(mangle());

    if (smartypants) {
      _marked.use(markedSmartypants());
    }

    return _marked;
  }, [smartypants, enabledHtmlTags]);

  const markdownToHtml = (value: string) =>
    marked.parse(value, { tokenizer, renderer }) as string;

  const getPurifyHtmlConfig = () => {
    const allowedTags = isArray(enabledHtmlTags) ? enabledHtmlTags : undefined;

    const config: Config = {
      ALLOW_UNKNOWN_PROTOCOLS: true,
      RETURN_DOM: false,
    };

    if (allowedTags) {
      config.ADD_TAGS = allowedTags;
    }

    const extraConfig = isFunction(purifyHtmlConfig)
      ? purifyHtmlConfig(config)
      : purifyHtmlConfig;

    if (extraConfig) {
      const { ALLOW_UNKNOWN_PROTOCOLS, RETURN_DOM, ...restConfig } =
        extraConfig;

      if (!isUndefined(ALLOW_UNKNOWN_PROTOCOLS)) {
        config.ALLOW_UNKNOWN_PROTOCOLS = ALLOW_UNKNOWN_PROTOCOLS;
      }

      if (!isUndefined(RETURN_DOM)) {
        config.RETURN_DOM = RETURN_DOM;
      }

      assign(config, restConfig);
    }

    return config;
  };

  const purifyHtmlByEnabledTags = (value: string) => {
    const config = getPurifyHtmlConfig();

    if (isFunction(customPurifyHtml)) {
      return customPurifyHtml(value, config);
    }

    if (customPurifyHtml) {
      return purifyHtml(value, config);
    }

    return value;
  };

  const markdownHtmlRender = pipe<string>(
    markdownToHtml,
    transformSelfClosing,
    purifyHtmlByEnabledTags,
    wrapHtmlByMarkdownRoot,
  );

  const processedValue = useMemo(
    () => markdownHtmlRender(markDown),
    [markDown, marked],
  );

  const processedNode = useMemo(() => {
    const node = htmlToDOM(processedValue);

    return modifyHtmlNode?.(node) ?? node;
  }, [processedValue]);

  return (
    <>
      {domToReact(processedNode, {
        replace: (node) => renderCustomNode(node, restProps),
      })}
    </>
  );
};
