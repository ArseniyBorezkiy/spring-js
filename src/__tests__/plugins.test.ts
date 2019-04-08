import "reflect-metadata";

import {
  ApplicationTestContext,
  ConsumerToken,
  ConsumerTest,
  ApplicationContextToken
} from "../test/packagePlugins";
import { registerAllTest, initMocks, deinitMocks, FactoryBean } from "..";
import { ApplicationContextProvider } from "../org.springframework.context";

//
// Tests
//

describe("Plugins", () => {
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
    initMocks(ConsumerToken, ConsumerTest, applicationTestContext);
  });

  afterAll(() => {
    deinitMocks(ConsumerToken, ConsumerTest, applicationTestContext);
    applicationTestContext.close();
  });

  registerAllTest(ConsumerToken, ConsumerTest, applicationTestContext);
});
