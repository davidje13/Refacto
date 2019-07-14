declare module 'prop-types-nullable' {
  import { Validator } from 'prop-types';

  interface NullableRequireable<T> extends Validator<T | null> {
    isRequired: Validator<Exclude<T | null, undefined>>;
  }

  export default function<T>(
    type: Validator<T>,
  ): NullableRequireable<T | undefined>;
}
