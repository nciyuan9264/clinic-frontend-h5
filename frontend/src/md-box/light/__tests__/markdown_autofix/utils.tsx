import { isString } from 'lodash-es';
import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import type { AutoFixSyntaxConfig } from '../..';

export interface AutofixMapItem {
  current: string | string[];
  fixto: string;
}

export const expectAutofix = async (
  autofixMaps: AutofixMapItem[],
  config?: AutoFixSyntaxConfig,
) => {
  const rootView = await act(() =>
    render(
      <MdBoxForTesting
        markDown=""
        autoFixSyntax={{
          autoFixEnding: true,
          ...config,
        }}
      />,
    ),
  );

  let prevValue = '';

  const renderValue = async (value: string, autofix: boolean) => {
    if (value === prevValue) {
      return;
    }

    await act(() => {
      rootView?.rerender(
        <MdBoxForTesting
          markDown={value}
          autoFixSyntax={{
            autoFixEnding: autofix,
            ...config,
          }}
        />,
      );
    });

    prevValue = value;
  };

  for (const { current, fixto } of autofixMaps) {
    const currentList = isString(current) ? [current] : current;

    for (const value of currentList) {
      await renderValue(value, true);

      const afterFixFragment = rootView.asFragment();

      const afterFixHtml = rootView.baseElement.outerHTML;

      await renderValue(fixto, false);

      const toFixedFragment = rootView.asFragment();

      const toFixedHtml = rootView.baseElement.outerHTML;

      if (afterFixHtml !== toFixedHtml) {
        console.log(`expectAutofix failed:
[Before Fix]
"${current}"
[Expected Fix]
"${fixto}"
[Expected Html]
"${toFixedHtml}"
[Received Html]
"${afterFixHtml}"
        `);
      }

      expect(afterFixFragment).toStrictEqual(toFixedFragment);
    }
  }
};
