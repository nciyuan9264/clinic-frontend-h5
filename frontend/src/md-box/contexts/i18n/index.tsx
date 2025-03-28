import { useContext, createContext } from 'react';

import { defaults } from 'lodash-es';

import { MdBoxTranslate, MdBoxTranslateWithRequired } from './type';
import { DEFAULT_I18N_TRANSLATE } from './consts';
import { createShallowedProvider } from '../utils';

export * from './type';

const MdBoxI18nContext = createContext<MdBoxTranslate | null>(null);

export const MdBoxI18nProvider = createShallowedProvider(MdBoxI18nContext);

export const useMdBoxTranslate = () => {
  const context = useContext(MdBoxI18nContext);

  if (!context) {
    throw Error('[MdBox Internal Bugs] MdBoxI18nContext Required');
  }

  const translate = defaults<MdBoxTranslate, MdBoxTranslateWithRequired>(
    context,
    DEFAULT_I18N_TRANSLATE,
  );

  return (key: keyof MdBoxTranslate) => {
    return translate[key];
  };
};
