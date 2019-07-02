import { TPackage } from "../java";
import {
  Transactional,
  ITransactional,
  TTransactionOperation,
  ITransactionManager
} from "../javax";
import {
  AbstractTransaction,
  AbstractTransactionManager
} from "../org.springframework.transaction";
import {
  Bean,
  AbstractApplicationContext
} from "../org.springframework.context";
import { Autowired } from "../org.springframework.beans";

//
// Tokens
//

export const packageTransaction: TPackage =
  "org.springframework.test.transaction";
export const SimpleActorToken = Symbol("SimpleActor");
export const SimpleTransactionManagerToken = Symbol("SimpleTransactionManager");

//
// Context
//

export class TestTransactionContext extends AbstractApplicationContext {}

//
// Simple Transaction Implemntation
//

export class SimpleTransaction extends AbstractTransaction {}

@Bean(SimpleTransactionManagerToken)
export class SimpleTransactionManager extends AbstractTransactionManager<
  SimpleTransaction
> {
  public transactionFactory(): SimpleTransaction {
    return new SimpleTransaction();
  }
}

//
// Simple Transaction Manager Implemntation
//

@Bean(SimpleActorToken)
export class SimpleActor implements ITransactional<SimpleTransaction> {
  @Autowired(SimpleTransactionManagerToken)
  transactionManager?: ITransactionManager<SimpleTransaction>;

  @Transactional()
  public methodWithoutErrors(): TTransactionOperation {
    return {
      commit: async () => {},
      rollback: async () => {}
    };
  }

  @Transactional()
  public methodWithErrors(): TTransactionOperation {
    return {
      commit: async () => {
        throw new Error("Method throws error");
      },
      rollback: async () => {}
    };
  }

  @Transactional()
  public methodDeepWithoutErrors(): TTransactionOperation {
    return {
      commit: async () => {
        await this.methodShallowWithoutErrors();
      },
      rollback: async () => {}
    };
  }

  @Transactional()
  public methodDeepWithErrors(): TTransactionOperation {
    return {
      commit: async () => {
        await this.methodShallowWithErrors();
      },
      rollback: async () => {}
    };
  }

  @Transactional()
  public methodShallowWithoutErrors(): TTransactionOperation {
    return {
      commit: async () => {},
      rollback: async () => {}
    };
  }

  @Transactional()
  public methodShallowWithErrors(): TTransactionOperation {
    return {
      commit: async () => {
        throw new Error("Method throws error");
      },
      rollback: async () => {}
    };
  }
}
