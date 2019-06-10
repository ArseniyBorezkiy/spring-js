import {
  IApplicationContextAware,
  IApplicationContext
} from "./applicationContext";

/**
 * Application context holder.
 * Singleton.
 * @remark https://syncope.apache.org/apidocs/2.0/org/apache/syncope/core/spring/ApplicationContextProvider.html
 */
export class ApplicationContextProvider implements IApplicationContextAware {
  public context: IApplicationContext;

  private static instance: ApplicationContextProvider = null;

  /**
   * Get application context provider singleton object
   */
  public static get(): ApplicationContextProvider {
    if (!ApplicationContextProvider.instance) {
      ApplicationContextProvider.instance = new ApplicationContextProvider();
    }

    return ApplicationContextProvider.instance;
  }

  /**
   * Get application context from holder
   */
  public getApplicationContext(): IApplicationContext {
    return this.context;
  }

  /**
   * Set application context to hold on
   * @param context - context to keep
   */
  public setApplicationContext(context: IApplicationContext) {
    this.context = context;
  }
}
