import type { HealthQuestion } from '../actions/healthRetro';
import type { Spec } from '../api/reducer';

class OptionType<T> {
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

  healthQuestionSet: new OptionType<string>('health-question-set', 'generic'),
  healthCustomQuestions: new OptionType<HealthQuestion[]>(
    'health-custom-questions',
    [],
    (v): v is HealthQuestion[] =>
      Array.isArray(v) &&
      v.every(
        (o) =>
          o &&
          typeof o === 'object' &&
          typeof o.id === 'string' &&
          typeof o.enabled === 'boolean' &&
          typeof o.title === 'string' &&
          typeof o.good === 'string' &&
          typeof o.bad === 'string',
      ),
  ),
};
