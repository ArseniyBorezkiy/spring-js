import "reflect-metadata";

import {
  TestContext,
  TestBean_3,
  TestBean_3_Token,
  TestBean_1,
  TestBean_1_Token
} from "../tests/packageFactoryBean";

//
// Tests
//

describe("Factory bean", () => {
  let context: TestContext;

  beforeEach(async () => {
    context = new TestContext();
    context.start();
  });

  afterEach(() => {
    context.close();
  });

  it("Resolver test", async () => {
    const bean1 = await context.getBean<TestBean_1>(TestBean_1_Token);
    expect(bean1.getName()).toBe("1");
    const bean3 = await context.getBean<TestBean_3>(TestBean_3_Token);
    expect(bean3.getName()).toBe("3");
    expect(bean3.bean2).not.toBeNull();
    expect(bean3.bean2.getName()).toBe("2");
    expect(bean3.bean2.bean1).not.toBeNull();
    expect(bean3.bean2.bean1.getName()).toBe("1");
    expect(bean3.bean2.bean1).toBe(bean1);
  });
});
