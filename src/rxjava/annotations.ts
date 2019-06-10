//
// Types
//

export const disposableToken = Symbol();
export type TDisposer = () => void;

//
// @Disposable
//

/**
 * Represents a disposable resource.
 * @remark http://reactivex.io/RxJava/javadoc/io/reactivex/disposables/Disposable.html
 */
export function Disposable(target, propertyKey: string) {
  const destination = target.constructor;
  if (!Reflect.hasMetadata(disposableToken, destination)) {
    Reflect.defineMetadata(disposableToken, [propertyKey], destination);
  } else {
    const keys = Reflect.getMetadata(disposableToken, destination);
    Reflect.defineMetadata(
      disposableToken,
      [...keys, propertyKey],
      destination
    );
  }
}
