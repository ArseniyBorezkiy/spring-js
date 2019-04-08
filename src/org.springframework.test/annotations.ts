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

export function Test(target, key, descriptor) {
  const destination = target.constructor;
  const keys = Reflect.getMetadata(testsToken, destination) || [];
  Reflect.defineMetadata(testsToken, [key, ...keys], destination);
}

//
// @AsyncTest
//

export function AsyncTest(target, key, descriptor) {
  const destination = target.constructor;
  const keys = Reflect.getMetadata(asyncTestsToken, destination) || [];
  Reflect.defineMetadata(asyncTestsToken, [key, ...keys], destination);
}

//
// @Spy
//

export function Spy(target, key, descriptor) {
  const destination = target.constructor;
  const keys = Reflect.getMetadata(spiesToken, destination) || [];
  Reflect.defineMetadata(spiesToken, [key, ...keys], destination);
}

//
// @SpyOnGet
//

export function SpyOnGet(target, key, descriptor) {
  const destination = target.constructor;
  const keys = Reflect.getMetadata(spiesOnGetToken, destination) || [];
  Reflect.defineMetadata(spiesOnGetToken, [key, ...keys], destination);
}
