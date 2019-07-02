import {
  ITransaction,
  ETransactionStatus,
  TTransactionOperation
} from "../javax/transaction";

/**
 * Abstract transaction.
 * Basic implementation for Transaction interface.
 * @remark https://tinkerpop.apache.org/javadocs/3.3.0/full/org/apache/tinkerpop/gremlin/structure/util/AbstractTransaction.html
 */
export class AbstractTransaction implements ITransaction {
  protected commitingOperations: TTransactionOperation[] = [];
  private status: ETransactionStatus;

  /* constructor */
  constructor() {
    this.status = ETransactionStatus.opened;
  }

  //
  // Api
  //

  public async commit(operations: TTransactionOperation[]): Promise<void> {
    for (const operation of operations) {
      this.commitingOperations.push(operation);
      await operation.commit();
    }

    this.commitingOperations = [];
    this.status = ETransactionStatus.commited;
  }

  public async rollback(operations: TTransactionOperation[]): Promise<void> {
    for (const operation of this.commitingOperations) {
      await operation.rollback();
    }

    this.commitingOperations = [];
    this.status = ETransactionStatus.rollbacked;
  }

  public getStatus(): ETransactionStatus {
    return this.status;
  }
}
