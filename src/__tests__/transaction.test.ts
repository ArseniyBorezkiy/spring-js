import "reflect-metadata";

import { ETransactionStatus, TransactionRequiredException } from "../javax";
import {
  SimpleTransactionManager,
  TestTransactionContext,
  SimpleActor,
  SimpleActorToken,
  SimpleTransaction
} from "../tests/packageTransaction";

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

  it("Transaction commit test", async () => {
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.closed);
    await transactionManager.begin();
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.opened);
    await transactionManager.commit();
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.commited);
  });

  it("Transaction incorrect usage test", async () => {
    try {
      await transactionManager.commit();
      throw new Error("Expected function throws error");
    } catch (e) {
      expect(e instanceof TransactionRequiredException).toBe(true);
    }

    try {
      await transactionManager.rollback();
      throw new Error("Expected function throws error");
    } catch (e) {
      expect(e instanceof TransactionRequiredException).toBe(true);
    }
  });

  it("Transaction rollback test", async () => {
    await transactionManager.begin();
    await transactionManager.rollback();
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

  it("Transation without errors", async () => {
    const actor = await context.getBean<SimpleActor>(SimpleActorToken);
    await actor.methodWithoudErrors();
    expect(actor.transactionManager.getStatus()).toBe(
      ETransactionStatus.commited
    );
  });

  it("Transation with errors", async () => {
    const actor = await context.getBean<SimpleActor>(SimpleActorToken);
    try {
      await actor.methodWithErrors();
    } catch (e) {
      expect(actor.transactionManager.getStatus()).toBe(
        ETransactionStatus.rollbacked
      );
    }
  });

  it("Deep calls without errors", async () => {
    const actor = await context.getBean<SimpleActor>(SimpleActorToken);
    const result = await actor.methodDeepWithoutErrors();
    expect(result).toBe(1);
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
