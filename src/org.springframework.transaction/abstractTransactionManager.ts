import {
  ITransactionManager,
  ETransactionStatus,
  ITransaction,
  TransactionRequiredException,
  ITransactionParams
} from "../javax/transaction";

/**
 * Base class for all transaction managers.
 * Base implmentation of TransactionManager interface.
 * Implements semaphore way to manage keep single transaction via transactional-annotated functions deep calls.
 */
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

  /**
   * start transaction
   */
  public async begin(params: ITransactionParams): Promise<void> {
    this.semaphore += 1;
  }

  /**
   * commit transaction
   */
  public async commit(): Promise<void> {
    this.semaphore -= 1;

    if (!this.transaction) {
      throw new TransactionRequiredException();
    }

    if (this.semaphore === 0) {
      this.transaction.commit();
    }
  }

  /**
   * rollback transaction
   */
  public async rollback(): Promise<void> {
    this.semaphore -= 1;

    if (!this.transaction) {
      throw new TransactionRequiredException();
    }

    if (this.semaphore === 0) {
      this.transaction.rollback();
    }
  }

  /**
   * suspend transaction
   */
  public suspend(): void {
    this.suspended = true;
  }

  /**
   * resume transaction
   */
  public resume(): void {
    this.suspended = false;
  }

  /**
   * get status of transaction
   */
  public getStatus(): ETransactionStatus {
    return this.transaction
      ? this.transaction.getStatus()
      : ETransactionStatus.closed;
  }

  /**
   * get transaction object
   */
  public getTransaction<T extends ITransaction>(): T {
    return this.transaction as T;
  }
}
