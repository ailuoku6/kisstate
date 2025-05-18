export type EffectCallback = () => void;
export const renderEffctWeakMap = new WeakMap<object, EffectCallback[]>();
// export const proxyMap = new WeakMap<object, any>(); // 缓存代理对象
