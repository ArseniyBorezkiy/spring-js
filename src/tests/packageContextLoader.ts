import { TPackage } from "../java";
import { Bean } from "../org.springframework.context";
import { JsonUrlApplicationContext } from "../org.springframework.context/jsonUrlApplicationContext";
import { IApplicationContextLoaderSchema } from "../org.springframework.context/applicationContextLoader";
import { TWishedBeanOrFactory } from "../org.springframework.beans";
import { Resource } from "../javax";

//
// Tokens
//

export const packagePoc: TPackage = "org.springframework.test.contextLoader";
export const Bean_1_Token = Symbol("Bean_1");
export const Bean_2_Token = Symbol("Bean_2");

//
// Contexts
//

export class JsonContext extends JsonUrlApplicationContext {
  configure() {
    super.configure(
      new Map<any, TWishedBeanOrFactory>([
        [`${packagePoc}.bean1`, Bean_1_Token],
        [`${packagePoc}.bean2`, Bean_2_Token]
      ])
    );
    super.configureBeansDefinitions(false);
  }

  async start() {
    await super.startSchemaBeans(false);
  }
}

//
// Beans
//

@Bean(Bean_1_Token)
export class Bean_1 {
  @Resource("http://applicationContext.json")
  schema: IApplicationContextLoaderSchema;
}

//
// applicationContext.json
//

export const applicationContextJsonFile: IApplicationContextLoaderSchema = {
  beans: [
    { id: `${packagePoc}.bean1`, optional: false },
    { id: `${packagePoc}.bean2`, optional: true }
  ],
  beansDefinition: [
    { abstraction: `${packagePoc}.name1`, support: `${packagePoc}.bean1` },
    { abstraction: `${packagePoc}.name2`, support: `${packagePoc}.bean2` }
  ]
};
