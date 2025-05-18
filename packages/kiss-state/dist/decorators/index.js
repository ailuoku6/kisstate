var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { renderEffctWeakMap, proxyMap } from '../core/store';
// 类装饰器：使类变为可观察对象
export function ObservableClass(constructor) {
    return /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.apply(this, args) || this;
            // 创建代理对象
            var proxy = new Proxy(_this, {
                set: function (target, prop, value) {
                    var oldValue = Reflect.get(target, prop);
                    var result = Reflect.set(target, prop, value);
                    // 触发所有监听回调
                    var handlers = renderEffctWeakMap.get(proxy) || [];
                    handlers.forEach(function (handler) { return handler(); });
                    return result;
                },
            });
            proxyMap.set(_this, proxy); // 缓存原始实例与代理的关系
            return proxy; // 替换为代理对象
        }
        return class_1;
    }(constructor));
}
// 装饰器工厂：强约束属性名必须是目标类的属性
export function watchProps() {
    var props = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        props[_i] = arguments[_i];
    }
    return function (target, methodName, descriptor) {
        if (typeof descriptor.value !== 'function') {
            throw new Error('@WatchProps 只能装饰方法');
        }
        var cacheValue = [];
        var handler = function () {
            var _a;
            var newValue = props.map(function (key) { return target[key]; });
            var hasDiff = newValue.some(function (value, index) { return value !== cacheValue[index]; });
            cacheValue = newValue;
            if (hasDiff) {
                // target[methodName]?.();
                (_a = descriptor.value) === null || _a === void 0 ? void 0 : _a.call(target);
            }
        };
        var handlers = renderEffctWeakMap.get(target) || [];
        handlers.push(handler);
        renderEffctWeakMap.set(target, handlers);
        // // 存储监听的属性和方法
        // const metadataKey = Symbol('watchPropsMetadata');
        // const metadata: Array<{
        //   props: PropertyKeyOf<T>[];
        //   handler: M;
        // }> = Reflect.getMetadata(metadataKey, target) || [];
        // metadata.push({
        //   props: [...props],
        //   handler: descriptor.value,
        // });
        // Reflect.defineMetadata(metadataKey, metadata, target);
        // // 如果类未被代理，创建代理
        // if (!target.prototype.__isProxied) {
        //   const originalConstructor = target.prototype.constructor;
        //   const newConstructor = function (...args: any[]) {
        //     const instance = new originalConstructor(...args);
        //     const proxy = new Proxy(instance, {
        //       set: (target, prop: string, value) => {
        //         const oldValue = Reflect.get(target, prop);
        //         const result = Reflect.set(target, prop, value);
        //         // 触发监听方法
        //         const handlers =
        //           Reflect.getMetadata(metadataKey, target.constructor) || [];
        //         handlers.forEach(({ props, handler }) => {
        //           if (props.includes(prop as PropertyKeyOf<T>)) {
        //             handler.call(proxy, prop, value, oldValue);
        //           }
        //         });
        //         return result;
        //       },
        //     });
        //     return proxy;
        //   };
        //   // 替换原构造函数
        //   target.prototype.constructor = newConstructor;
        //   target.prototype.__isProxied = true;
        // }
    };
}
