# kiss-valdi

[English Version](./README_EN.md)

**kiss-valdi** 是一个遵循 KISS（Keep It Simple, Stupid）原则的轻量级状态管理库，专为 Valdi 应用设计。通过简洁的装饰器和响应式设计，帮助开发者轻松管理组件状态，告别复杂的状态逻辑。

---

## 特性 ✨

- **极简 API**：通过装饰器快速声明可观察对象、计算属性和监听器
- **Valdi 深度集成**：通过 `observer` HOC 实现组件自动响应
- **零配置**：开箱即用，无需复杂配置

---

## 安装 📦

```bash
npm install kiss-valdi
# 或
yarn add kiss-valdi
```

---

## 核心概念 🧠

### 1. Observable Class

使用 `@ObservableClass` 装饰器声明可观察类：

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

### 4. Valdi 组件绑定

使用 `observer` HOC 连接 Valdi 组件：

```typescript
const HocApp = observer(App);
```

### 5. 注意事项📢

kiss-valdi不会递归地深度监听子Object和Array，如需变更及触发副作用，请通过解构实现

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
import { ObservableClass, watchProps, computed, createValdiObserver } from 'kiss-valdi';

import { Component, StatefulComponent } from 'valdi_core/src/Component';

/**
 * 配置好的 observer 函数，供项目中使用
 * 通过工厂函数注入 Component 和 StatefulComponent，使 kiss-valdi 库不依赖 valdi_core
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

/**
 * @ViewModel
 * @ExportModel
 */
export interface AppViewModel { }

/**
 * @Context
 * @ExportModel
 */
export interface AppComponentContext { }

interface State {
  hotReloaderConnected: boolean;
}

/**
 * @Component
 * @ExportModel
 */
export class App1 extends StatefulComponent<AppViewModel, AppComponentContext> implements IDaemonClientManagerListener {
  state: State = { hotReloaderConnected: false };

  onCreate(): void {
    console.log('On App create!');
    getDaemonClientManager().addListener(this);
  }

  onDestroy(): void {
    console.log('On App destroy!');
    getDaemonClientManager().removeListener(this);
  }

  onAvailabilityChanged(available: boolean): void {
    this.setState({ hotReloaderConnected: available });
  }

  onRender(): void {
    console.log('On App render!');
    <view style={styles.main}>
      <image style={styles.logo} src={res.valdi} onTap={() => AppStoreTest1.age++} />
      <layout padding={20}>
        <label style={styles.title} value={`Welcome to Valdi fgy fgy5!`} />
      </layout>
      <layout padding={20}>

        <label style={styles.title} value={`${AppStoreTest1.name} ${AppStoreTest1.age2}`} />
      </layout>
      <label style={styles.subtitle} value={this.renderLabel()} />
    </view>;
  }

  private renderLabel(): AttributedText {
    const textBuilder = new AttributedTextBuilder();

    textBuilder.appendText('This is currently running on ');
    textBuilder.appendStyled({
      content: this.getPlatformString(),
      attributes: {
        color: 'red',
        font: systemBoldFont(20),
      },
    });

    textBuilder.appendText('\nHot reloader ');
    if (this.state.hotReloaderConnected) {
      textBuilder.appendStyled({
        content: 'connected',
        attributes: {
          color: 'green',
          font: systemBoldFont(20),
        },
      });
    } else {
      textBuilder.appendStyled({
        content: 'disconnected',
        attributes: {
          color: 'red',
          font: systemBoldFont(20),
        },
      });
    }

    return textBuilder.build();
  }

  private getPlatformString(): string {
    if (Device.isDesktop()) {
      return 'Desktop';
    } else if (Device.isIOS()) {
      return 'iOS';
    } else if (Device.isAndroid()) {
      return 'Android';
    } else {
      return 'Unknown';
    }
  }
}

export const App = observer(App1);

const styles = {
  main: new Style<View>({
    backgroundColor: 'white',
    justifyContent: 'center',
  }),
  logo: new Style<ImageView>({
    width: 80,
    height: 80,
    alignSelf: 'center',
    borderRadius: 16,
    boxShadow: '0 0 3 rgba(0, 0, 0, 0.15)',
  }),
  title: new Style<Label>({
    color: 'black',
    font: systemBoldFont(24),
    accessibilityCategory: 'header',
    alignSelf: 'center',
  }),

  subtitle: new Style<Label>({
    alignSelf: 'center',
    color: 'black',
    font: systemFont(20),
    numberOfLines: 0,
    textAlign: 'center',
  }),
};
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
| `observer`         | 创建响应式 Valdi 组件 |

---

## License

MIT © [ailuoku6]

---

**让状态管理回归简单！** 🎉  
通过 kiss-valdi，您可以专注于业务逻辑而不是状态管理框架的复杂性。欢迎贡献代码和提出建议！
