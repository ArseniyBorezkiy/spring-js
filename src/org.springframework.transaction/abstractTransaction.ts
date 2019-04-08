import { ITransaction, ETransactionStatus } from "../javax/transaction";

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
