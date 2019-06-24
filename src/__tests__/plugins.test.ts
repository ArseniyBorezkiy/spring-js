import "reflect-metadata";

import {
  ApplicationTestContext,
  ConsumerToken,
  ConsumerTest,
  ApplicationContextToken
} from "../tests/packagePlugins";
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

  beforeAll(async () => {
    applicationTestContext.configure();
    applicationTestContext.set(
      ApplicationContextToken,
      FactoryBean.of(() => applicationTestContext)
    );
    await applicationTestContext.start();
    await initMocks(ConsumerToken, ConsumerTest, applicationTestContext);
  });

  afterAll(async () => {
    await deinitMocks(ConsumerToken, ConsumerTest, applicationTestContext);
    applicationTestContext.close();
  });

  registerAllTest(ConsumerToken, ConsumerTest, () => applicationTestContext);
});
