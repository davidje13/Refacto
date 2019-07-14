import useObservable from '../useObservable';
import { configService } from '../../api/api';
import { ClientConfig } from '../../api/ConfigService';

export default function useConfig(): ClientConfig | null {
  const [config] = useObservable(
    () => configService.get(),
    [configService],
  );
  return config;
}
