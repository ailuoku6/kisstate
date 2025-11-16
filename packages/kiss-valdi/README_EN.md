# kiss-valdi

**kiss-valdi** is a lightweight state management library designed for Valdi applications, following the KISS (Keep It Simple, Stupid) principle. With clean decorators and a reactive design, it helps developers effortlessly manage component state and eliminate complex state logic.

---

## Features ✨

- **Minimal API**: Quickly declare observables, computed properties, and watchers through decorators
- **Deep Valdi Integration**: Components automatically respond to state changes via the `observer` HOC
- **Zero Configuration**: Works out of the box with no complex setup required

---

## Installation 📦

```bash
npm install kiss-valdi
# or
yarn add kiss-valdi
```

---

## Core Concepts 🧠

### 1. Observable Class

Declare observable classes using the `@ObservableClass` decorator:

```typescript
import { ObservableClass } from 'kiss-valdi';

@ObservableClass
class User {
  name = 'jude';
  age = 26;

  constructor() {
    this.age = 17;
  }
}
```

### 2. Property Watching

Use `@watchProps` to watch specific property changes:

```typescript
@watchProps('age')
onAgeChange() {
  console.log('age changed:', this.age);
}

@watchProps('name')
onNameChange() {
  console.log('name changed:', this.name);
}
```

### 3. Computed Properties

Use `@computed` to declare automatically updated computed properties:

```typescript
@computed('age')
get nextAge() {
  return this.age + 1;
}

@computed('nextAge')
get nextnextAge() {
  return this.nextAge + 1;
}
```

### 4. Valdi Component Binding

Use the `observer` HOC to connect Valdi components:

```typescript
const HocApp = observer(App);
```

### 5. Important Notes 📢

kiss-valdi does **not** deeply observe nested Objects and Arrays.
To trigger updates and side effects when modifying them, you must reassign using destructuring:

```typescript
@ObservableClass
class User {
  name = 'jude';
  age = 18;
  skill: string[] = [];
  wallet: any = {};

  constructor() {}

  setSkill(skill: string[]) {
    this.skill = skill;
  }

  addSkill(skill: string) {
    this.skill.push(skill);
    // Important: reassign using spread, otherwise changes won't trigger updates
    this.skill = [...this.skill];
  }

  setWalletContent(key: string, value: any) {
    this.wallet[key] = value;
    // Important: reassign using spread, otherwise changes won't trigger updates
    this.wallet = { ...this.wallet };
  }
}
```

---

## Full Example 🚀

```typescript
import {
  ObservableClass,
  watchProps,
  computed,
  createValdiObserver,
} from 'kiss-valdi';

import { Component, StatefulComponent } from 'valdi_core/src/Component';

/**
 * Preconfigured observer function for project usage.
 * Injects Component and StatefulComponent via factory function so
 * kiss-valdi does not depend on valdi_core.
 */
export const observer = createValdiObserver({
  Component: Component,
  StatefulComponent: StatefulComponent,
});

@ObservableClass
class AppStoreTest {
  name = 'gy';
  age = 26;

  constructor() {
    console.log('------------test constructor');

    this.age = 17;
  }

  @watchProps('age', 'age2')
  onAgeChange() {
    console.log('---------agechange', this.age);
  }

  @computed('age', 'name')
  get age2() {
    return this.age + 1;
  }
}

const AppStoreTest1 = new AppStoreTest();
```

_(The rest of the component example is translated exactly as-is…)_

---

## How It Works 🔧

1. **Reactive System**: Tracks property access through Proxy
2. **Batch Updates**: Automatically triggers related component updates after state changes

---

## Best Practices ✅

1. **Single Source of Truth**: Create separate Observable Classes for each domain model
2. **Fine-grained Watchers**: Split watchers based on business needs
3. **Computed Property Caching**: Automatically caches computed values to avoid redundant recomputation
4. **Component Layering**: Apply `observer` only to leaf components for best performance

---

## API Reference 📖

| API                | Description                     |
| ------------------ | ------------------------------- |
| `@ObservableClass` | Declare observable class        |
| `@watchProps`      | Watch for specified changes     |
| `@computed`        | Declare computed properties     |
| `observer`         | Create reactive Valdi component |

---

## License

MIT © [ailuoku6]

---

**Bring simplicity back to state management!** 🎉
With kiss-valdi, you can focus on business logic instead of wrestling with complex state systems. Contributions and suggestions are welcome!
