// supportive types
type TOneOnly<Obj, Key extends keyof Obj> = { [key in Exclude<keyof Obj, Key>]: null } & Pick<Obj, Key>;
type TOneOfByKey<Obj> = { [key in keyof Obj]: TOneOnly<Obj, key> };


// main types
export type TValueOf<T> = T[keyof T];
export type TOneOf<Obj> = TValueOf<TOneOfByKey<Obj>>;
export type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };