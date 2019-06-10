import { TPackage } from "../java";
import {
  AbstractApplicationContext,
  Bean,
  EventListener,
  ApplicationEvent,
  ApplicationContextEvent
} from "../org.springframework.context";
import { Disposable, TDisposer } from "../rxjava";

//
// Tokens
//

export const packagePoc: TPackage = "org.springframework.test.context";
export const TestBean_1_Token = Symbol("TestBean_1");

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
  public eventTriggered = false;
  @Disposable disposer: TDisposer = () => (this.eventTriggered = null);

  @EventListener(ApplicationContextEvent as any)
  public onApplicationEvent(event: ApplicationEvent) {
    this.eventTriggered = true;
  }
}
