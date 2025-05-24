import {
  renderEffctWeakMap,
  globalStore,
  addClearCallbackArray,
} from '../store';

// 类型定义
type Constructor<T = object> = new (...args: any[]) => T;
type PropertyKeyOf<T> = keyof T & string;

type WatchFnType = {
  methodName: string;
  deps: string[];
};

// 类装饰器：使类变为可观察对象
export function ObservableClass<T extends new (...args: any[]) => object>(
  Constructor_: T,
) {
  const NewConstructor = function (...args: any[]) {
    // 正确使用 new 调用原始构造函数
    const instance = new Constructor_(...args);

    const callbackMap = new Map<Function, Set<string | Symbol>>();

    // 创建代理对象
    const proxy = new Proxy(instance, {
      set: (target, prop: string, value) => {
        const oldValue = Reflect.get(target, prop);
        const result = Reflect.set(target, prop, value);
        const hasChange = oldValue !== value;
        if (hasChange) {
          // 触发所有监听回调
          const handlers = renderEffctWeakMap.get(proxy) || [];
          handlers.forEach((handler) => handler());

          callbackMap
            .keys()
            .filter((callbackhandler) => {
              return callbackMap.get(callbackhandler)?.has(prop);
            })
            .forEach((handler) => handler?.());
        }

        return result;
      },
      get(target, p, receiver) {
        const curCallBack = globalStore.curCallBack;
        if (curCallBack) {
          const linsenSet =
            callbackMap.get(curCallBack) || new Set<string | Symbol>();

          linsenSet.add(p);

          callbackMap.set(curCallBack, linsenSet);
          addClearCallbackArray(curCallBack, () => {
            callbackMap.delete(curCallBack);
          });
        }
        return Reflect.get(target, p, receiver);
      },
    });

    const watchFns = Constructor_.prototype.__watchFns || [];

    const self: any = proxy;

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
  };

  // 设置原型链以继承原始类的方法
  NewConstructor.prototype = Object.create(Constructor_.prototype);
  NewConstructor.prototype.constructor = NewConstructor;

  // 拷贝静态属性（可选）
  Object.assign(NewConstructor, Constructor_);

  return NewConstructor as unknown as T;
}

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

    const watchFns = (target as any).__watchFns || [];
    watchFns.push({
      methodName,
      deps: props,
    });

    (target as any).__watchFns = watchFns;
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

    const watcher = (self: any) => {
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
          cache = originFn.call(self);
          isDirty = false;
          const handlers = renderEffctWeakMap.get(self) || [];
          handlers.forEach((handler) => handler());
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
