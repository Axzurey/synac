export {}

declare global {

    type ValueOf<T> = T[keyof T]

	type InferThis<T> = T extends (this: infer U, ...parameters: Array<any>) => any ? U : never;

    type propertyExists<P extends string, T> = { [k in P]: T}

	type omitFirstValueOfArray<T> = T extends [infer _, ...infer U] ? [...U] : never;

    type ReverseMap<T extends Record<keyof T, keyof any>> = {
        [P in T[keyof T]]: {
            [K in keyof T]: T[K] extends P ? K : never
        }[keyof T]
    }

    type Filter<T extends unknown[], U> = T extends []
    ? []
    : T extends [infer Head, ...infer Rest]
    ? Head extends U
        ? Filter<Rest, U>
        : [Head, ...Filter<Rest, U>]
    : T;

    type Pop<T extends unknown[], U extends number> = {
        [P in keyof T]: P extends `${U}` ? undefined : T[P];
    };

    type PopArrayType<T extends unknown[], U extends number> = Filter<Pop<T, U>, undefined>;

    type PropertyKey = string | number | symbol

    type LiteralToCommon<T extends PropertyKey> =
        T extends number
        ? number : T extends string
        ? string : T extends symbol
        ? symbol : never;

    type Mutable<T> = {
        -readonly [K in keyof T]: T[K] extends PropertyKey ? LiteralToCommon<T[K]> : Mutable<T[K]>;
    }
}