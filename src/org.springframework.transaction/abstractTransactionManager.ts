import {
  ITransactionManager,
  ETransactionStatus,
  ITransaction,
  TransactionRequiredException,
  ITransactionParams
} from "../javax/transaction";

export abstract class AbstractTransactionManager
  implements ITransactionManager {
  protected transaction: ITransaction;
  protected suspended: boolean;
  protected semaphore: number; // for deep function calls

  /* constructor */
  constructor() {
    this.semaphore = 0;
  }

  //
  // Api
  //

  public begin(params: ITransactionParams) {
    this.semaphore += 1;
  }

  public commit() {
    this.semaphore -= 1;

    if (!this.transaction) {
      throw new TransactionRequiredException();
    }

    if (this.semaphore === 0) {
      this.transaction.commit();
    }
  }

  public rollback() {
    this.semaphore -= 1;

    if (!this.transaction) {
      throw new TransactionRequiredException();
    }

    if (this.semaphore === 0) {
      this.transaction.rollback();
    }
  }

  public suspend() {
    this.suspended = true;
  }

  public resume() {
    this.suspended = false;
  }

  public getStatus(): ETransactionStatus {
    return this.transaction
      ? this.transaction.getStatus()
      : ETransactionStatus.closed;
  }

  public getTransaction<T extends ITransaction>(): T {
    return this.transaction as T;
  }
}
