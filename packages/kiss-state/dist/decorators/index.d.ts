type NonMethodKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];
type PropertyKeyOf<T> = NonMethodKeys<T> & string;
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
export declare function ObservableClass<T extends new (...args: any[]) => object>(Constructor_: T): T;
/**
 * 副作用函数装饰器，属性变化时触发副作用执行
 * @example ```@watchProps('age', 'name', 'nextAge')```
 */
export declare function watchProps<T extends object>(...props: PropertyKeyOf<T>[]): (target: T, methodName: string, descriptor: PropertyDescriptor) => void;
/**
 * computed 属性装饰器，依赖的属性发生变化，则触发此getter重新执行，否则返回cache结果
 * @example ```@watchProps('age')```
 */
export declare function computed<T extends object>(...props: PropertyKeyOf<T>[]): (_target: T, methodName: string, descriptor: PropertyDescriptor) => void;
export {};
