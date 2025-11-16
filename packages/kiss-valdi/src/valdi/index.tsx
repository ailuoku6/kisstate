// import { trackFun, cleanTrack } from '../store';
// import { ITrackObj } from '../types/index';

import { trackFun, cleanTrack } from 'kiss-state-core';
import { ITrackObj } from 'kiss-state-core';

let tractId = 0;

/**
 * 组件基础接口 - 不依赖具体的 Component 实现
 */
export interface IBaseComponentInterface {
    onRender?: () => void;
    onCreate?: () => void;
    onDestroy?: () => void;
    setState?: (state: any) => void;
    requestUpdate?: () => void;
    forceUpdate?: () => void;
}

export type IBaseComponent<T extends IBaseComponentInterface = IBaseComponentInterface> = {
    new(...args: any[]): T;
};

/**
 * 组件构造函数类型
 */
type ComponentConstructor<T extends IBaseComponent = IBaseComponent> = new (...args: unknown[]) => T;

/**
 * 组件类原型接口
 */
interface ComponentPrototype {
    onRender?: () => void;
    onCreate?: () => void;
    onDestroy?: () => void;
}

/**
 * 组件类接口（包含静态属性）
 */
interface ComponentClass {
    displayName?: string;
    name?: string;
    prototype: ComponentPrototype;
}

/**
 * Valdi Observer 配置
 */
export interface ValdiObserverConfig<
    TComponent extends IBaseComponent = IBaseComponent,
    TStatefulComponent extends IBaseComponent = IBaseComponent
> {
    /**
     * Component 基类构造函数
     */
    // Component: new (...args: unknown[]) => TComponent;
    Component: TComponent,
    /**
     * StatefulComponent 基类构造函数
     */
    // StatefulComponent: new (...args: unknown[]) => TStatefulComponent;
    StatefulComponent: TStatefulComponent;
}

/**
 * 类组件类型（构造函数和类的结合）
 */
type ClassComponent<T extends IBaseComponent = IBaseComponent> = ComponentConstructor<T> & ComponentClass;

/**
 * 判断是否为类组件（使用注入的 Component 和 StatefulComponent）
 */
function createIsClassComponent<
    TComponent extends IBaseComponent,
    TStatefulComponent extends IBaseComponent
>(config: ValdiObserverConfig<TComponent, TStatefulComponent>) {
    return (Comp: unknown): Comp is ClassComponent => {
        if (typeof Comp !== 'function') {
            return false;
        }
        return (
            Object.prototype.isPrototypeOf.call(config.Component, Comp) ||
            Object.prototype.isPrototypeOf.call(config.StatefulComponent, Comp) ||
            !!(Comp as ComponentClass).prototype?.onRender
        );
    };
}

/**
 * 创建 Valdi Observer 函数
 * 
 * @example
 * ```typescript
 * import { Component, StatefulComponent } from 'valdi_core/src/Component';
 * import { createValdiObserver } from 'kiss_valdi/src/valdi/index';
 * 
 * const observer = createValdiObserver({
 *   Component,
 *   StatefulComponent,
 * });
 * 
 * export class MyComponent extends StatefulComponent<MyViewModel, MyContext> {
 *   onRender() {
 *     // 访问响应式变量时会自动收集依赖
 *     <view>
 *       <label value={this.viewModel.name} />
 *     </view>;
 *   }
 * }
 * 
 * export const ObservedMyComponent = observer(MyComponent);
 * ```
 */
export function createValdiObserver<
    TComponent extends IBaseComponent = IBaseComponent,
    TStatefulComponent extends IBaseComponent = IBaseComponent
