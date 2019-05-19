import "reflect-metadata";

import {
  JsonContext,
  Bean_1_Token,
  Bean_2_Token,
  applicationContextJsonFile,
  Bean_1
} from "../test/packageContextLoader";

//
// Tests
//

describe("Context loader", () => {
  let context: JsonContext;
  let fetchMock: any = fetch;

  beforeEach(async done => {
    const data = JSON.stringify(applicationContextJsonFile);
    fetchMock.mockResponse(data);
    context = new JsonContext("http://applicationContext.json");
    context.load().then(async () => {
      context.configure();
      await context.start();

      done();
    });
  });

  afterEach(() => {
    context.close();
    fetchMock.resetMocks();
  });

  it("Beans", async () => {
    expect(context.beanPathMap.size).toBe(4);
    const bean1 = await context.getBean<Bean_1>(Bean_1_Token);
    const bean2 = await context.getBean(Bean_2_Token, false);
    expect(bean1).not.toBeNull();
    expect(bean1.schema).not.toBeNull();
    expect(JSON.stringify(bean1.schema)).toBe(
      JSON.stringify(applicationContextJsonFile)
    );
    expect(bean2).toBeNull();
  });
});
