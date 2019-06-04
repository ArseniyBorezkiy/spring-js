import { Exception } from "../java";

export interface ITransactionParams {
  target?: ITransactional;
}

export enum ETransactionStatus {
  closed = 0,
  opened = 1,
  suspended = 2,
  commited = 3,
  rollbacked = 4
}

export interface ITransaction {
  commit();
  rollback();
  getStatus(): ETransactionStatus;
}

export interface ITransactionManager {
  begin(params: ITransactionParams);
  commit();
  rollback();
  suspend();
  resume();
  getStatus(): ETransactionStatus;
  getTransaction<T extends ITransaction>(): T;
}

export interface ITransactional {
  transactionManager: ITransactionManager;
}

export class TransactionException extends Exception {}
export class TransactionRequiredException extends Exception {}
