/** NOTE: 메모리 절약을 위해 제너레이터로 구현 */
export function* generateChunk<T>(arr: T[], size: number) {
  let i = 0;

  while (i < arr.length) {
    yield arr.slice(i, (i += size));
  }
}
