import type { Spec } from '../api/reducer';

class OptionType<T> {
  public constructor(
    private readonly key: string,
    private readonly def: T,
  ) {}

  public read(options?: Record<string, unknown>): T {
    if (options?.[this.key] === undefined) {
      return this.def;
    }
    const value = options[this.key];

    // TODO: add proper type validation via validators
    if (this.def !== null && typeof value !== typeof this.def) {
      return this.def;
    }
    return value as T;
  }

  public specSet(value: T): Spec<Record<string, unknown>> {
    if (value === undefined || value === this.def) {
      return { [this.key]: ['unset'] };
    }
    return { [this.key]: ['=', value] };
  }
}

export const OPTIONS = {
  alwaysShowAddAction: new OptionType<boolean>('always-show-add-action', true),
  enableMobileFacilitation: new OptionType<boolean>(
    'enable-mobile-facilitation',
    false,
  ),
  theme: new OptionType<string>('theme', 'faces'),
};
