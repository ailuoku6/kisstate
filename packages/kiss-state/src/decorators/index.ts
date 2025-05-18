import { renderEffctWeakMap } from '../store';

type WatchFnType = {
  methodName: string;
  deps: string[];
};

// 类装饰器：使类变为可观察对象
export function ObservableClass<T extends new (...args: any[]) => object>(
  constructor: T,
) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);

      // 创建代理对象
      const proxy = new Proxy(this, {
        set: (target, prop: string, value) => {
          // const oldValue = Reflect.get(target, prop);
          const result = Reflect.set(target, prop, value);

          // 触发所有监听回调
          const handlers = renderEffctWeakMap.get(proxy) || [];
          handlers.forEach((handler) => handler());

          return result;
        },
      });

      // proxyMap.set(this, proxy); // 缓存原始实例与代理的关系
      const watchFns = constructor.prototype.__watchFns || [];

      const self = proxy;

      watchFns.forEach((watchFn: WatchFnType) => {
        let cacheValue: any[] = [];
        const handler = () => {
          const newValue = watchFn.deps.map((key) => self[key]);
          const hasDiff = newValue.some(
            (value, index) => value !== cacheValue[index],
          );
          cacheValue = newValue;
          if (hasDiff) {
            self[watchFn.methodName]?.();
          }
        };
        const handlers = renderEffctWeakMap.get(proxy) || [];

        handlers.push(handler);
        renderEffctWeakMap.set(proxy, handlers);
      });

      const handlers = renderEffctWeakMap.get(proxy) || [];
      handlers.forEach((handler) => handler());
      return proxy; // 替换为代理对象
    }
  };
}

// 类型定义
type Constructor<T = object> = new (...args: any[]) => T;
type PropertyKeyOf<T> = keyof T & string;

// 装饰器工厂：强约束属性名必须是目标类的属性
export function watchProps<T extends object>(...props: PropertyKeyOf<T>[]) {
  return function <C extends T>(
    target: C,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (typeof descriptor.value !== 'function') {
      throw new Error('@WatchProps 只能装饰方法');
    }

    const watchFns = target.__watchFns || [];
    watchFns.push({
      methodName,
      deps: props,
    });

    target.__watchFns = watchFns;
  };
}

export function computed<T extends object>(...props: PropertyKeyOf<T>[]) {
  return function <C extends T>(
    target: C,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (typeof descriptor.get !== 'function') {
      throw new Error('@computed 只能装饰方法');
    }

    const originFn = descriptor.get;
    let isDirty = true;
    let cache: any = null;
    let isFirstCall = true;
    let cacheValue: any[] = [];

    const watcher = (self) => {
      // 变化后对数据进行标脏
      const handleEffect = () => {
        const deps = props;
        const newValue = deps.map((key) => self[key]);
        const hasDiff = newValue.some(
          (value, index) => value !== cacheValue[index],
        );
        cacheValue = newValue;
        if (hasDiff) {
          isDirty = true;
        }
      };

      const handlers = renderEffctWeakMap.get(self) || [];
      handlers.push(handleEffect);
      renderEffctWeakMap.set(self, handlers);
    };

    descriptor.get = function () {
      if (isFirstCall) {
        isFirstCall = false;
        watcher(this);
      }
      if (!isDirty) {
        return cache;
      }
      cache = originFn.call(this);
      isDirty = false;
      return cache;
    };
  };
}
