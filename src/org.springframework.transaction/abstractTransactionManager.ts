import {
  ITransactionManager,
  ETransactionStatus,
  ITransaction,
  TransactionRequiredException,
  ITransactionParams,
  TTransactionOperation
} from "../javax/transaction";

/**
 * Base class for all transaction managers.
 * Base implmentation of TransactionManager interface.
 * Implements semaphore way to manage keep single transaction via transactional-annotated functions deep calls.
 */
export abstract class AbstractTransactionManager<T extends ITransaction>
  implements ITransactionManager<T> {
  protected transaction: T;
  protected suspended: boolean;
  protected semaphore: number; // for deep function calls
  protected operations: TTransactionOperation[]; // operations that constitutes transaction

  /* constructor */
  constructor() {
    this.semaphore = 0;
  }

  //
  // Api
  //

  /**
   * transaction provider
   */
  public abstract async transactionFactory(): Promise<T>;

  /**
   * start transaction
   */
  public async begin(params: ITransactionParams<T>): Promise<void> {
    if (this.semaphore === 0) {
      this.operations = [];
      this.transaction = await this.transactionFactory();
    }

    this.semaphore += 1;
    this.operations.push(params.operation);
  }

  /**
   * commit transaction
   */
  public async commit(): Promise<void> {
    if (!this.transaction) {
      throw new TransactionRequiredException();
    }

    if (this.semaphore === 1) {
      await this.transaction.commit(this.operations);
    }

    this.semaphore -= 1;
  }

  /**
   * rollback transaction
   */
  public async rollback(): Promise<void> {
    if (!this.transaction) {
      throw new TransactionRequiredException();
    }

    if (this.semaphore === 1) {
      try {
        await this.transaction.rollback(this.operations);
      } catch (e) {
        console.error(
          "Uncaughted exception in transaction rollback",
          this.transaction
        );
      }
    }

    this.semaphore -= 1;
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
   * close transaction
   */
  public close(): void {
    delete this.transaction;
    this.operations = [];
    this.semaphore = 0;
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
  public getTransaction(): T {
    return this.transaction;
  }
}
