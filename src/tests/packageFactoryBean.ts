import { TPackage } from "../java";
import {
  Autowired,
  IResolver,
  TWishedBean
} from "../org.springframework.beans";
import {
  AbstractApplicationContext,
  Bean
} from "../org.springframework.context";

//
// Tokens
//

export const packagePoc: TPackage = "org.springframework.test.poc";
export const TestBean_1_Token = Symbol("TestBean_1");
export const TestBean_2_Token = Symbol("TestBean_2");
export const TestBean_3_Token = Symbol("TestBean_3");
export const ResolverToken = Symbol("Resolver");
export const TestBean_2_ResolveToken = Symbol("TestBean_2_Resolve");

//
// Contexts
//

export class TestContext extends AbstractApplicationContext {
  configure() {
    super.configure(new Map<any, any>([]));
  }
}

//
// Beans
//

@Bean(TestBean_1_Token, { scope: "singleton" })
export class TestBean_1 {
  getName() {
    return "1";
  }
}

@Bean(TestBean_2_Token, { scope: "singleton" })
export class TestBean_2 {
  @Autowired("bean1") bean1: TestBean_1;

  getName() {
    return "2";
  }
}

@Bean(TestBean_3_Token, { scope: "singleton", resolver: ResolverToken })
export class TestBean_3 {
  @Autowired(TestBean_2_Token, { resolve: TestBean_2_ResolveToken })
  bean2: TestBean_2;

  getName() {
    return "3";
  }
}

@Bean(ResolverToken)
export class Resolver implements IResolver<TestBean_3> {
  public resolve(path: TWishedBean, bean: TestBean_3): any[] | null {
    switch (path) {
      case TestBean_2_ResolveToken:
        return [["bean1", TestBean_1_Token]];
    }

    return null;
  }
}
