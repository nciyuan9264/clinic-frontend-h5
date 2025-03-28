import { FilterXSS } from 'xss';

export const purifyHtml = (value: string) => {
  return new FilterXSS().process(value);
};
