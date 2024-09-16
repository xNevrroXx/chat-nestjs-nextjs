export type TValueOf<T> = T[keyof T];

// deep omit
type TPrimitives = string | number | boolean | symbol;

/**
 * Get all valid nested path's of an object
 */
export type TAllProps<
    Obj,
    Cache extends Array<TPrimitives> = []
> = Obj extends TPrimitives
    ? Cache
    : {
          [Prop in keyof Obj]:
              | [...Cache, Prop] // <------ it should be unionized with recursion call
              | TAllProps<Obj[Prop], [...Cache, Prop]>;
      }[keyof Obj];

export type TOmitBase<
    Obj,
    Path extends ReadonlyArray<unknown>
> = TLast<Path> extends true
    ? {
          [Prop in Exclude<keyof Obj, THead<Path>>]: Obj[Prop];
      }
    : {
          [Prop in keyof Obj]: TOmitBase<Obj[Prop], TTail<Path>>;
      };

//
type THead<T extends ReadonlyArray<unknown>> = T extends []
    ? never
    : T extends [infer Head]
    ? Head
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T extends [infer Head, ...infer _]
    ? Head
    : never;

type TTail<T extends ReadonlyArray<unknown>> = T extends []
    ? []
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T extends [infer _]
    ? []
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T extends [infer _, ...infer Rest]
    ? Rest
    : never;

type TLast<T extends ReadonlyArray<unknown>> = T["length"] extends 1
    ? true
    : false;

// we should allow only existing properties in right order
// type OmitBy<Obj, Keys extends AllProps<Obj>> = OmitBase<A, Keys>
