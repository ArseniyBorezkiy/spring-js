import { AbstractApplicationContext } from "./abstractApplicationContext";
import { TWishedBeanOrFactory } from "../org.springframework.beans";
import {
  IApplicationContextLoader,
  IApplicationContextLoaderSchema
} from "./applicationContextLoader";

const PFX = "[JSON APPLICATION CONTEXT]:";

/**
 * Application context loaded from remote json configuration file (like xml in spring)
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/support/ClassPathXmlApplicationContext.html
 */
export class JsonUrlApplicationContext extends AbstractApplicationContext
  implements IApplicationContextLoader {
  private schema: IApplicationContextLoaderSchema;

  constructor(private url: string) {
    super();
  }

  /**
   * Load context from url.
   */
  public async load(): Promise<void> {
    const response = await fetch(this.url);
    const schema = await response.json();
    this.schema = schema;
  }

  /**
   * Load beans configuration from context file.
   * @param debug - show beans definition to console
   */
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

  /**
   * Instantiate beans specified in context file.
   * @param debug - show beans instantiated to console
   */
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
