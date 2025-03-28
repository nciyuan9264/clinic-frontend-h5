/* eslint-disable max-lines-per-function */
import { Content } from 'mdast';
import { cloneDeep } from 'lodash-es';

import { updateAst } from '../update_ast';

const textAAst: Content = {
  type: 'text',
  value: 'AAA',
};

const textBAst: Content = {
  type: 'text',
  value: 'BBB',
};

const textCAst: Content = {
  type: 'text',
  value: 'CCC',
};

const textDAst: Content = {
  type: 'text',
  value: 'DDD',
};

const textEAst: Content = {
  type: 'text',
  value: 'EEE',
};

const htmlAst: Content = {
  type: 'html',
  value: '<div />',
};

const linkAst: Content = {
  type: 'link',
  url: 'https://baidu.com',
  children: [textAAst, textBAst, textCAst],
};

const exampleAst: Content = {
  type: 'paragraph',
  children: [htmlAst, linkAst],
};

describe('前序遍历（updateAst）', () => {
  test('从左到右遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    const listDefault: Content[] = [];

    updateAst(
      clonedAst,
      (content) => {
        list.push(content);
      },
      {
        isReverse: false,
        order: 'pre_order',
      },
    );

    /** 没有改变内容 */
    expect(clonedAst).toStrictEqual(exampleAst);

    /** 遍历顺序正确 */
    expect(list).toStrictEqual([
      exampleAst,
      htmlAst,
      linkAst,
      textAAst,
      textBAst,
      textCAst,
    ]);

    updateAst(clonedAst, (content) => {
      listDefault.push(content);
    });

    /** 不传isReverse默认为false、不传order默认为前序遍历（pre_order） */
    expect(listDefault).toStrictEqual(list);
  });

  test('从右到左遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content) => {
        list.push(content);
      },
      {
        isReverse: true,
      },
    );

    /** 没有改变内容 */
    expect(clonedAst).toStrictEqual(exampleAst);

    /** 遍历顺序正确 */
    expect(list).toStrictEqual([
      exampleAst,
      linkAst,
      textCAst,
      textBAst,
      textAAst,
      htmlAst,
    ]);
  });

  test('使用stop提前结束遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(clonedAst, (content, { stop }) => {
      list.push(content);
      if (content.type === 'text' && content.value === 'AAA') {
        stop();
      }
    });

    /** 遍历顺序正确 */
    expect(list).toStrictEqual([exampleAst, htmlAst, linkAst, textAAst]);
  });

  test('使用skip跳过子元素', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(clonedAst, (content, { skip }) => {
      list.push(content);
      if (content.type === 'link') {
        skip();
      }
    });

    /** 遍历顺序正确 */
    expect(list).toStrictEqual([exampleAst, htmlAst, linkAst]);
  });

  test('在特定元素后插入', () => {
    const clonedAst = cloneDeep(exampleAst);

    updateAst(clonedAst, (content, { insertAfter }) => {
      if (content.type === 'text' && content.value === 'BBB') {
        insertAfter([textDAst, textEAst]);
      }
    });

    const targetAst: Content = {
      type: 'paragraph',
      children: [
        htmlAst,
        {
          type: 'link',
          url: 'https://baidu.com',
          children: [textAAst, textBAst, textDAst, textEAst, textCAst],
        },
      ],
    };

    expect(clonedAst).toStrictEqual(targetAst);
  });

  test('在最后一个元素后追加', () => {
    const clonedAst = cloneDeep(exampleAst);

    updateAst(clonedAst, (content, { insertAfter }) => {
      if (content.type === 'text' && content.value === 'CCC') {
        insertAfter([textDAst, textEAst]);
      }
    });

    const targetAst: Content = {
      type: 'paragraph',
      children: [
        htmlAst,
        {
          type: 'link',
          url: 'https://baidu.com',
          children: [textAAst, textBAst, textCAst, textDAst, textEAst],
        },
      ],
    };

    expect(clonedAst).toStrictEqual(targetAst);
  });

  test('在特定元素替换插入', () => {
    const clonedAst = cloneDeep(exampleAst);

    updateAst(clonedAst, (content, { insertAfter }) => {
      if (content.type === 'text' && content.value === 'BBB') {
        insertAfter([textDAst, textEAst], true);
      }
    });

    const targetAst: Content = {
      type: 'paragraph',
      children: [
        htmlAst,
        {
          type: 'link',
          url: 'https://baidu.com',
          children: [textAAst, textDAst, textEAst, textCAst],
        },
      ],
    };

    expect(clonedAst).toStrictEqual(targetAst);
  });

  test('删除特定元素', () => {
    const clonedAst = cloneDeep(exampleAst);

    updateAst(clonedAst, (content, { insertAfter }) => {
      if (content.type === 'text' && content.value === 'BBB') {
        insertAfter([], true);
      }
    });

    const targetAst: Content = {
      type: 'paragraph',
      children: [
        htmlAst,
        {
          type: 'link',
          url: 'https://baidu.com',
          children: [textAAst, textCAst],
        },
      ],
    };

    expect(clonedAst).toStrictEqual(targetAst);
  });

  test('插入空数组，Ast树不变', () => {
    const clonedAst = cloneDeep(exampleAst);

    updateAst(clonedAst, (content, { insertAfter }) => {
      if (content.type === 'text' && content.value === 'BBB') {
        insertAfter([]);
      }
    });

    expect(clonedAst).toStrictEqual(exampleAst);
  });

  test('更改不影响遍历顺序', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content, { insertAfter }) => {
        list.push(cloneDeep(content));
        if (content.type === 'text' && content.value === 'BBB') {
          insertAfter([textDAst, textEAst]);
        }
      },
      {
        isReverse: false,
      },
    );

    /** 遍历顺序正确 */
    expect(list).toStrictEqual([
      exampleAst,
      htmlAst,
      linkAst,
      textAAst,
      textBAst,
      textCAst,
    ]);
  });
});

