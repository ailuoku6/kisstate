export type EffectCallback = () => void;
export const renderEffctWeakMap = new WeakMap<object, EffectCallback[]>();
// export const proxyMap = new WeakMap<object, any>(); // 缓存代理对象

export const globalStore: { curCallBack: Function | null } = {
  curCallBack: null,
};

export const trackFun = (fn: Function, callback: Function) => {
  const preCallback = globalStore.curCallBack;
  globalStore.curCallBack = callback;
  const res = fn();
  globalStore.curCallBack = preCallback;
  return res;
};
