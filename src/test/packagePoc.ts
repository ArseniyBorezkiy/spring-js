import { TPackage } from "../java";
import { Autowired } from "../org.springframework.beans";
import {
  AbstractApplicationContext,
  Bean
} from "../org.springframework.context";

//
// Tokens
//

export const packagePoc: TPackage = "com.test.poc";
export const TestBean_Core_Token = Symbol("TestBean3_Core");
export const TestBean_Business_Token = Symbol("TestBean3_Business");
export const TestBean_Drawable_Token = Symbol("TestBean3_Drawable");

//
// Contexts
//

export class TestContext_Core extends AbstractApplicationContext {
  configure() {
    super.configure(new Map<any, any>([]));
  }
}

export class TestContext_Business extends AbstractApplicationContext {
  configure() {
    super.configure(
      new Map<any, any>([[TestBean_Core_Token, TestBean_Business_Token]])
    );
  }
}

export class TestContext_Drawable extends AbstractApplicationContext {
  configure() {
    super.configure(new Map<any, any>([]));
  }
}

//
// Beans
//

@Bean(TestBean_Core_Token, { scope: "singleton" })
export class TestBean_Core {
  getName() {
    return "Core";
  }
}

@Bean(TestBean_Business_Token, { scope: "singleton" })
export class TestBean_Business extends TestBean_Core {
  getName() {
    return "Business";
  }
}

@Bean(TestBean_Drawable_Token, { scope: "prototype" })
export class TestBean_Drawable {
  @Autowired(TestBean_Core_Token) core: TestBean_Core;

  getName() {
    return "Drawable";
  }
}
