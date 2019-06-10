import { TPackage } from "../java";
import { Transactional, ITransactional } from "../javax";
import {
  AbstractTransaction,
  AbstractTransactionManager
} from "../org.springframework.transaction";
import {
  Bean,
  AbstractApplicationContext
} from "../org.springframework.context";

//
// Tokens
//

export const packageTransaction: TPackage =
  "org.springframework.test.transaction";
export const SimpleActorToken = Symbol("SimpleActor");

//
// Simple Transaction Implemntation
//

export class SimpleTransaction extends AbstractTransaction {
  public commites = 0;
  public rollbacks = 0;

  commit() {
    this.commites += 1;
    super.commit();
  }

  rollback() {
    this.commites += 1;
    super.rollback();
  }
}

export class SimpleTransactionManager extends AbstractTransactionManager {
  public begin() {
    this.transaction = new SimpleTransaction();
    super.begin(null);
  }
}

//
// Context
//

export class TestTransactionContext extends AbstractApplicationContext {}

@Bean(SimpleActorToken)
export class SimpleActor implements ITransactional {
  public transactionManager = new SimpleTransactionManager();

  @Transactional()
  public methodWithoudErrors() {}

  @Transactional()
  public methodWithErrors() {
    throw new Error("my test error");
  }

  @Transactional()
  public methodDeepWithoutErrors() {
    return this.method1();
  }

  @Transactional()
  private method1() {
    return 1;
  }
}
