import { HyperNode, HyperNodeType, getHyperLinkNodes } from '../parser';

const sourceUrlList = [
  'www.xxx.com',
  'www.xxx.com/yyy',
  'www.xxx.com/yyy?zzz=1',
  'www.xxx.com/yyy?zzz=1#666',
  'http://www.xxx.com',
  'http://www.xxx.com/yyy',
  'http://www.xxx.com/yyy?zzz=1',
  'http://www.xxx.com/yyy?zzz=1#666',
  'https://www.xxx.com',
  'https://www.xxx.com/yyy',
  'https://www.xxx.com/yyy?zzz=1',
  'https://www.xxx.com/yyy?zzz=1#666',
];

const case1 = sourceUrlList.map((url) => `?${url}`);
const case2 = sourceUrlList.map((url) => `${url}!`);
const case3 = sourceUrlList.map((url) => `;${url}，`);
const case4 = sourceUrlList.map((url) => `测试${url}可以`);
const expendedCases = [case1, case2, case3, case4];

describe('url识别测试', () => {
  it('should trim url', () => {
    const caseResultList = expendedCases.map((cases) => {
      return cases
        .map((url) => ({
          res: (
            getHyperLinkNodes(url).find(
              (node) => node.type === HyperNodeType.link,
            ) as HyperNode & {
              type: HyperNodeType.link;
            }
          ).url,
          origin: url, // debug 用
        }))
        .map(({ res }, idx) => {
          const sourceUrl = sourceUrlList[idx] || '';
          return res === sourceUrl;
        });
    });
    expect(caseResultList.every((cases) => cases.every((res) => res))).toBe(
      true,
    );
  });
});
