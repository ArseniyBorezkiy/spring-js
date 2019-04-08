import "reflect-metadata";

import { ETransactionStatus, TransactionRequiredException } from "../javax";
import {
  SimpleTransactionManager,
  TestTransactionContext,
  SimpleActor,
  SimpleActorToken,
  SimpleTransaction
} from "../test/packageTransaction";

//
// Tests
//

describe("Transaction core", () => {
  let transactionManager: SimpleTransactionManager;

  beforeEach(() => {
    transactionManager = new SimpleTransactionManager();
  });

  afterEach(() => {
    transactionManager = null;
  });

  it("Transaction commit test", () => {
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.closed);
    transactionManager.begin();
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.opened);
    transactionManager.commit();
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.commited);
  });

  it("Transaction incorrect usage test", () => {
    expect(() => transactionManager.commit()).toThrow(
      TransactionRequiredException
    );
    expect(() => transactionManager.rollback()).toThrow(
      TransactionRequiredException
    );
  });

  it("Transaction rollback test", () => {
    transactionManager.begin();
    transactionManager.rollback();
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.rollbacked);
  });
});

describe("Transaction in context", () => {
  let context: TestTransactionContext;

  beforeEach(() => {
    context = new TestTransactionContext();
    context.start();
  });

  afterEach(() => {
    context.close();
  });

  it("Transation without errors", () => {
    const actor = context.getBean<SimpleActor>(SimpleActorToken);
    actor.methodWithoudErrors();
    expect(actor.transactionManager.getStatus()).toBe(
      ETransactionStatus.commited
    );
  });

  it("Transation with errors", () => {
    const actor = context.getBean<SimpleActor>(SimpleActorToken);
    try {
      actor.methodWithErrors();
    } catch (e) {
      expect(actor.transactionManager.getStatus()).toBe(
        ETransactionStatus.rollbacked
      );
    }
  });

  it("Deep calls without errors", () => {
    const actor = context.getBean<SimpleActor>(SimpleActorToken);
    expect(actor.methodDeepWithoutErrors()).toBe(1);
    const transaction1 = actor.transactionManager.getTransaction<
      SimpleTransaction
    >();
    expect(transaction1.commites).toBe(1);
    expect(actor.transactionManager.getStatus()).toBe(
      ETransactionStatus.commited
    );
    const transaction2 = actor.transactionManager.getTransaction<
      SimpleTransaction
    >();
    expect(transaction2.commites).toBe(1);
    expect(actor.transactionManager.getStatus()).toBe(
      ETransactionStatus.commited
    );
  });
});
