import pattern from "./pattern";

type SplitString<S extends string, D extends string> =
    string extends S ? string[] :
    S extends '' ? [] :
    S extends `${infer T}${D}${infer U}` ? [T, ...SplitString<U, D>] : [S];

export default abstract class path {
    static exists(pathlike: string) {
        return this.getInstance(pathlike) ? true : false
    }
    //assert it to keyof CreatableInstances? idk how tho. ask.
    static last(pathlike: string): string {
        let z = pathlike.split('&')[0];

        let paths = z.split('//');

        return paths[paths.size() - 1]
    }
    static getInstance<T extends string>(pathlike: T): 
        (SplitString<T, '&'>[1] extends keyof Instances ?
        Instances[SplitString<T, '&'>[1] extends keyof Instances? SplitString<T, '&'>[1]: never] : Instance) | undefined
    {
        let p = pathlike.split('&')[0];

        let paths = p.split('//');
        let inst: Instance = game;
        let err = false;
        
        for (const [i, v] of pairs(paths)) {
            let t = inst.FindFirstChild(v)
            if (t) {
                inst = t;
            }
            else {
                err = true;
                break;
            }
        }
        type r = SplitString<T, '&'>[1]
        type z = r extends keyof Instances ? (Instances[r extends keyof Instances? r: never]): Instance
        return err? undefined: inst as z;
    }

    /**
     * use this if you're sure the path exists. if it doesn't, this method will throw an error
     */
    static sure<T extends string>(pathlike: T): 
    (SplitString<T, '&'>[1] extends keyof Instances ?
    Instances[SplitString<T, '&'>[1] extends keyof Instances? SplitString<T, '&'>[1]: never] : Instance)
    {
        //now make it accept args that tell like if it's of a certain class or smth
        let i = this.getInstance(pathlike);
        if (!i) throw `${pathlike} is an invalid path`;

        let matches = pattern.match(pathlike, {
            'classMust': '&class:%a+'
        })

        if (matches.classMust && i.ClassName !== matches.classMust) throw `instance found does not match class ${matches.classMust}. it has class ${i.ClassName}`

        return i
    }

    static createIfMissing<T extends keyof CreatableInstances>(pathlike: string, classType: T): CreatableInstances[T] {
        pathlike = pathlike.split('&')[0];

        let paths = pathlike.split('//');
        let inst: Instance = game;
        
        for (const [i, v] of pairs(paths)) {
            let t = inst.FindFirstChild(v)
            if (t) {
                inst = t;
            }
            else {
                print(i, paths)
                if (i === paths.size()) {
                    print('last one!')
                    let n = new Instance(classType);
                    n.Name = v;
                    n.Parent = inst;
                    inst = n;
                }
                else {
                    throw `unable to create path ${pathlike}. ${paths[paths.size() - 1]} is too deeply nested in non-existing instances`;
                }
                break;
            }
        }
        return inst as CreatableInstances[T];
    }

    static join(...pathlike: string[]): string {
        let l = ''
        pathlike.forEach((v, i) => {
            if (i === 0) {
                l = v
            }
            else {
                l = `${l}//${v}`
            }
        })
        return l;
    }
}