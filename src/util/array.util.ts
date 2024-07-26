export type ArrayComparator<T> = (valA: T, valB: T) => boolean;

/** @returns true if value is in the array, based on the comparator function */
export function arrayIncludes<T>(
  arr: T[],
  val: T,
  comparator: ArrayComparator<T>
): boolean {
  return arr.some((v) => comparator(val, v));
}

/** If arrA=[1,3,4,5] and arrB=[1,2,5] then return arr=[1,5])
 * @returns Elements that both arrays share in common
 * @see https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848
 */
export function arrayIntersection<T>(
  arrA: T[],
  arrB: T[],
  comparator: ArrayComparator<T>
): T[] {
  return arrA.filter((x) => arrayIncludes(arrB, x, comparator));
}

/** arrDif = arrA - arrB
 * If arrA=[1,3,4,5] and arrB=[1,2,5] then return arr=[3,4]
 * If( arrA=[1,2,5] and arrB=[1,3,4,5] then return arr=[2])
 * @returns Elements from array A that are not in the array B
 * @see https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848
 */
export function arrayDifference<T>(
  arrA: T[],
  arrB: T[],
  comparator: ArrayComparator<T>
): T[] {
  return arrA.filter((x) => !arrayIncludes(arrB, x, comparator));
}

/**
 * If arrA=[{n="bob",a="5"},{n="alice",a="10"}]
 * And if arrB=[{n="alice",a="11"},{n="jack",a="20"}]
 * And if comparator=(a,b)=>a.n===b.n
 * Then return arr=[{n="bob",a="5"},{n="alice",a="11"},{n="jack",a="20"}]
 * @return Elements in both arrays, with similar elements in B overriding elements in A
 */
export function arrayUnionOverride<T>(
  arrA: T[],
  arrB: T[],
  comparator: ArrayComparator<T>
): T[] {
  // A contains items not in B
  const ADiffB: T[] = arrayDifference(arrA, arrB, comparator);
  // B contains overrides for A
  const BIntersA: T[] = arrayIntersection(arrB, arrA, comparator);
  // B contains extra items not in A
  const BDiffA: T[] = arrayDifference(arrB, arrA, comparator);
  return [...ADiffB, ...BIntersA, ...BDiffA];
}
