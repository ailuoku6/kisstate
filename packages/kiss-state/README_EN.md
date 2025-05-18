# kisstate

**kisstate** is a lightweight state management library following the KISS (Keep It Simple, Stupid) principle, designed specifically for React applications. Through concise decorators and reactive design, it helps developers easily manage component states without complex state logic.

---

## Features ✨

- **Minimal API**: Quickly declare observables, computed properties, and watchers via decorators
- **Deep React Integration**: Automatic component reactivity through `observer` HOC
- **Zero Configuration**: Works out-of-the-box with no complex setup

---

## Installation 📦

```bash
npm install kisstate
# or
yarn add kisstate
```

---

## Core Concepts 🧠

### 1. Observable Class

Declare observable classes using `@ObservableClass` decorator:

```typescript
import { ObservableClass } from 'kisstate';

@ObservableClass
class User {
  name = 'jude';
  age = 26;

  constructor() {
    this.age = 17;
  }
}
```

### 2. Property Observation

Watch specific property changes with `@watchProps`:

```typescript
@watchProps<User>('age')
onAgeChange() {
  console.log('age changed:', this.age);
}

@watchProps<User>('name')
onNameChange() {
  console.log('name changed:', this.name);
}
```

### 3. Computed Properties

Declare auto-updating computed properties with `@computed`:

```typescript
@computed<User>('age')
get nextAge() {
  return this.age + 1;
}

@computed<User>('nextAge')
get nextnextAge() {
  return this.nextAge + 1;
}
```

### 4. React Component Binding

Connect React components using `observer` HOC:

```typescript
const HocApp = observer(App, user);
```

---

## Complete Example 🚀

```typescript
import { ObservableClass, watchProps, observer, computed } from 'kisstate';

// 1. Declare observable class
@ObservableClass
class User {
  name = 'jude';
  age = 26;

  constructor() {
    this.age = 17;
  }

  // 2. Property change observation
  @watchProps<User>('age')
  onAgeChange() {
    console.log('Age changed:', this.age);
  }

  // 3. Computed properties
  @computed<User>('age')
  get nextAge() {
    return this.age + 1;
  }

  @computed<User>('nextAge')
  get nextnextAge() {
    return this.nextAge + 1;
  }
}

// 4. Create state instance
const user = new User();

// 5. React component
function App() {
  return (
    <div className="card">
      <button onClick={() => user.age++}>
        Current age: {user.age}
      </button>
      <p>Next year: {user.nextAge}</p>
      <p>After next year: {user.nextnextAge}</p>
    </div>
  );
}

// 6. Bind state observation
export default observer(App, user);
```

---

## How It Works 🔧

1. **Reactive System**: Implements property access tracking through Proxy
2. **Batch Updates**: Automatically triggers related component updates after state changes

---

## Best Practices ✅

1. **Single Source of Truth**: Create independent Observable Classes for each domain model
2. **Fine-grained Observation**: Split watchers according to business needs
3. **Computed Property Caching**: Automatic result caching to avoid recomputation
4. **Component Layering**: Use `observer` only on leaf components for optimization

---

## API Documentation 📖

| API                | Description                      |
| ------------------ | -------------------------------- |
| `@ObservableClass` | Declares an observable class     |
| `@watchProps`      | Watches specified properties     |
| `@computed`        | Declares computed properties     |
| `observer`         | Creates reactive React component |

---

## License

MIT © [ailuoku6]

---

**Make state management simple again!** 🎉  
With kisstate, focus on business logic instead of state management complexities. Contributions and suggestions are welcome!
