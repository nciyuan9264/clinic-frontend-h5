import { createContext } from 'react';

import { createShallowedProvider } from '../../utils';
import type { MdBoxSlots } from '../../contexts';

export const MdBoxSlotsContext = createContext<MdBoxSlots | null>(null);

export const MdBoxSlotsProvider = createShallowedProvider(MdBoxSlotsContext);
