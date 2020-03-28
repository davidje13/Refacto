import type { ClientConfig } from 'refacto-entities';
import useObservable from '../useObservable';
import { configService } from '../../api/api';

export default function useConfig(): ClientConfig | null {
  const [config] = useObservable(
    () => configService.get(),
    [configService],
  );
  return config;
}
