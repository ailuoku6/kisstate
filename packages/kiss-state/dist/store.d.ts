import { ITrackObj } from './types';
export type EffectCallback = () => void;
export declare const innerEffctWeakMap: WeakMap<object, ITrackObj[]>;
export declare const clearCallbacks: WeakMap<ITrackObj, Function[]>;
export declare const globalStores: Array<Object>;
export declare const globalStore: {
    curTrackObj: ITrackObj | null;
};
export declare const getValues: (trackObj: ITrackObj) => {};
export declare const addClearCallbackArray: (callbackFn: ITrackObj, cleanFn: Function) => void;
export declare const cleanTrack: (trackObj: ITrackObj) => void;
export declare const trackFun: (fn: Function, trackObj: ITrackObj) => any;
