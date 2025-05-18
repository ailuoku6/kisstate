type PropertyKeyOf<T> = keyof T & string;
export declare function ObservableClass<T extends new (...args: any[]) => object>(Constructor_: T): T;
export declare function watchProps<T extends object>(...props: PropertyKeyOf<T>[]): <C extends T>(target: C, methodName: string, descriptor: PropertyDescriptor) => void;
export declare function computed<T extends object>(...props: PropertyKeyOf<T>[]): <C extends T>(target: C, methodName: string, descriptor: PropertyDescriptor) => void;
export {};
