//
// Types
//

export const testsToken = Symbol();
export const asyncTestsToken = Symbol();
export const spiesToken = Symbol();
export const spiesValuesToken = Symbol();
export const spiesOnGetToken = Symbol();

//
// @Test
//

/**
 * Mark bean method as test.
 * @remark https://junit.org/junit4/javadoc/4.12/org/junit/Test.html
 */
export function Test(target, key, descriptor) {
  const destination = target.constructor;
  const keys = Reflect.getMetadata(testsToken, destination) || [];
  Reflect.defineMetadata(testsToken, [key, ...keys], destination);
}

//
// @AsyncTest
//

/**
 * Mark bean method as async test.
 * @remark https://junit.org/junit4/javadoc/4.12/org/junit/Test.html
 */
export function AsyncTest(target, key, descriptor) {
  const destination = target.constructor;
  const keys = Reflect.getMetadata(asyncTestsToken, destination) || [];
  Reflect.defineMetadata(asyncTestsToken, [key, ...keys], destination);
}

//
// @Spy
//

/**
 * Spy for bean method.
 */
export function Spy(target, key, descriptor) {
  const destination = target.constructor;
  const keys = Reflect.getMetadata(spiesToken, destination) || [];
  Reflect.defineMetadata(spiesToken, [key, ...keys], destination);
}

//
// @SpyOnGet
//

/**
 * Spy for bean getter.
 */
export function SpyOnGet(target, key, descriptor) {
  const destination = target.constructor;
  const keys = Reflect.getMetadata(spiesOnGetToken, destination) || [];
  Reflect.defineMetadata(spiesOnGetToken, [key, ...keys], destination);
}
