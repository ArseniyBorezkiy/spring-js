import "reflect-metadata";
import clone from "lodash/clone";

import {
  ETransactionStatus,
  ITransactionManager,
  ITransaction
} from "../javax";
import {
  TestTransactionContext,
  SimpleActorToken,
  SimpleTransactionManagerToken,
  SimpleActor
} from "../tests/packageTransaction";
import { TWishedBean } from "../org.springframework.beans";

//
// Constants
//

const emptyOperation = {
  commits: 0,
  rollbacks: 0,
  async commit(): Promise<void> {
    this.commits++;
  },
  async rollback(): Promise<void> {
    this.rollback++;
  }
};

//
// Tests
//

describe("Transaction core", () => {
  let context: TestTransactionContext = null;

  beforeEach(() => {
    context = new TestTransactionContext();
    context.configure(new Map<any, TWishedBean>([]));
    context.start();
  });

  afterEach(() => {
    context.close();
  });

  it("Low level transaction commit test", async () => {
    const transactionManager = await context.getBean<
      ITransactionManager<ITransaction>
    >(SimpleTransactionManagerToken);

    const operation = clone(emptyOperation);
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.closed);
    await transactionManager.begin({ operation });
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.opened);
    await transactionManager.commit();
    expect(transactionManager.getStatus()).toBe(ETransactionStatus.commited);
    expect(operation.commits).toBe(1);
    expect(operation.rollbacks).toBe(0);
  });

  it("High level shallow transaction commit test", async () => {
    const actor = await context.getBean<SimpleActor>(SimpleActorToken);

    await actor!.methodWithoutErrors();

    expect(actor!.transactionManager.getStatus()).toBe(
      ETransactionStatus.commited
    );
  });

  it("High level shallow transaction rollback test", async () => {
    const actor = await context.getBean<SimpleActor>(SimpleActorToken);

    await actor!.methodWithErrors();

    expect(actor!.transactionManager.getStatus()).toBe(
      ETransactionStatus.rollbacked
    );
  });

  it("High level deep transaction commit test", async () => {
    const actor = await context.getBean<SimpleActor>(SimpleActorToken);

    await actor!.methodDeepWithoutErrors();

    expect(actor!.transactionManager.getStatus()).toBe(
      ETransactionStatus.commited
    );
  });

  it("High level deep transaction rollback test", async () => {
    const actor = await context.getBean<SimpleActor>(SimpleActorToken);

    await actor!.methodDeepWithErrors();

    expect(actor!.transactionManager.getStatus()).toBe(
      ETransactionStatus.rollbacked
    );
  });
});