describe('后序遍历（updateAst）', () => {
  const postOrderNotReverse: Content[] = [
    htmlAst,
    textAAst,
    textBAst,
    textCAst,
    linkAst,
    exampleAst,
  ];

  const postOrderReverse: Content[] = [
    textCAst,
    textBAst,
    textAAst,
    linkAst,
    htmlAst,
    exampleAst,
  ];

  test('从左到右遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content) => {
        list.push(content);
      },
      {
        order: 'post_order',
      },
    );

    /** 没有改变内容 */
    expect(clonedAst).toStrictEqual(exampleAst);

    /** 遍历顺序正确 */
    expect(list).toStrictEqual(postOrderNotReverse);
  });

  test('从右到左遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content) => {
        list.push(content);
      },
      {
        isReverse: true,
        order: 'post_order',
      },
    );

    /** 没有改变内容 */
    expect(clonedAst).toStrictEqual(exampleAst);

    /** 遍历顺序正确 */
    expect(list).toStrictEqual(postOrderReverse);
  });

  test('使用stop提前结束遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content, { stop }) => {
        list.push(content);
        if (content.type === 'text' && content.value === 'CCC') {
          stop();
        }
      },
      {
        order: 'post_order',
      },
    );

    const iteratorOrderUntilTextC = postOrderNotReverse.slice(
      0,
      postOrderNotReverse.indexOf(textCAst) + 1,
    );

    /** 遍历顺序正确 */
    expect(list).toStrictEqual(iteratorOrderUntilTextC);
  });

  test('skip不影响后序遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content, { skip }) => {
        list.push(content);
        skip();
      },
      {
        order: 'post_order',
      },
    );

    /** 没有改变内容 */
    expect(clonedAst).toStrictEqual(exampleAst);

    /** 遍历顺序正确 */
    expect(list).toStrictEqual(postOrderNotReverse);
  });

  test('在特定元素替换插入，影响父节点遍历顺序', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content, { insertAfter }) => {
        list.push(cloneDeep(content));
        if (content.type === 'text' && content.value === 'BBB') {
          insertAfter([textDAst, textEAst], true);
        }
      },
      {
        order: 'post_order',
      },
    );

    const targetAst: Content = {
      type: 'paragraph',
      children: [
        htmlAst,
        {
          type: 'link',
          url: 'https://baidu.com',
          children: [textAAst, textDAst, textEAst, textCAst],
        },
      ],
    };

    expect(clonedAst).toStrictEqual(targetAst);

    const insertedLinkAst: Content = {
      ...linkAst,
      type: 'link',
      children: [textAAst, textDAst, textEAst, textCAst],
    };

    const insertedExampleAst: Content = {
      type: 'paragraph',
      children: [htmlAst, insertedLinkAst],
    };

    /** 遍历顺序正确 */
    expect(list).toStrictEqual([
      htmlAst,
      textAAst,
      textBAst,
      textCAst,
      textDAst,
      textEAst,
      insertedLinkAst,
      insertedExampleAst,
    ]);
  });
});

