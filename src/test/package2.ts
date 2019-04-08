import { TPackage } from "../java";
import { PostConstruct, PreDestroy } from "../javax";
import { Autowired, FactoryBean } from "../org.springframework.beans";
import {
  AbstractApplicationContext,
  Bean
} from "../org.springframework.context";

//
// Tokens
//

export const package2: TPackage = "org.springframework.test.2";
export const TestBean2_1_Token = Symbol("TestBean2_1");
export const TestBean2_2_Token = Symbol("TestBean2_2");
export const TestBean2_3_Token = Symbol("TestBean2_3");
export const TestBean2_4_Token = Symbol("TestBean2_4");
export const TestBean2_1_TokenProxy = Symbol("TestBean2_1_Proxy");
export const TestBean2_Value_Token = Symbol("TestBean2_Value");
export const TestBean2_Unknown_Token = Symbol("TestBean2_Unknown");

//
// Contexts
//

export class TestContext2_1 extends AbstractApplicationContext {
  configure() {
    const symbol = Symbol();
    super.configure(
      new Map<any, any>([
        [TestBean2_1_TokenProxy, TestBean2_1_Token],
        [`${package2}.2_1`, TestBean2_1_Token],
        [`${package2}.2_1-proxy`, `${package2}.2_1`],
        [`${package2}.factory-prototype`, FactoryBean.of(() => Symbol())],
        [`${package2}.factory-singleton`, FactoryBean.of(() => symbol)]
      ])
    );
  }
}

export class TestContext2_2 extends AbstractApplicationContext {
  configure() {
    super.configure(
      new Map<any, any>([[`${package2}.redirect`, TestBean2_1_Token]])
    );
  }
}

//
// Beans
//

@Bean(TestBean2_1_Token, { scope: "singleton" })
export class TestBean2_1 {
  public initHookCalled: boolean = false;
  public deinitHookCalled: boolean = false;

  getName() {
    return "Bean 2_1";
  }

  @PostConstruct
  public construct() {
    this.initHookCalled = true;
  }

  @PreDestroy
  public destruct() {
    this.deinitHookCalled = true;
  }
}

@Bean(TestBean2_2_Token, { scope: "global" })
export class TestBean2_2 {
  public initHookCalled: boolean = false;
  public deinitHookCalled: boolean = false;

  getName() {
    return "Global bean 2_2";
  }

  @PostConstruct
  public construct() {
    this.initHookCalled = true;
  }

  @PreDestroy
  public destruct() {
    this.deinitHookCalled = true;
  }
}

@Bean(TestBean2_3_Token, { scope: "prototype" })
export class TestBean2_3 {
  public initHookCalled: boolean = false;
  public deinitHookCalled: boolean = false;
  public constructorCalled: boolean = false;

  constructor() {
    this.constructorCalled = true;
  }

  getName() {
    return "Prototype bean 2_3";
  }

  public construct() {
    this.initHookCalled = true;
  }

  public destruct() {
    this.deinitHookCalled = true;
  }
}

@Bean(TestBean2_4_Token, { scope: "prototype" })
export class TestBean2_4 extends TestBean2_3 {
  @Autowired(TestBean2_Value_Token, { required: false })
  public valueBean: any;
  @Autowired(TestBean2_Unknown_Token, { required: false })
  public unknownBean: null;

  public initHookCalledChild: boolean = false;
  public deinitHookCalledChild: boolean = false;
  public constructorCalledChild: boolean = false;

  constructor() {
    super();
    this.constructorCalledChild = true;
  }

  getName() {
    return "Prototype bean 2_4";
  }

  @PostConstruct
  public construct() {
    super.construct();
    this.initHookCalledChild = true;
  }

  @PreDestroy
  public destruct() {
    super.destruct();
    this.deinitHookCalledChild = true;
  }
}
