export interface IApplicationContextLoader {
  load(): Promise<void>;
}

export interface IApplicationContextLoaderBeanDefinition {
  abstraction: string;
  support: string;
}

export interface IApplicationContextLoaderBean {
  id: string;
  optional: boolean;
}

export interface IApplicationContextLoaderSchema {
  beans: IApplicationContextLoaderBean[];
  beansDefinition: IApplicationContextLoaderBeanDefinition[];
}
