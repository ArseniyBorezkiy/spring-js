import "reflect-metadata";

import {
  TestContext_Business,
  TestContext_Drawable,
  TestBean_Drawable_Token,
  TestBean_Drawable,
  TestBean_Core_Token,
  TestBean_Business
} from "../test/packagePoc";

//
// Tests
//

describe("Proof of concept", () => {
  let contextBusiness: TestContext_Business;
  let contextDrawable: TestContext_Drawable;

  beforeEach(() => {
    contextBusiness = new TestContext_Business();
    contextDrawable = new TestContext_Drawable();
    contextBusiness.configure();
    contextDrawable.configure();
    contextDrawable.setParent(contextBusiness);
    contextBusiness.start();
    contextDrawable.start();
  });

  afterEach(() => {
    contextDrawable.close();
    contextBusiness.close();
  });

  it("Poc test", async () => {
    const business = await contextBusiness.getBean<TestBean_Business>(
      TestBean_Core_Token
    );
    const drawable = await contextDrawable.getBean<TestBean_Drawable>(
      TestBean_Drawable_Token
    );
    expect(drawable.core).toBe(business);
  });
});
