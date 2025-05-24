export type EffectCallback = () => void;
export declare const renderEffctWeakMap: WeakMap<object, EffectCallback[]>;
export declare const globalStore: {
    curCallBack: Function | null;
};
export declare const trackFun: (fn: Function, callback: Function) => any;
