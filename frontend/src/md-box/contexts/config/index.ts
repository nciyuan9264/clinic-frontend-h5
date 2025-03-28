import { createContext, useContext } from 'react';
import { MdBoxConfig } from './type';
import { createShallowedProvider } from '../utils';

export * from './type';

const MdBoxConfigContext = createContext<MdBoxConfig>({
  theme: 'default',
  mode: 'light',
});

export const MdBoxConfigProvider = createShallowedProvider(MdBoxConfigContext);

export const useMdBoxConfig = () => {
  return useContext(MdBoxConfigContext);
};
