import type { Spec } from '../api/reducer';

export class OptionType<T> {
  constructor(
    private readonly key: string,
    private readonly def: T,
    private readonly check?: (v: unknown) => v is T,
  ) {}

  read(options?: Record<string, unknown>): T {
    if (options?.[this.key] === undefined) {
      return this.def;
    }
    const value = options[this.key];

    if (this.def !== null && typeof value !== typeof this.def) {
      return this.def;
    }
    if (this.check && !this.check(value)) {
      return this.def;
    }
    return value as T;
  }

  specSet(value: T): Spec<Record<string, unknown>> {
    return { [this.key]: value === this.def ? ['unset'] : ['=', value] };
  }

  specApply(spec: Spec<T, true>): Spec<Record<string, unknown>> {
    return { [this.key]: ['seq', ['init', this.def], spec] };
  }
}

export const optionEnableMobileFacilitation = new OptionType<boolean>(
  'enable-mobile-facilitation',
  false,
);
