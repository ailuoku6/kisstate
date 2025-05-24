export type EffectCallback = () => void;
export declare const innerEffctWeakMap: WeakMap<object, EffectCallback[]>;
export declare const clearCallbacks: WeakMap<Function, Function[]>;
export declare const globalStore: {
    curCallBack: Function | null;
};
export declare const addClearCallbackArray: (callbackFn: Function, cleanFn: Function) => void;
export declare const cleanTrack: (callbackFn: Function) => void;
export declare const trackFun: (fn: Function, callback: Function) => any;
