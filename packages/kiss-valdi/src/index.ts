// 导出核心功能（从 kiss-state-core）
export { ObservableClass, watchProps, computed } from 'kiss-state-core';
// 导出 Valdi 相关功能
export {
  createValdiObserver,
  type ValdiObserverConfig,
  type IBaseComponent,
} from './valdi/index';
