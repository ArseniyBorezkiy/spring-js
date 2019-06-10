import { TPackage } from "../java";
import { Autowired } from "../org.springframework.beans";
import {
  AbstractApplicationContext,
  Bean
} from "../org.springframework.context";

//
// Tokens
//

export const package1: TPackage = "org.springframework.test.1";
export const TestBean1_1_Token = Symbol("TestBean1_1");
export const TestBean1_2_Token = Symbol("TestBean1_2");
export const TestBean1_3_Token = Symbol("TestBean1_3");
export const TestBean1_4_Token = Symbol("TestBean1_4");
export const TestBean1_4_Token_Impl = Symbol("TestBean1_4_Token_Impl");

//
// Contexts
//

export class TestContext1_1 extends AbstractApplicationContext {
  configure() {
    super.configure(
      new Map<any, any>([
        [`${package1}.1_3`, TestBean1_3_Token],
        [`${package1}.1_3-proxy`, `${package1}.1_3`],
        [TestBean1_4_Token, TestBean1_4_Token_Impl]
      ])
    );
  }
}

export class TestContext1_2 extends TestContext1_1 {}

//
// Beans
//

@Bean(TestBean1_1_Token)
export class TestBean1_1 {
  getName() {
    return "Bean 1_1";
  }
}

@Bean(TestBean1_2_Token)
export class TestBean1_2 {
  @Autowired(TestBean1_1_Token) public bean1: TestBean1_1;
  // @Resource("https://...", { required: false }) public resource1: Promise<any>;

  getName() {
    return "Bean 1_2";
  }
}

@Bean(TestBean1_3_Token)
export class TestBean1_3 {
  @Autowired(TestBean1_1_Token) public bean1: TestBean1_1;
  @Autowired(TestBean1_2_Token) public bean2: TestBean1_2;

  getName() {
    return "Bean 1_3";
  }
}

@Bean(TestBean1_4_Token)
export class TestBean1_4 {
  @Autowired(TestBean1_1_Token) public bean1: TestBean1_1;

  getName() {
    return "Bean 1_4";
  }
}

@Bean(TestBean1_4_Token_Impl)
export class TestBean1_4_Impl extends TestBean1_4 {
  @Autowired(TestBean1_2_Token) public bean2: TestBean1_2;

  getName() {
    return "Bean 1_4_Impl";
  }

  getFullName() {
    return `${this.getName()} ${this.bean1.getName()} ${this.bean2.getName()}`;
  }
}
