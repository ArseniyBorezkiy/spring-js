import {
  ApplicationContextAware,
  IApplicationContext
} from "./applicationContext";

export class ApplicationContextProvider implements ApplicationContextAware {
  public context: IApplicationContext;

  private static instance: ApplicationContextProvider = null;

  public static get(): ApplicationContextProvider {
    if (!ApplicationContextProvider.instance) {
      ApplicationContextProvider.instance = new ApplicationContextProvider();
    }

    return ApplicationContextProvider.instance;
  }

  public getApplicationContext(): IApplicationContext {
    return this.context;
  }

  public setApplicationContext(context: IApplicationContext) {
    this.context = context;
  }
}
