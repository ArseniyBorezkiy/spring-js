import "reflect-metadata";

import { FactoryBean } from "../org.springframework.beans";
import {
  TestContext1_1,
  TestContext1_2,
  TestBean1_1,
  TestBean1_2,
  TestBean1_3,
  TestBean1_4,
  TestBean1_4_Impl,
  TestBean1_1_Token,
  TestBean1_2_Token,
  TestBean1_3_Token,
  TestBean1_4_Token,
  package1
} from "../test/package1";
import {
  TestContext2_1,
  TestContext2_2,
  TestBean2_1,
  TestBean2_2,
  TestBean2_1_Token,
  TestBean2_2_Token,
  package2,
  TestBean2_3,
  TestBean2_3_Token,
  TestBean2_1_TokenProxy,
  TestBean2_4_Token,
  TestBean2_4,
  TestBean2_Value_Token
} from "../test/package2";

//
// Tests
//

describe("Core", () => {
  let context1_1: TestContext1_1;
  let context1_2: TestContext1_2;
  let context2_1: TestContext2_1;
  let context2_2: TestContext2_2;

  beforeEach(() => {
    context1_1 = new TestContext1_1();
    context1_2 = new TestContext1_2();
    context2_1 = new TestContext2_1();
    context2_2 = new TestContext2_2();
    context1_1.configure();
    context1_2.configure();
    context2_1.configure();
    context2_2.configure();
    context2_2.setParent(context2_1);
    context1_1.start();
    context1_2.start();
    context2_1.start();
    context2_2.start();
  });

  afterEach(() => {
    context1_1.close();
    context1_2.close();
    context2_1.close();
    context2_2.close();
  });

  it("Single package test", async () => {
    expect((await context1_1.getBean<TestBean1_1>(TestBean1_1_Token)).getName()).toBe(
      "Bean 1_1"
    );
    expect((await context1_1.getBean<TestBean1_2>(TestBean1_2_Token)).getName()).toBe(
      "Bean 1_2"
    );
    expect((await context1_1.getBean<TestBean1_2>(TestBean1_3_Token)).getName()).toBe(
      "Bean 1_3"
    );
    expect(
      (await context1_1.getBean<TestBean1_2>(TestBean1_2_Token)).bean1.getName()
    ).toBe("Bean 1_1");
    expect((await context1_1.getBean<TestBean1_3>(`${package1}.1_3`))).toBe(
      await context1_1.getBean<TestBean1_3>(TestBean1_3_Token)
    );
    expect(
      (await context1_1.getBean<TestBean1_3>(`${package1}.1_3`)).bean1.getName()
    ).toBe("Bean 1_1");
    expect(
      (await context1_1.getBean<TestBean1_3>(`${package1}.1_3`)).bean2.getName()
    ).toBe("Bean 1_2");
    expect((await context1_1.getBean<TestBean1_3>(`${package1}.1_3`))).toBe(
      await context1_1.getBean<TestBean1_3>(`${package1}.1_3-proxy`)
    );
    // reference identities
    expect((await context1_1.getBean<TestBean1_2>(TestBean1_2_Token)).bean1).toBe(
      (await context1_1.getBean<TestBean1_3>(`${package1}.1_3`)).bean1
    );
    expect((await context1_1.getBean<TestBean1_2>(TestBean1_2_Token)).bean1).toBe(
      (await context1_1.getBean<TestBean1_1>(TestBean1_1_Token))
    );
  });

  it("Multiple packages test", async () => {
    expect((await context1_1.getBean<TestBean2_1>(TestBean2_1_Token)).getName()).toBe(
      "Bean 2_1"
    );
    expect((context1_1.getCachedBean<TestBean2_1>(TestBean2_1_Token)).getName()).toBe(
      "Bean 2_1"
    );
  });

  it("Sibling context test", async () => {
    expect((await context2_1.getBean<TestBean2_1>(TestBean2_1_Token)).getName()).toBe(
      "Bean 2_1"
    );
    expect((context2_1.getCachedBean<TestBean2_1>(TestBean2_1_Token)).getName()).toBe(
      "Bean 2_1"
    );
    expect((await context2_1.getBean<TestBean2_1>(TestBean2_1_Token))).not.toBe(
      await context1_1.getBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((context2_1.getCachedBean<TestBean2_1>(TestBean2_1_Token))).not.toBe(
      context1_1.getBean<TestBean2_1>(TestBean2_1_Token)
    );
  });

  it("Proxy context test", async () => {
    await context2_1.getBean<TestBean2_1>(TestBean2_1_Token);
    context2_1.getCachedBean<TestBean2_1>(TestBean2_1_Token)
    expect((await context2_2.getBean<TestBean2_1>(TestBean2_1_Token)).getName()).toBe(
      "Bean 2_1"
    );
    expect((context2_2.getCachedBean<TestBean2_1>(TestBean2_1_Token)).getName()).toBe(
      "Bean 2_1"
    );
    expect((await context2_2.getBean<TestBean2_1>(TestBean2_1_Token))).toBe(
      await context2_1.getBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((context2_2.getCachedBean<TestBean2_1>(TestBean2_1_Token))).toBe(
      context2_1.getCachedBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((await context2_2.getBean<TestBean2_1>(TestBean2_1_Token))).not.toBe(
      await context1_1.getBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((context2_2.getCachedBean<TestBean2_1>(TestBean2_1_Token))).not.toBe(
      context1_1.getCachedBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((await context2_2.getBean<TestBean2_1>(`${package2}.redirect`))).toBe(
      await context2_1.getBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((context2_2.getCachedBean<TestBean2_1>(`${package2}.redirect`))).toBe(
      context2_1.getCachedBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((await context2_2.getBean<TestBean2_1>(`${package2}.2_1`))).toBe(
      await context2_1.getBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((context2_2.getCachedBean<TestBean2_1>(`${package2}.2_1`))).toBe(
      context2_1.getCachedBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((await context2_2.getBean<TestBean2_1>(`${package2}.2_1-proxy`))).toBe(
      await context2_1.getBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((context2_2.getCachedBean<TestBean2_1>(`${package2}.2_1-proxy`))).toBe(
      context2_1.getCachedBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((await context2_2.getBean<TestBean2_1>(TestBean2_1_TokenProxy))).toBe(
      await context2_1.getBean<TestBean2_1>(TestBean2_1_Token)
    );
    expect((context2_2.getCachedBean<TestBean2_1>(TestBean2_1_TokenProxy))).toBe(
      context2_1.getCachedBean<TestBean2_1>(TestBean2_1_Token)
    );
  });

  it("Global scope test", async () => {
    expect((await context2_1.getBean<TestBean2_2>(TestBean2_2_Token)).getName()).toBe(
      "Global bean 2_2"
    );
    expect((context2_1.getCachedBean<TestBean2_2>(TestBean2_2_Token)).getName()).toBe(
      "Global bean 2_2"
    );
    expect((await context2_1.getBean<TestBean2_2>(TestBean2_2_Token))).toBe(
      await context1_1.getBean<TestBean2_2>(TestBean2_2_Token)
    );
    expect((context2_1.getCachedBean<TestBean2_2>(TestBean2_2_Token))).toBe(
      context1_1.getCachedBean<TestBean2_2>(TestBean2_2_Token)
    );
  });

  it("Prototype scope test", async () => {
    expect((await context2_1.getBean<TestBean2_3>(TestBean2_3_Token)).getName()).toBe(
      "Prototype bean 2_3"
    );
    expect((await context2_1.getBean<TestBean2_3>(TestBean2_3_Token))).not.toBe(
      await context1_1.getBean<TestBean2_3>(TestBean2_3_Token)
      );
    expect(() => context2_1.getCachedBean<TestBean2_3>(TestBean2_3_Token)).toThrow();
  });

  it("Bean inheritance test", async () => {
    expect((await context1_1.getBean<TestBean1_4>(TestBean1_4_Token)).getName()).toBe(
      "Bean 1_4_Impl"
    );
    expect((context1_1.getCachedBean<TestBean1_4>(TestBean1_4_Token)).getName()).toBe(
      "Bean 1_4_Impl"
    );
    expect((await context1_1.getBean<TestBean1_4>(TestBean1_4_Token)).bean1).toBe(
      await context1_1.getBean<TestBean1_1>(TestBean1_1_Token)
    );
    expect((context1_1.getCachedBean<TestBean1_4>(TestBean1_4_Token)).bean1).toBe(
      context1_1.getCachedBean<TestBean1_1>(TestBean1_1_Token)
    );
    expect((await context1_1.getBean<TestBean1_4_Impl>(TestBean1_4_Token)).bean2).toBe(
      await context1_1.getBean<TestBean1_2>(TestBean1_2_Token)
    );
    expect((context1_1.getCachedBean<TestBean1_4_Impl>(TestBean1_4_Token)).bean2).toBe(
      context1_1.getCachedBean<TestBean1_2>(TestBean1_2_Token)
    );
    expect(
      (await context1_1.getBean<TestBean1_4_Impl>(TestBean1_4_Token)).getFullName()
    ).toBe("Bean 1_4_Impl Bean 1_1 Bean 1_2");
    expect(
      (context1_1.getCachedBean<TestBean1_4_Impl>(TestBean1_4_Token)).getFullName()
    ).toBe("Bean 1_4_Impl Bean 1_1 Bean 1_2");
  });

  it("Factory bean test", async () => {
    expect(await context2_1.getBean<Symbol>(`${package2}.factory-singleton`)).toBe(
      await context2_1.getBean<Symbol>(`${package2}.factory-singleton`)
    );
    expect(context2_1.getCachedBean<Symbol>(`${package2}.factory-singleton`)).toBe(
      context2_1.getCachedBean<Symbol>(`${package2}.factory-singleton`)
    );
    expect(
      await context2_1.getBean<Symbol>(`${package2}.factory-prototype`)
    ).not.toBe(await context2_1.getBean<Symbol>(`${package2}.factory-prototype`));
    expect(
      context2_1.getCachedBean<Symbol>(`${package2}.factory-prototype`)
    ).not.toBe(context2_1.getCachedBean<Symbol>(`${package2}.factory-prototype`));
  });

  it("Not found test", async () => {
    let threw = false;

    try {
      await context2_1.getBean<Symbol>(`${package2}`);
    } catch (e) {
      threw = true;
    }

    if (!threw) {
      throw new Error('expected to thow an error');
    }
  });

  it("Lyfecycle hooks test for singleton", async () => {
    const bean = await context2_1.getBean<TestBean2_1>(TestBean2_1_Token);
    expect(bean.initHookCalled).toBeTruthy();
    expect(bean.deinitHookCalled).toBeFalsy();
    context2_1.stop();
    expect(bean.deinitHookCalled).toBeTruthy();
  });

  it("Lyfecycle hooks test for prototype", async () => {
    let instance1 = await context2_1.getBean<TestBean2_3>(TestBean2_3_Token);
    let instance2 = await context2_1.getBean<TestBean2_3>(TestBean2_3_Token);
    expect(instance1.initHookCalled).toBeFalsy();
    expect(instance2.initHookCalled).toBeFalsy();
    expect(instance1.deinitHookCalled).toBeFalsy();
    expect(instance2.deinitHookCalled).toBeFalsy();
    context2_1.stop();
    expect(instance1.deinitHookCalled).toBeFalsy();
    expect(instance2.deinitHookCalled).toBeFalsy();
  });

  it("Lyfecycle hooks test for prototype child", async () => {
    let instance1 = await context2_1.getBean<TestBean2_4>(TestBean2_4_Token);
    let instance2 = await context2_1.getBean<TestBean2_4>(TestBean2_4_Token);
    expect(instance1.initHookCalledChild).toBeTruthy();
    expect(instance2.initHookCalledChild).toBeTruthy();
    expect(instance1.initHookCalled).toBeTruthy();
    expect(instance2.initHookCalled).toBeTruthy();
    expect(instance1.constructorCalledChild).toBeTruthy();
    expect(instance2.constructorCalledChild).toBeTruthy();
    expect(instance1.constructorCalled).toBeTruthy();
    expect(instance2.constructorCalled).toBeTruthy();
    expect(instance1.deinitHookCalledChild).toBeFalsy();
    expect(instance2.deinitHookCalledChild).toBeFalsy();
    context2_1.stop();
    expect(instance1.deinitHookCalledChild).toBeTruthy();
    expect(instance2.deinitHookCalledChild).toBeTruthy();
  });

  it("Beans map test", async () => {
    await context2_1.getBean<TestBean2_1>(TestBean2_1_Token);
    expect(context2_1.beansMap.size).toBe(1);
    await context2_1.getBean<TestBean2_1>(TestBean2_1_Token);
    expect(context2_1.beansMap.size).toBe(1);
    await context2_1.getBean<TestBean2_3>(TestBean2_3_Token);
    expect(context2_1.beansMap.size).toBe(2);
    await context2_1.getBean<TestBean2_3>(TestBean2_3_Token);
    expect(context2_1.beansMap.size).toBe(3);
  });

  it("Proxy context beans map test", async () => {
    await context2_2.getBean<TestBean2_1>(TestBean2_1_Token);
    expect(context2_2.beansMap.size).toBe(1);
    expect(context2_1.beansMap.size).toBe(0);
  });

  it("Optional dependency test", async () => {
    let instance1 = await context2_1.getBean<TestBean2_4>(TestBean2_4_Token);
    expect(instance1.initHookCalledChild).toBeTruthy();
    expect(instance1.unknownBean).toBeNull();
  });

  it("Extra bean path map test", async () => {
    let instance1 = await context2_1.getBean<TestBean2_4>(
      TestBean2_4_Token,
      true,
      new Map([[TestBean2_4_Token, FactoryBean.of(() => 1)]])
    );
    expect(instance1).toBe(1);
    let instance2 = await context2_1.getBean<TestBean2_4>(
      TestBean2_4_Token,
      true,
      new Map([[TestBean2_Value_Token, FactoryBean.of(() => 2)]])
    );
    expect(instance2.getName()).toBe("Prototype bean 2_4");
    expect(instance2.valueBean).toBe(2);
  });
});
