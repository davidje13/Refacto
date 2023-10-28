import { type ClientConfig } from '../../shared/api-entities';
import { useObservable } from '../useObservable';
import { configService } from '../../api/api';

export function useConfig(): ClientConfig | null {
  const [config] = useObservable(() => configService.get(), [configService]);
  return config;
}
