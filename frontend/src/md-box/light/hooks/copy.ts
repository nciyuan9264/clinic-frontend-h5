import { first, isUndefined } from 'lodash-es';

import { assert } from '../../utils';

const isHTMLElementNode = (node: Node): node is HTMLElement => {
  if (typeof HTMLElement === 'undefined') {
    return node.nodeType === Node.ELEMENT_NODE;
  }

  return node instanceof HTMLElement;
};

const replaceToText = (node: Node) => {
  for (const childNode of node.childNodes) {
    replaceToText(childNode);
  }

  if (!isHTMLElementNode(node)) {
    return;
  }

  const { customCopyText } = node.dataset;

  if (!isUndefined(customCopyText)) {
    node.textContent = customCopyText;

    return;
  }

  const tagName = node.tagName.toLowerCase();

  if (tagName === 'br') {
    const replacingElement = document.createElement('span');

    replacingElement.textContent = '\n';

    if (node.parentElement) {
      node.parentElement.replaceChild(replacingElement, node);
    }

    return;
  }
};

const hasCustomCopyTextElement = (element: DocumentFragment) => {
  return Boolean(element.querySelector('[data-custom-copy-text]'));
};

const supportClipboard = () => {
  return (
    typeof navigator !== 'undefined' &&
    !isUndefined(navigator.clipboard) &&
    !isUndefined(navigator.clipboard.read) &&
    !isUndefined(navigator.clipboard.write) &&
    typeof ClipboardItem !== 'undefined'
  );
};

const parseHtmlToDocumentFragment = (htmlString: string) => {
  const documentFragment = document.createDocumentFragment();

  const rootElement = document.createElement('div');

  rootElement.innerHTML = htmlString;

  documentFragment.append(...rootElement.childNodes);

  return documentFragment;
};

export const useCopy = () => {
  return async () => {
    try {
      const selection = window.getSelection();

      if (!selection?.rangeCount) {
        return;
      }

      const range = selection.getRangeAt(0);

      const rangeFragment = range.cloneContents();

      /** 没有自定义复制文本的元素 */
      if (!hasCustomCopyTextElement(rangeFragment) || !supportClipboard()) {
        return;
      }

      const allClipboardItems = await navigator.clipboard.read();

      const clipboardItem = first(allClipboardItems);

      assert(clipboardItem);

      if (!clipboardItem.types.includes('text/html')) {
        return;
      }

      const htmlBytes = await clipboardItem.getType('text/html');

      const htmlString = await htmlBytes.text();

      const container = parseHtmlToDocumentFragment(htmlString);

      replaceToText(container);

      const textToCopy = container.textContent ?? '';

      const htmlToCopy = new XMLSerializer().serializeToString(container);

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlToCopy], { type: 'text/html' }),
          'text/plain': new Blob([textToCopy], { type: 'text/plain' }),
        }),
      ]);
    } catch (error) {
      console.warn(
        "[MdBox] Enhanced replication failed, possibly due to the user's" +
          ' refusal of replication permission. The default replication behavior ' +
          'takes effect, and the original error is:',
        error,
      );
    }
  };
};
