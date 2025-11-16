import {
  innerEffctWeakMap,
  globalStore,
  addClearCallbackArray,
  cleanTrack,
  globalStores,
} from '../store';
import { ITrackObj } from '../types/index';
import Scheduler from '../scheduler/index';

// 类型定义
// type Constructor<T = object> = new (...args: any[]) => T;

type NonMethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

type PropertyKeyOf<T> = NonMethodKeys<T> & string;

type WatchFnType = {
  methodName: string;
  deps: string[];
};

type TrackObjMapType = Map<ITrackObj, Set<string | Symbol>>;

const execEffect = (self: any) => {
  const handlers = innerEffctWeakMap.get(self) || [];
  handlers.forEach((handler) => Scheduler.add(handler));
};

const pushEffect = (self: any, trackObj: ITrackObj) => {
  const handlers = innerEffctWeakMap.get(self) || [];
  handlers.push(trackObj);
  innerEffctWeakMap.set(self, handlers);
};

const execCallbackByPropName = (
  trackObjMap: TrackObjMapType,
  propName: string,
) => {
  const trackObjs = Array.from(trackObjMap?.keys() || []).filter((trackObj) => {
    return trackObjMap.get(trackObj)?.has(propName);
  });
  // trackObjs.filter((obj) => !obj.fn).forEach((obj) => cleanTrack(obj));
  trackObjs
    .filter((obj) => obj.fn)
    .forEach((trackObj) => Scheduler.add(trackObj));
  trackObjs.filter((obj) => !obj.fn).forEach((obj) => cleanTrack(obj));
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

    const trackObjMap: TrackObjMapType = new Map<
      ITrackObj,
      Set<string | Symbol>
    >();

    (instance as any).__trackObjMap__ = trackObjMap;

    // 创建代理对象
    const proxy = new Proxy(instance, {
      set: (target, prop: string, value) => {
        const oldValue = Reflect.get(target, prop);
        const result = Reflect.set(target, prop, value);
        const hasChange = oldValue !== value;
        if (hasChange) {
          // 触发所有监听回调
          execEffect(proxy);
          execCallbackByPropName(trackObjMap, prop);
        }

        return result;
      },
      get(target, p, receiver) {
        const curTrackObj = globalStore.curTrackObj;
        if (curTrackObj) {
          const linsenSet =
            trackObjMap.get(curTrackObj) || new Set<string | Symbol>();

          linsenSet.add(p);

          trackObjMap.set(curTrackObj, linsenSet);
          addClearCallbackArray(curTrackObj, () => {
            trackObjMap.delete(curTrackObj);
          });
        }
        return Reflect.get(target, p, receiver);
      },
    });

    const watchFns = Constructor_.prototype.__watchFns__ || [];

    Constructor_.prototype.__getDebugValue__ = function (trackObj: ITrackObj) {
      const trackObjMap: TrackObjMapType = (this as any).__trackObjMap__;
      const trackPropSet = trackObjMap.get(trackObj);
      return trackPropSet?.size ? this : undefined;
    };

    const self: any = proxy;

    watchFns.forEach((watchFn: WatchFnType) => {
      let cacheValue: any[] = [];
      const handler = () => {
        // 副作用的执行放任务队列里，防止链式computed依赖多次触发
        const fn = () => {
          const newValue = watchFn.deps.map((key) => self[key]);
          const hasDiff = newValue.some(
            (value, index) => value !== cacheValue[index],
          );
          cacheValue = newValue;
          if (hasDiff) {
            self[watchFn.methodName]?.();
          }
        };
        Scheduler.add({ fn, id: `w-${watchFn.methodName}` });
      };
      const id = `w-${watchFn.methodName}`;
      pushEffect(proxy, { fn: handler, id });
    });
    execEffect(proxy);
    globalStores.push(instance);
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
 * @example ```@watchProps('age', 'name', 'nextAge')```
 */
export function watchProps<T extends object>(...props: PropertyKeyOf<T>[]) {
  return function (
    target: T,
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
 * @example ```@watchProps('age')```
 */
export function computed<T extends object>(...props: PropertyKeyOf<T>[]) {
  return function (
    _target: T,
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
            self.__trackObjMap__ as TrackObjMapType,
            methodName,
          );
        }
      };
      const id = `c-${methodName}`;
      pushEffect(self, { fn: handleEffect, id });
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

