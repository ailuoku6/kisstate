import {
  innerEffctWeakMap,
  globalStore,
  addClearCallbackArray,
  EffectCallback,
} from '../store';

// 类型定义
type Constructor<T = object> = new (...args: any[]) => T;
type PropertyKeyOf<T> = keyof T & string;

type WatchFnType = {
  methodName: string;
  deps: string[];
};

type CallbackMapType = Map<Function, Set<string | Symbol>>;

const execEffect = (self: any) => {
  const handlers = innerEffctWeakMap.get(self) || [];
  handlers.forEach((handler) => handler());
};

const execCallbackByPropName = (
  callbackMap: CallbackMapType,
  propName: string,
) => {
  (callbackMap?.keys() || [])
    .filter((callbackhandler) => {
      return callbackMap.get(callbackhandler)?.has(propName);
    })
    .forEach((handler) => handler?.());
};

const pushEffect = (self: any, handleEffect: EffectCallback) => {
  const handlers = innerEffctWeakMap.get(self) || [];
  handlers.push(handleEffect);
  innerEffctWeakMap.set(self, handlers);
};

/**
 * 类装饰器：使类变为可观察对象
 * @example
 * ```
 * @ObservableClass
 * class User {
 *   name = 'jude';
 *   age = 26;
 *   constructor() {}
 * }
 * ```
 */
export function ObservableClass<T extends new (...args: any[]) => object>(
  Constructor_: T,
) {
  const NewConstructor = function (...args: any[]) {
    // 正确使用 new 调用原始构造函数
    const instance = new Constructor_(...args);

    const callbackMap: CallbackMapType = new Map<
      Function,
      Set<string | Symbol>
    >();

    (instance as any).__callbackMap__ = callbackMap;

    // 创建代理对象
    const proxy = new Proxy(instance, {
      set: (target, prop: string, value) => {
        const oldValue = Reflect.get(target, prop);
        const result = Reflect.set(target, prop, value);
        const hasChange = oldValue !== value;
        if (hasChange) {
          // 触发所有监听回调
          execEffect(proxy);
          execCallbackByPropName(callbackMap, prop);
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

    const watchFns = Constructor_.prototype.__watchFns__ || [];

    const self: any = proxy;

    watchFns.forEach((watchFn: WatchFnType) => {
      let cacheValue: any[] = [];
      const handler = () => {
        // 副作用的执行放宏任务里，防止链式computed依赖多次触发
        setTimeout(() => {
          const newValue = watchFn.deps.map((key) => self[key]);
          const hasDiff = newValue.some(
            (value, index) => value !== cacheValue[index],
          );
          cacheValue = newValue;
          if (hasDiff) {
            self[watchFn.methodName]?.();
          }
        }, 0);
      };
      pushEffect(proxy, handler);
    });
    execEffect(proxy);
    return proxy; // 替换为代理对象
  };

  // 设置原型链以继承原始类的方法
  NewConstructor.prototype = Object.create(Constructor_.prototype);
  NewConstructor.prototype.constructor = NewConstructor;

  // 拷贝静态属性（可选）
  Object.assign(NewConstructor, Constructor_);

  return NewConstructor as unknown as T;
}

/**
 * 副作用函数装饰器，属性变化时触发副作用执行
 * @example ```@watchProps<User>('age', 'name', 'nextAge')```
 */
export function watchProps<T extends object>(...props: PropertyKeyOf<T>[]) {
  return function <C extends T>(
    target: C,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (typeof descriptor.value !== 'function') {
      throw new Error('@WatchProps can only decorate methods');
    }

    const watchFns = (target as any).__watchFns__ || [];
    watchFns.push({
      methodName,
      deps: props,
    });

    (target as any).__watchFns__ = watchFns;
  };
}

/**
 * computed 属性装饰器，依赖的属性发生变化，则触发此getter重新执行，否则返回cache结果
 * @example ```@watchProps<User>('age')```
 */
export function computed<T extends object>(...props: PropertyKeyOf<T>[]) {
  return function <C extends T>(
    target: C,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    if (typeof descriptor.get !== 'function') {
      throw new Error('@computed can only decorate methods');
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

          // 触发computed副作用
          execEffect(self);
          execCallbackByPropName(
            self.__callbackMap__ as CallbackMapType,
            methodName,
          );
        }
      };
      pushEffect(self, handleEffect);
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