>(config: ValdiObserverConfig<TComponent, TStatefulComponent>) {
    const { Component: BaseComponent, StatefulComponent: BaseStatefulComponent } = config;
    const isClassComponent = createIsClassComponent(config);

    /**
     * Valdi 组件类型定义
     */
    type IValdiComponent<ViewModel = unknown, Context = unknown> =
        | typeof BaseComponent
        | typeof BaseStatefulComponent
        | ComponentConstructor;

    /**
     * 使用此高阶函数包裹 Valdi 组件，使组件自动订阅 kisstate 状态更新
     * @template T - 组件类构造函数类型，可以是任何构造函数
     */
    function observer<T extends new (...args: any[]) => any>(ComponentClass: T): T {
        if (!isClassComponent(ComponentClass)) {
            throw new Error('observer 只能用于类组件');
        }

        const componentName =
            ComponentClass.displayName || ComponentClass.name || 'ObserverComponent';

        // 保存原始的 onRender 方法
        const originalOnRender = ComponentClass.prototype.onRender || (() => { });

        // 定义内部状态类型（用于 StatefulComponent 的 setState）
        interface InternalRenderState {
            __renderTick__?: number;
        }

        // 创建新的组件类，继承原始组件类
        class ObserverComponent extends ComponentClass {
            private trackObj: ITrackObj | null = null;
            private renderTick: number = 0;

            constructor(...args: unknown[]) {
                super(...args);

                // 创建追踪对象，用于收集依赖和触发重新渲染
                // trackObj.fn 会在依赖的响应式变量改变时被调度器调用
                this.trackObj = {
                    id: `${componentName}-${tractId++}`,
                    fn: () => this.forceRender(),
                };
            }

            onCreate(): void {
                // 调用原始的 onCreate（如果存在）
                const originalOnCreate = ComponentClass.prototype.onCreate;
                if (originalOnCreate && typeof originalOnCreate === 'function') {
                    originalOnCreate.call(this);
                }
            }

            onDestroy(): void {
                // 清理追踪，避免内存泄漏
                if (this.trackObj) {
                    cleanTrack(this.trackObj);
                    this.trackObj = null;
                }

                // 调用原始的 onDestroy（如果存在）
                const originalOnDestroy = ComponentClass.prototype.onDestroy;
                if (originalOnDestroy && typeof originalOnDestroy === 'function') {
                    originalOnDestroy.call(this);
                }
            }

            /**
             * 强制重新渲染组件
             * 当依赖的响应式变量改变时，这个方法会被调度器调用
             */
            private forceRender(): void {
                if (!this.trackObj) return;

                // 如果是 StatefulComponent，使用 setState 触发重新渲染
                if (this instanceof (BaseStatefulComponent as any)) {
                    this.renderTick = (this.renderTick || 0) + 1;
                    // 使用一个内部状态来触发重新渲染
                    const component = this;
                    if (component.setState) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (component.setState as (state: InternalRenderState) => void)({
                            __renderTick__: this.renderTick
                        });
                    }
                } else {
                    // 对于普通 Component，尝试调用可能存在的更新方法
                    const component = this;
                    if (component.requestUpdate && typeof component.requestUpdate === 'function') {
                        (component.requestUpdate as Function)();
                    } else if (component.forceUpdate && typeof component.forceUpdate === 'function') {
                        (component.forceUpdate as Function)();
                    } else {
                        // 如果没有可用的更新方法，至少记录一下警告
                        console.warn(`[observer] 组件 ${componentName} 无法触发重新渲染，请确保使用 StatefulComponent`);
                    }
                }
            }

            /**
             * 劫持 onRender 方法，用 trackFun 包装以实现依赖收集
             * 当执行 onRender 时，trackFun 会设置 globalStore.curTrackObj 为当前 trackObj
             * 这样在访问被观察对象的属性时，会自动收集依赖
             */
            onRender(): void {
                if (!this.trackObj) {
                    originalOnRender.call(this);
                    return;
                }

                // 使用 trackFun 包装 onRender，在执行时收集依赖
                // 在 onRender 执行过程中，任何对响应式对象属性的访问都会被追踪
                trackFun(() => {
                    originalOnRender.call(this);
                }, this.trackObj);
            }
        }

        // 设置组件名称用于调试
        // ObserverComponent.displayName = `observer(${componentName})`;
        // ObserverComponent.name = `observer(${componentName})`;

        // 拷贝静态属性（如静态方法、静态变量等）
        const sourceKeys = Object.keys(ComponentClass) as Array<keyof typeof ComponentClass>;
        sourceKeys.forEach((key) => {
            if (
                key !== 'prototype' &&
                key !== 'name' &&
                key !== 'length' &&
                key !== 'displayName' &&
                key !== 'caller' &&
                key !== 'arguments'
            ) {
                try {
                    const descriptor = Object.getOwnPropertyDescriptor(ComponentClass, key);
                    if (descriptor) {
                        Object.defineProperty(ObserverComponent, key, descriptor);
                    }
                } catch (e) {
                    // 忽略无法复制的属性（如只读属性等）
                }
            }
        });

        return ObserverComponent as unknown as T;
    }

    return observer;
}

