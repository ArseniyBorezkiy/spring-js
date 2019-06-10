import { ITransaction, ETransactionStatus } from "../javax/transaction";

/**
 * Abstract transaction.
 * Basic implementation for Transaction interface.
 * @remark https://tinkerpop.apache.org/javadocs/3.3.0/full/org/apache/tinkerpop/gremlin/structure/util/AbstractTransaction.html
 */
export class AbstractTransaction implements ITransaction {
  private status: ETransactionStatus;

  /* constructor */
  constructor() {
    this.status = ETransactionStatus.opened;
  }

  //
  // Api
  //

  public commit() {
    this.status = ETransactionStatus.commited;
  }

  public rollback() {
    this.status = ETransactionStatus.rollbacked;
  }

  public getStatus(): ETransactionStatus {
    return this.status;
  }
}
