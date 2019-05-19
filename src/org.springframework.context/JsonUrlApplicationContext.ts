import { AbstractApplicationContext } from "./abstractApplicationContext";
import { TWishedBeanOrFactory } from "../org.springframework.beans";
import {
  IApplicationContextLoader,
  IApplicationContextLoaderSchema
} from "./applicationContextLoader";

const PFX = "[JSON APPLICATION CONTEXT]:";

export class JsonUrlApplicationContext extends AbstractApplicationContext
  implements IApplicationContextLoader {
  private schema: IApplicationContextLoaderSchema;

  constructor(private url: string) {
    super();
  }

  public async load(): Promise<void> {
    const response = await fetch(this.url);
    const schema = await response.json();
    this.schema = schema;
  }

  public configureBeansDefinitions() {
    const beansDefinition: any = this.schema.beansDefinition.map(
      beanDefinition => [beanDefinition.abstraction, beanDefinition.support]
    );

    console.log(`${PFX} beans definition`);
    beansDefinition.forEach(beanDefinition => {
      console.log(
        `${PFX} + mapped ${beanDefinition.abstraction} to ${
          beanDefinition.support
        }`
      );
    });

    super.configure(new Map<any, TWishedBeanOrFactory>(beansDefinition));
  }

  public async startSchemaBeans() {
    const beans = this.schema.beans;
    console.log(`${PFX} initial beans`);
    beans.forEach(bean => {
      console.log(`${PFX} + bean ${bean}`);
      this.getBean(bean.id, !bean.optional);
    });
  }
}
