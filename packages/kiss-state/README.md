# kisstate

[English Version](./README_EN.md)

**kisstate** 是一个遵循 KISS（Keep It Simple, Stupid）原则的轻量级状态管理库，专为 React 应用设计。通过简洁的装饰器和响应式设计，帮助开发者轻松管理组件状态，告别复杂的状态逻辑。

---

## 特性 ✨

- **极简 API**：通过装饰器快速声明可观察对象、计算属性和监听器
- **React 深度集成**：通过 `observer` HOC 实现组件自动响应
- **零配置**：开箱即用，无需复杂配置

---

## 安装 📦

```bash
npm install kisstate
# 或
yarn add kisstate
```

---

## 核心概念 🧠

### 1. Observable Class

使用 `@ObservableClass` 装饰器声明可观察类：

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

### 2. 属性监听

使用 `@watchProps` 监听特定属性变化：

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

### 3. 计算属性

使用 `@computed` 声明自动更新的计算属性：

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

### 4. React 组件绑定

使用 `observer` HOC 连接 React 组件：

```typescript
const HocApp = observer(App);
```

### 5. 注意事项📢

kisstate不会递归地深度监听子Object和Array，如需变更及触发副作用，请通过解构实现

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
    // 注意：这里必须解构赋值，否则不会触发依赖更新
    this.skill = [...this.skill];
  }

  setWalletContent(key: string, value: any) {
    this.wallet[key] = value;
    // 注意：这里必须解构赋值，否则不会触发依赖更新
    this.wallet = { ...this.wallet };
  }
}
```

---

## 完整示例 🚀

```typescript
import { ObservableClass, watchProps, observer, computed } from 'kisstate';

// 1. 声明可观察类
@ObservableClass
class User {
  name = 'jude';
  age = 26;
  skill: string[] = [];
  wallet: any = {};

  constructor() {
    this.age = 17;
  }

  setSkill(skill: string[]) {
    this.skill = skill;
  }

  addSkill(skill: string) {
    this.skill.push(skill);
    // 注意：这里必须解构赋值，否则不会触发依赖更新
    this.skill = [...this.skill];
  }

  setWalletContent(key: string, value: any) {
    this.wallet[key] = value;
    // 注意：这里必须解构赋值，否则不会触发依赖更新
    this.wallet = { ...this.wallet };
  }

  // 2. 属性变化监听
  @watchProps('age')
  onAgeChange() {
    console.log('Age changed:', this.age);
  }

  // 3. 计算属性
  @computed('age')
  get nextAge() {
    return this.age + 1;
  }

  @computed('nextAge')
  get nextnextAge() {
    return this.nextAge + 1;
  }
}

// 4. 创建状态实例
const user = new User();

// 5. React 组件
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

// 6. 绑定状态观察
export default observer(App);
```

---

## 工作原理 🔧

1. **响应式系统**：通过 Proxy 实现属性访问追踪
2. **批量更新**：状态变更后自动触发相关组件更新

---

## 最佳实践 ✅

1. **单一数据源**：为每个领域模型创建独立的 Observable Class
2. **细粒度监听**：按业务需求拆分监听器
3. **计算属性缓存**：自动缓存计算结果，避免重复计算
4. **组件分层**：仅在叶子组件使用 `observer` 进行优化

---

## API 文档 📖

| API                | 说明                  |
| ------------------ | --------------------- |
| `@ObservableClass` | 声明可观察类          |
| `@watchProps`      | 监听指定属性变化      |
| `@computed`        | 声明计算属性          |
| `observer`         | 创建响应式 React 组件 |

---

## License

MIT © [ailuoku6]

---

**让状态管理回归简单！** 🎉  
通过 kisstate，您可以专注于业务逻辑而不是状态管理框架的复杂性。欢迎贡献代码和提出建议！
