import { Exception } from "../java";

/**
 * Params of the transaction (for transactional annotations).
 */
export interface ITransactionParams {
  target?: ITransactional;
}

/**
 * Status of the transaction.
 * @remark https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/transaction/TransactionStatus.html
 */
export enum ETransactionStatus {
  closed = 0,
  opened = 1,
  suspended = 2,
  commited = 3,
  rollbacked = 4
}

/**
 * Base interface for all transactions.
 */
export interface ITransaction {
  commit();
  rollback();
  getStatus(): ETransactionStatus;
}

/**
 * Allows to manage transactions.
 * @remark https://docs.oracle.com/javaee/7/api/javax/transaction/TransactionManager.html
 */
export interface ITransactionManager {
  begin(params: ITransactionParams): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  suspend(): void;
  resume(): void;
  getStatus(): ETransactionStatus;
  getTransaction<T extends ITransaction>(): T;
}

/**
 * Awareness of transactionManager instance (for transactional annotations).
 */
export interface ITransactional {
  transactionManager: ITransactionManager;
}

/**
 * Superclass for all transaction exceptions.
 * @remark https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/transaction/TransactionException.html
 */
export class TransactionException extends Exception {}

/**
 * Thrown when transaction needed.
 * @remark https://docs.oracle.com/javaee/6/api/javax/persistence/TransactionRequiredException.html
 */
export class TransactionRequiredException extends Exception {}
