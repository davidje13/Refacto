import useObservable from '../useObservable';
import { configService } from '../../api/api';

export default function useConfig() {
  const [config] = useObservable(
    () => configService.get(),
    [configService],
  );
  return config;
}
