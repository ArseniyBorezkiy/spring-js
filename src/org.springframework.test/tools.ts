import { AbstractApplicationContext } from "../org.springframework.context";
import {
  testsToken,
  asyncTestsToken,
  spiesToken,
  spiesValuesToken,
  spiesOnGetToken
} from "./annotations";

/**
 * Register all test in bean.
 * @param token - bean token.
 * @param type - bean class.
 * @param contextGetter - getter of context from retrieve bean.
 */
export function registerAllTest(
  token: Symbol,
  type: any,
  contextGetter: () => AbstractApplicationContext
) {
  if (Reflect.hasMetadata(testsToken, type)) {
    const keys = Reflect.getMetadata(testsToken, type);
    for (let i = 0; i < keys.length; ++i) {
      const name = keys[i];
      it(name, async () => {
        const bean = await contextGetter().getBean(token);
        const f = bean[name];
        f.call(bean, contextGetter());
      });
    }
  }

  if (Reflect.hasMetadata(asyncTestsToken, type)) {
    const keys = Reflect.getMetadata(asyncTestsToken, type);
    for (let i = 0; i < keys.length; ++i) {
      const name = keys[i];
      it(name, async () => {
        const bean = await contextGetter().getBean(token);
        const f = bean[name];
        await f.call(bean, contextGetter());
      });
    }
  }
}

/**
 * Init annotated mocks in bean.
 * @param token - bean token.
 * @param type - bean class.
 * @param context - context from retrieve bean.
 */
export async function initMocks(
  token: Symbol,
  type: any,
  context: AbstractApplicationContext
) {
  const obj: Object = await context.getBean(token);
  if (Reflect.hasMetadata(spiesToken, type)) {
    const keys = Reflect.getMetadata(spiesToken, type);
    for (let i = 0; i < keys.length; ++i) {
      const name = keys[i];
      const spy = jest.spyOn(obj, name);

      if (!Reflect.hasMetadata(spiesValuesToken, obj)) {
        Reflect.defineMetadata(spiesValuesToken, [spy], obj);
      } else {
        const spies = Reflect.getMetadata(spiesValuesToken, obj);
        Reflect.defineMetadata(spiesValuesToken, [spy, ...spies], obj);
      }
    }
  }
  if (Reflect.hasMetadata(spiesOnGetToken, type)) {
    const keys = Reflect.getMetadata(spiesOnGetToken, type);
    for (let i = 0; i < keys.length; ++i) {
      const name = keys[i];
      const spy = jest.spyOn(obj, name, "get");

      if (!Reflect.hasMetadata(spiesValuesToken, obj)) {
        Reflect.defineMetadata(spiesValuesToken, [spy], obj);
      } else {
        const spies = Reflect.getMetadata(spiesValuesToken, obj);
        Reflect.defineMetadata(spiesValuesToken, [spy, ...spies], obj);
      }
    }
  }
}

/**
 * Deinit mocks in bean.
 * @param token - bean token.
 * @param type - bean class.
 * @param context - context from retrieve bean.
 */
export async function deinitMocks(
  token: Symbol,
  type: any,
  context: AbstractApplicationContext
) {
  const obj: Object = await context.getBean(token);
  if (Reflect.hasMetadata(spiesValuesToken, obj)) {
    const keys = Reflect.getMetadata(spiesValuesToken, obj);
    for (let i = 0; i < keys.length; ++i) {
      const spy = keys[i];
      spy.mockRestore();
    }
  }
}
