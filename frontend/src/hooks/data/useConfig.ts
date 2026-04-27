import { createContext, useContext } from 'react';
import type { ClientConfig } from '@refacto/shared/api-entities';

const ConfigContext = createContext<ClientConfig | null>(null);

export const ConfigProvider = ConfigContext.Provider;

export const useConfig = () => useContext(ConfigContext);
