import { ITrackObj } from './types';

export type EffectCallback = () => void;
export const innerEffctWeakMap = new WeakMap<object, EffectCallback[]>();
export const clearCallbacks = new WeakMap<ITrackObj, Array<Function>>();
// export const proxyMap = new WeakMap<object, any>(); // 缓存代理对象

export const globalStore: { curTrackObj: ITrackObj | null } = {
  curTrackObj: null,
};

export const addClearCallbackArray = (
  callbackFn: ITrackObj,
  cleanFn: Function,
) => {
  const clearFuns = clearCallbacks.get(callbackFn) || [];
  clearFuns.push(cleanFn);
  clearCallbacks.set(callbackFn, clearFuns);
};

export const cleanTrack = (trackObj: ITrackObj) => {
  const clearFuns = clearCallbacks.get(trackObj) || [];
  clearFuns.forEach((fn) => fn());
  clearCallbacks.delete(trackObj);
};

export const trackFun = (fn: Function, trackObj: ITrackObj) => {
  const preCallback = globalStore.curTrackObj;
  globalStore.curTrackObj = trackObj;
  let res = null;
  let error = null;
  try {
    res = fn();
  } catch (err) {
    error = err;
    cleanTrack(trackObj);
  } finally {
    globalStore.curTrackObj = preCallback;
  }
  if (error) {
    throw error;
  }
  return res;
};
