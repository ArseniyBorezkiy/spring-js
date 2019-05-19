import {
  Bean,
  Autowired,
  AbstractApplicationContext,
  Test,
  TWishedBeanOrFactory,
  FactoryBean,
  PostConstruct,
  IApplicationContextAware,
  IApplicationContext,
  bean,
  Configuration
} from "..";

//
// Tokens
//

export const ApplicationContextToken = Symbol();
export const ConsumerToken = Symbol();
export const ConsumerTestToken = Symbol();
export const ProviderToken = Symbol();
export const ProviderImplToken = Symbol();
export const ProviderPluginToken1 = Symbol();
export const ProviderPluginToken2 = Symbol();
export const ConfigurationToken = Symbol();
export const ConfigurationPluginsToken = Symbol();

export interface IPlugin<T> {
  applyPluginTo(obj: T);
}

export interface IProvider {
  provide(): number;
}

//
// Provider.ts
//
@Bean(ProviderImplToken)
export class ProviderImpl implements IProvider {
  //
  // Api
  //

  public provide(): number {
    return 1;
  }
}

//
// Consumer.ts
//
@Bean(ConsumerToken)
export class Consumer {
  @Autowired(ProviderToken) provider: IProvider;

  //
  // Api
  //

  public consume() {
    return this.provider.provide();
  }
}

//
// Provider plugin 1.ts
//
@Bean(ProviderPluginToken1)
export class ProviderPlugin1 implements IProvider, IApplicationContextAware {
  @Autowired(ApplicationContextToken) context?: IApplicationContext;
  @Autowired(ProviderToken) provider?: IProvider;

  @PostConstruct
  public construct() {
    this.context.set(ProviderToken, FactoryBean.of(() => this));
  }

  //
  // Api
  //

  public provide(): number {
    return this.provider.provide() + 1;
  }
}

//
// Provider plugin 2.ts
//
@Bean(ProviderPluginToken2)
export class ProviderPlugin2 implements IProvider, IApplicationContextAware {
  @Autowired(ApplicationContextToken) context?: IApplicationContext;
  @Autowired(ProviderToken) provider: IProvider;

  @PostConstruct
  public construct() {
    this.context.set(ProviderToken, FactoryBean.of(() => this));
  }

  //
  // Api
  //

  public provide(): number {
    return this.provider.provide() + 2;
  }
}

//
// Configuration.ts
//
@Configuration(ConfigurationPluginsToken)
export class ConfigurationPlugins implements IApplicationContextAware {
  @Autowired(ApplicationContextToken) context?: IApplicationContext;
  @Autowired(ProviderToken) provider?: IProvider;

  @bean(ProviderToken)
  public async providerBean(): Promise<IProvider> {
    let provider = this.provider;

    const currentProviderBeanMap = new Map<any, TWishedBeanOrFactory>([
      [ProviderToken, FactoryBean.of(() => provider)]
    ]);

    // apply optional plugin 1
    const plugin1 = await this.context.getBean<IProvider>(
      ProviderPluginToken1,
      false,
      currentProviderBeanMap
    );
    provider = plugin1 || provider;
    // apply optional plugin 2
    const plugin2 = await this.context.getBean<IProvider>(
      ProviderPluginToken2,
      false,
      currentProviderBeanMap
    );
    provider = plugin2 || provider;

    return provider;
  }
}

//
// applicationTestContext.ts
//
export class ApplicationTestContext extends AbstractApplicationContext {
  public configure() {
    super.configure(
      new Map<any, TWishedBeanOrFactory>([
        [ConsumerToken, ConsumerTestToken],
        [ConfigurationToken, ConfigurationPluginsToken],
        [ProviderToken, ProviderImplToken]
      ])
    );
  }

  public async start() {
    // bootstrap context

    // instantiate bean to be overrided
    await this.getBean<Consumer>(ProviderToken);
    // instatiate configuration with beans to override provider
    await this.getBean(ConfigurationToken);
    // instantiate consumer with overrided provider
    await this.getBean<Consumer>(ConsumerToken);

    super.start();
  }
}

//
// ConsumerTest.ts
//
@Bean(ConsumerTestToken)
export class ConsumerTest extends Consumer {
  @Test
  public test1() {
    expect(this.consume()).toBe(4);
  }
}
