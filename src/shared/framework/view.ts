export function viewBob(rate: number, amplitude: number) {
    return math.sin(tick() * rate) * amplitude;
}