declare module 'json-immutability-helper' {
  interface ConditionValue<T> {
    equals?: T;
    greaterThanOrEqual?: T;
    lessThanOrEqual?: T;
    greaterThan?: T;
    lessThan?: T;
    not?: T;
  }

  interface ConditionKeyValue<K, V> extends ConditionValue<V> {
    key: K;
  }

  type ConditionKey<T, K extends keyof T> = ConditionKeyValue<K, T[K]> | [K, T[K]];

  type ConditionEntry<T> = ConditionValue<T> | ConditionKey<T, keyof T>;

  type Condition<T> = ConditionEntry<T> | ConditionEntry<T>[];

  export type Spec<T> = (
    T extends string ? StringSpec :
      T extends number ? NumberSpec :
        T extends ((infer U)[]) ? ArraySpec<U> :
          ObjectSpec<T>
  ) |
  { $set: T } |
  { $updateIf: [Condition<T>, Spec<T>, Spec<T>?] } |
  { $seq: [...Spec<T>[]] };

  interface StringSpec {
    $replaceAll: [string, string];
  }

  type NumberSpec =
    { $add: number } |
    { $subtract: number } |
    { $multiply: number } |
    { $divide: number } |
    { $reciprocal: number };

  type ArraySpec<T> =
    { $push: T[] } |
    { $unshift: T[] } |
    { $splice: ([number, number?] | [number, number, ...T[]])[] } |
    { $insertBeforeFirstWhere: [Condition<T>, ...T[]] } |
    { $insertAfterFirstWhere: [Condition<T>, ...T[]] } |
    { $insertBeforeLastWhere: [Condition<T>, ...T[]] } |
    { $insertAfterLastWhere: [Condition<T>, ...T[]] } |
    { $updateAll: Spec<T> } |
    { $updateWhere: [Condition<T>, Spec<T>] } |
    { $updateFirstWhere: [Condition<T>, Spec<T>] } |
    { $updateLastWhere: [Condition<T>, Spec<T>] } |
    { $deleteWhere: Condition<T> } |
    { $deleteFirstWhere: Condition<T> } |
    { $deleteLastWhere: Condition<T> } |
    { [index: number]: Spec<T> };

  type ObjectSpec<T> =
    { $toggle: (keyof T)[] } |
    { $unset: (keyof T)[] } |
    { $merge: Partial<T> } |
    { [K in keyof T]?: Spec<T[K]> };

  type DirectiveFn<T> = (param: any, old: T) => T;
  type ConditionFn<T> = (param: T) => (actual: T) => boolean;

  type Update = <T>(data: T, spec: Spec<T>) => T;

  export class Context {
    public isEquals: (x: any, y: any) => boolean;

    public constructor();

    public extend<T>(directive: string, fn: DirectiveFn<T>): void;

    public extendAll<T>(directives: { [key: string]: DirectiveFn<T> }): void;

    public extendCondition<T>(name: string, check: ConditionFn<T>): void;

    public extendConditionAll<T>(checks: { [key: string]: ConditionFn<T> }): void;

    public update<T>(object: T, spec: Spec<T>): T;

    public combine<T>(...specs: Spec<T>[]): Spec<T>;
  }

  const update: Context & Update;
  export default update;
}
