import type { ClientConfig } from '../../shared/api-entities';
import { createContext, useContext } from 'react';

const ConfigContext = createContext<ClientConfig | null>(null);

export const ConfigProvider = ConfigContext.Provider;

export const useConfig = () => useContext(ConfigContext);
