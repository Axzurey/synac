import { popIndex } from "./sweep"

namespace serenity {
    type serializable = number | string | boolean | BrickColor | CFrame | Color3 | Enum | UDim | UDim2 | Vector2 | Vector3

    interface serializesTo {
        boolean: (b: boolean) => boolean
        string: (s: string) => string,
        number: (n: number) => number,
        BrickColor: (brickColor: BrickColor) => ['BrickColor', BrickColor<keyof BrickColorsByNumber>['Name']],
        CFrame: (cframe: CFrame) => ['CFrame', number, number, number, number, number, number, number, number, number, number, number, number],
        Color3: (color3: Color3) => ['Color3', number, number, number],
        Enum: (enumvalue: EnumItem) => ['Enum', keyof Enums, keyof Enums[keyof Enums]],
        UDim: (udim: UDim) => ['UDim', number, number],
        UDim2: (udim2: UDim2) => ['UDim2', number, number, number, number],
        Vector2: (vector2: Vector2) => ['Vector2', number, number],
        Vector3: (vector3: Vector3) => ['Vector3', number, number, number]
    }

    type serializesFrom = {[k in keyof serializesTo]: {
        out: Parameters<serializesTo[k]>[0],
        in: ReturnType<serializesTo[k]>
    }}

    const deconstructs: serializesTo = {
        'Enum': (e: EnumItem) => ['Enum', tostring(e.EnumType) as keyof Enums, e.Name as keyof Enums[keyof Enums]],
        'string': (s: string) => s,
        'boolean': (b: boolean) => b,
        'number': (n: number) => n,
        'BrickColor': (b: BrickColor) => ['BrickColor', b.Name],
        'UDim': (u: UDim) => ['UDim', u.Scale, u.Offset],
        'UDim2': (u: UDim2) => ['UDim2', u.X.Scale, u.X.Offset, u.Y.Scale, u.Y.Offset],
        'CFrame': (cf: CFrame) => ['CFrame', ...cf.GetComponents() as [number, number, number, number, number, number, number, number, number, number, number, number]],
        'Vector3': (v3: Vector3) => ['Vector3', v3.X, v3.Y, v3.Z],
        'Vector2': (v2: Vector2) => ['Vector2', v2.X, v2.Y],
        'Color3': (c3: Color3) => ['Color3', c3.R, c3.G, c3.B],
    }
    
    const rebuilds: {[k in keyof serializesFrom]: (o: serializesFrom[k]['in'] extends unknown[] ? PopArrayType<serializesFrom[k]['in'], 0> : serializesFrom[k]['in']) => serializesFrom[k]['out']} = {
        'number': (n) => n,
        'string': (s) => s,
        'boolean': (b) => b,
        'CFrame': (c) => new CFrame(...c),
        'Vector3': (v) => new Vector3(...v),
        'Vector2': (v) => new Vector2(...v),
        'Color3': (c) => Color3.fromRGB(...c),
        'BrickColor': (b) => new BrickColor(b[0]),
        'Enum': (e) => Enum[e[0]][e[1]],
        'UDim': (u) => new UDim(...u),
        'UDim2': (u) => new UDim2(...u),
    }

    type TypeToLiteral<T> = 
        T extends number ? 'number' :
        T extends string ? 'string' :
        T extends boolean ? 'boolean' :
        T extends CFrame ? 'CFrame' :
        T extends Vector2 ? 'Vector2' :
        T extends Vector3 ? 'Vector3' :
        T extends Color3 ? 'Color3' :
        T extends BrickColor ? 'BrickColor' :
        T extends Enum ? 'Enum' :
        T extends UDim ? 'UDim' :
        T extends UDim2 ? 'UDim2' :
        'NEVER'

    type serializablePayload = serializable | {[key in string | number]: serializablePayload} | serializablePayload[]

    type fullSerialize<T> =
        TypeToLiteral<T> extends keyof serializesFrom ?
            serializesFrom[TypeToLiteral<T>]['in'] :
                T extends CheckableTypes[keyof CheckableTypes] ?
                    T extends any[] ?
                        {[K in keyof T]: fullSerialize<T[K]>} :
                    T extends Record<any, any> ?
                        {[K in keyof T]: fullSerialize<T[K]>} :
                never :
            never

    export function serialize<T extends serializablePayload>(payload: T): fullSerialize<T> {
        if (typeIs(payload, 'table')) {
            let out = {}
            for (let [k, v] of pairs(payload)) {
                out[k as never] = serialize(v as any) as never;
            }
            return out as any
        }
        else {
            let out = deconstructs[typeOf(payload) as keyof serializesTo](payload as never);
            return out as any;
        }
    }

    type fullDeserialize<T> = 
        T extends any[] ?
            T[0] extends keyof serializesFrom ?
                serializesFrom[T[0]]['out']
            : T
        : T extends CheckableTypes[keyof CheckableTypes] ?
            T extends Record<any, any> ?
                {[K in keyof T]: fullDeserialize<T[K]>}
            : T
        : T

    export function deserialize<T extends fullSerialize<serializable> | fullSerialize<serializable>[] | Record<string, fullSerialize<serializable>>>(payload: T): fullDeserialize<T> {
        //i had to use index 1 here, because for some reason it wasn't compiling the 0 index to 1 in lua...
        if (typeIs(payload, 'table')) {
            if (payload[1] && rebuilds[payload[1] as keyof typeof rebuilds]) {
                let i0: keyof typeof rebuilds = payload[1] as keyof typeof rebuilds;
                let p = popIndex(payload as never[], 1);
                let n: (...args: unknown[]) => unknown = rebuilds[i0] as any;
                return n(p) as any;
            }
            else {
                let out = {};
                for (let [k, v]of pairs(payload)) {
                    out[k as never] = deserialize(v as never) as never
                }
                return out as any;
            }
        }
        else {
            return payload as any;
        }
    }
}

export = serenity;