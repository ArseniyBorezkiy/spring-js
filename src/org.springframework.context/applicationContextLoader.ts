/**
 * Strategy interface for loading an application context configuration from file.
 * @remark https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/test/context/ContextLoader.html
 */
export interface IApplicationContextLoader {
  load(): Promise<void>;
}

/**
 * Bean mapping.
 * Schema for context configuration file.
 */
export interface IApplicationContextLoaderBeanDefinition {
  abstraction: string;
  support: string;
}

/**
 * Bean to load at context start.
 * Schema for context configuration file.
 */
export interface IApplicationContextLoaderBean {
  id: string;
  optional: boolean;
}

/**
 * Context configuration file.
 * Schema for context configuration file.
 */
export interface IApplicationContextLoaderSchema {
  beans: IApplicationContextLoaderBean[];
  beansDefinition: IApplicationContextLoaderBeanDefinition[];
}
