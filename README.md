# `@sds/js-beans`

## Реализация IoC паттерна в стиле Spring.

1) Избавляет от бойлерплейт кода по управлению зависимостями.
2) Позволяет строить сложные модульные системы ослабляя связанность компонентов.
3) Упрощает написание тестов.

##### Как правильно использовать:

1. Define packages "com.*" (one package may not contain two or more beans with similar names)
2. Define beans in packages (injectable classes that could not have arguments in constructor)
3. Define contexts in packages (context is the beans storage, define one global per application and some others local)
4. Configure contexts (specify wich types should be instantiated for requested pathes)
5. Create and use your application context (beans will be created when use will retrieve it)
6. Try to get bean from context (it will be created with all dependencies injected)
7. Create later dynamically other contexts and use it

##### Пример.

Задача: Дмитрий Ястремский пришел в кафе. Он позвал официанта.
С целью увеличения лояльности ресторан ведет учет любимых кофе посетителей.
Придя в ресторан Дима сказал: принесите мне мой любимый кофе и еще один самый продаваемый.
Как официанту понять какой кофе принести, ведь завтра придет Андрей Змиевской и скажет дайте мне мой любимый кофе?
Эту задачу решает контекст зависимостей.

```
//
// main.ts
//

import { YourWaiter } from "./restaurant";
import { dimaContext } from "./dima";

const waiter: YourWaiter = dimaContext.getYourWaiter();
waiter.yourLovelyCoffee(); // instanceof Nescafe
waiter.bestSaleCoffee(); // instanceof Nescafe
waiter.coffeeGrand1(); // instanceof Grand
waiter.coffeeNescafe1(); // instanceof Nescafe
waiter.coffeeGrand2(); // instanceof Grand
waiter.coffeeNescafe2(); // instanceof Nescafe
```

```
//
// Coffee.ts
//

export abstract class AbstractCoffee {
    abstract drink() {}
}
```
```
//
// Nescafe.ts
//

import { Bean } from "@sds/js-beans";
import { AbstractCoffee } from "./Coffee";

export const TokenCoffeeNescafe = Symbol("TokenCoffeeNescafe");

@Bean(TokenCoffeeNescafe)
export class Coffee extends AbstractCoffee {
    drink() { return "nescafe" };
}
```
```
//
// Grand.ts
//

import { Bean } from "@sds/js-beans";
import { AbstractCoffee } from "./Coffee"; 

export const TokenCoffeeGrand = Symbol("TokenCoffeeGrand");

@Bean(TokenCoffeeGrand)
export class Coffee extends AbstractCoffee {
    drink() { return "grand" };
}
```
```
//
// Restaurant.ts
//

import { Context, Bean } from "@sds/js-beans";
import { Coffee as Nescafe, TokenCoffeeNescafe } from "./Nescafe";
import { Coffee as Grand, TokenCoffeeGrand } from "./Grand";
import { AbstractCoffee } from "./Coffee";

export const package = "com.restaurant";
export const TokenYourWaiter = Symbol("TokenYourWaiter");

@Bean(TokenYourWaiter)
export class YourWaiter {
  @Autowired(`${package}.lovely`) yourLovelyCoffee: AbstractCoffee;
  @Autowired(`${package}.bestsale`) bestSaleCoffee: AbstractCoffee;
  @Autowired(TokenCoffeeGrand) coffeeGrand1: AbstractCoffee;
  @Autowired(TokenCoffeeNescafe) coffeeNescafe1: AbstractCoffee;
  @Autowired() coffeeGrand2: AbstractCoffee;
  @Autowired() coffeeNescafe2: AbstractCoffee;
}

export class RestaurantContext extends Context {
  setRestaurantSettings() {
      super.configure({
          "bestsale": TokenCoffeeNescafe,
      });
  }
  
  getYourWaiter(): Cup {
      return this.getBean<YourWaiter>(TokenYourWaiter);
  }
}

export const dimaContext = new DimaContext();
```
```
//
// DimaContext.ts
//

import { RestaurantContext } from "./Restaurant";
import { Coffee as Nescafe, TokenCoffeeNescafe } from "./Nescafe";

@Package('com.restaurant')
export class DimaContext extends RestaurantContext {
    constructor() {
        this.setRestaurantSettings();
        this.setDimaPreferences();
    }
    
    setDimaPreferences() {
      super.configure({
          "lovely": TokenCoffeeNescafe,
      });
  }
}
```

## Тестовый пакет для тестирования Beans классов.
Мы должны убедиться что Диме принесли его любимый кофе.

```
//
// DimaTestContext.ts
//

import { DimaContext } from "./DimaContext";
import { TokenCoffeeNescafeTest } from "./NescafeTest"
import { YourWaiterTestToken } from "./YourWaiterTest"

export class DimaTestContext extends DimaContext {
  super.configure(new Map<any,any>([
      [YourWaiterToken, YourWaiterTestToken],
      [TokenCoffeeNescafe, TokenCoffeeNescafeTest],
  ]));
}
```
```
//
// NescafeTest.ts
//

import { Spy, Bean } from "@sds/js-beans";
import { Coffee } from "./Nescafe";

export const TokenCoffeeNescafeTest = Symbol("TokenCoffeeNescafeTest");

@Bean(TokenCoffeeNescafeTest)
export NescafeTest extends Coffee {
    @Spy()
    drink() { return super.drink(); }
}
```
```
//
// dima.test.ts
//

describe("DimaTest", () => {
  const context = new DimaTestContext();

  beforeAll(() => {
    context.configure();
  });

  afterAll(() => {
    context.destroy();
  });

  beforeEach(() => {
    initMocks(TokenYourWaiterTest, YourWaiterTest, context);
  });

  afterEach(() => {
    deinitMocks(TokenYourWaiterTest, YourWaiterTest, context);
  });

  registerAllTest(TokenYourWaiterTest, YourWaiterTest, context);
});
```
```
//
// YourWaiterTest.ts
//

import { Bean, Autowired, Test } from "@sds/js-beans";
import { DimaTestContext } from "./DimaTestContext";

export const TokenYourWaiterTest = Symbol("TokenYourWaiterTest");

@Bean(TokenYourWaiterTest)
export class YourWaiterTest extends YourWaiter {
  //
  // Tests
  //

  @Test
  public lovelyCoffeeTest(context: DimaTestContext) {
      // любимый кофе димы должен быть Нескафе
      expect(this.yourLovelyCoffee).toBe(context.getBean<Nescafe>(Nescafe));
      // пьем
      this.yourLovelyCoffee.drink();
      // проверяем что выпилось до дна
      expect(this.drink).toBeCalled();
  }
}
```