describe('中序遍历', () => {
  const inOrderNotReverse: Content[] = [
    htmlAst,
    exampleAst,
    textAAst,
    linkAst,
    textBAst,
    textCAst,
  ];

  const inOrderReverse: Content[] = [
    textCAst,
    linkAst,
    textBAst,
    textAAst,
    exampleAst,
    htmlAst,
  ];

  test('从左到右遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content) => {
        list.push(content);
      },
      {
        order: 'in_order',
      },
    );

    /** 没有改变内容 */
    expect(clonedAst).toStrictEqual(exampleAst);

    /** 遍历顺序正确 */
    expect(list).toStrictEqual(inOrderNotReverse);
  });

  test('从右到左遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content) => {
        list.push(content);
      },
      {
        isReverse: true,
        order: 'in_order',
      },
    );

    /** 没有改变内容 */
    expect(clonedAst).toStrictEqual(exampleAst);

    /** 遍历顺序正确 */
    expect(list).toStrictEqual(inOrderReverse);
  });

  test('使用stop提前结束遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content, { stop }) => {
        list.push(content);
        if (content.type === 'text' && content.value === 'CCC') {
          stop();
        }
      },
      {
        order: 'in_order',
      },
    );

    const iteratorOrderUntilTextC = inOrderNotReverse.slice(
      0,
      inOrderNotReverse.indexOf(textCAst) + 1,
    );

    /** 遍历顺序正确 */
    expect(list).toStrictEqual(iteratorOrderUntilTextC);
  });

  test('skip不影响后序遍历', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content, { skip }) => {
        list.push(content);
        skip();
      },
      {
        order: 'in_order',
      },
    );

    /** 没有改变内容 */
    expect(clonedAst).toStrictEqual(exampleAst);

    /** 遍历顺序正确 */
    expect(list).toStrictEqual(inOrderNotReverse);
  });

  test('在特定元素替换插入，不影响节点遍历顺序', () => {
    const clonedAst = cloneDeep(exampleAst);

    const list: Content[] = [];

    updateAst(
      clonedAst,
      (content, { insertAfter }) => {
        list.push(cloneDeep(content));
        if (content.type === 'text' && content.value === 'BBB') {
          insertAfter([textDAst, textEAst], true);
        }
      },
      {
        order: 'in_order',
      },
    );

    expect(list).toStrictEqual(inOrderNotReverse);

    const targetAst: Content = {
      type: 'paragraph',
      children: [
        htmlAst,
        {
          type: 'link',
          url: 'https://baidu.com',
          children: [textAAst, textDAst, textEAst, textCAst],
        },
      ],
    };

    expect(clonedAst).toStrictEqual(targetAst);
  });
});
