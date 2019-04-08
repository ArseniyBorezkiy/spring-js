import "reflect-metadata";

import {
  ApplicationTestContext,
  Bean1Token,
  Bean1Test,
  ApplicationContextToken
} from "../test/packageDemo";
import { registerAllTest, initMocks, deinitMocks, FactoryBean } from "..";
import { ApplicationContextProvider } from "../org.springframework.context";

//
// Tests
//

describe("Demo", () => {
  const applicationTestContext = new ApplicationTestContext();
  ApplicationContextProvider.get().setApplicationContext(
    applicationTestContext
  );

  beforeAll(() => {
    applicationTestContext.configure();
    applicationTestContext.set(
      ApplicationContextToken,
      FactoryBean.of(() => applicationTestContext)
    );
    applicationTestContext.start();
    initMocks(Bean1Token, Bean1Test, applicationTestContext);
  });

  afterAll(() => {
    deinitMocks(Bean1Token, Bean1Test, applicationTestContext);
    applicationTestContext.close();
  });

  registerAllTest(Bean1Token, Bean1Test, applicationTestContext);
});
