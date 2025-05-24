export type EffectCallback = () => void;
export const renderEffctWeakMap = new WeakMap<object, EffectCallback[]>();
export const clearCallbacks = new WeakMap<Function, Array<Function>>();
// export const proxyMap = new WeakMap<object, any>(); // 缓存代理对象

export const globalStore: { curCallBack: Function | null } = {
  curCallBack: null,
};

export const addClearCallbackArray = (
  callbackFn: Function,
  cleanFn: Function,
) => {
  const clearFuns = clearCallbacks.get(callbackFn) || [];
  clearFuns.push(cleanFn);
  clearCallbacks.set(callbackFn, clearFuns);
};

export const cleanTrack = (callbackFn: Function) => {
  const clearFuns = clearCallbacks.get(callbackFn) || [];
  clearFuns.forEach((fn) => fn());
  clearCallbacks.delete(callbackFn);
};

export const trackFun = (fn: Function, callback: Function) => {
  const preCallback = globalStore.curCallBack;
  globalStore.curCallBack = callback;
  const res = fn();
  globalStore.curCallBack = preCallback;
  return res;
};
