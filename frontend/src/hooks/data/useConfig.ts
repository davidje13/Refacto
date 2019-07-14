import useObservable, { ObservableState } from '../useObservable';
import { configService } from '../../api/api';

export default function useConfig(): ObservableState<unknown> {
  const [config] = useObservable(
    () => configService.get(),
    [configService],
  );
  return config;
}
