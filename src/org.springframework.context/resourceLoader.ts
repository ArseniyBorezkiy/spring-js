/**
 * Strategy interface for loading resources.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/io/ResourceLoader.html
 */
export interface IResourceLoader {
  getResource(url: string): any;
}
