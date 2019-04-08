import "reflect-metadata";

import {
  TestContext,
  TestBean_1,
  TestBean_1_Token
} from "../test/packageContext";

//
// Tests
//

describe("Context", () => {
  let context: TestContext;

  beforeEach(() => {
    context = new TestContext();
  });

  afterEach(() => {
    context.close();
  });

  it("Events", () => {
    const instance = context.getBean<TestBean_1>(TestBean_1_Token);
    expect(instance.eventTriggered).toBeFalsy();
    context.start();
    expect(instance.eventTriggered).toBeTruthy();
    context.close();
    expect(instance.eventTriggered).toBeNull();
  });
});
