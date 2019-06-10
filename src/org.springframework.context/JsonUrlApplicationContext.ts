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

  public configureBeansDefinitions(debug: boolean) {
    const beansDefinition: any = this.schema.beansDefinition.map(
      beanDefinition => [beanDefinition.abstraction, beanDefinition.support]
    );

    if (debug) {
      console.log(`${PFX} beans definition`);
    }

    beansDefinition.forEach(beanDefinition => {
      if (debug) {
        console.log(
          `${PFX} + mapped ${beanDefinition[0]} to ${beanDefinition[1]}`
        );
      }
    });

    super.configure(new Map<any, TWishedBeanOrFactory>(beansDefinition));
  }

  public async startSchemaBeans(debug: boolean) {
    const beans = this.schema.beans;

    if (debug) {
      console.log(`${PFX} initial beans`);
    }

    for (let bean of beans) {
      if (debug) {
        console.log(`${PFX} + bean=${bean.id} required=${!bean.optional}`);
      }

      await this.getBean(bean.id, !bean.optional, null, debug);
    }
  }
}
