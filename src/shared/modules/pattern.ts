export default abstract class pattern {
    static match<P extends Record<string, string>>(str: string, patterns: P) {
        let matches: Partial<Record<keyof P, string>> = {}
        for (const [i, v] of pairs(patterns)) {
            let match = str.match(v as string);
            if (match[0]) {
                matches[i as keyof P] = v as string;
            }
        }
        return matches;
    }
}