import React from 'react';
export type IReactComponent<P = any> = React.ComponentClass<P> | React.FunctionComponent<P> | React.ForwardRefExoticComponent<P> | React.Component<P>;
/**
 * 使用此高阶函数包裹组件，使组件自动订阅kisstate状态更新
 */
export declare function observer<T extends IReactComponent>(Comp: T): T;
