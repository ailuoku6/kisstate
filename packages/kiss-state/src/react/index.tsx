import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cleanTrack, trackFun } from '../store';

export type IReactComponent<P = any> =
  | React.ComponentClass<P>
  | React.FunctionComponent<P>
  | React.ForwardRefExoticComponent<P>
  | React.Component<P>;

const useForceRender = () => {
  const [, setTick] = useState(0);
  const forceRender = useCallback(() => {
    setTick((v) => v + 1);
  }, []);

  return forceRender;
};

/**
 * 使用此高阶函数包裹组件，使组件自动订阅kisstate状态更新
 */
export function observer<T extends IReactComponent>(Comp: T) {
  const Hoc = (props: any) => {
    const forceRender = useForceRender();

    const isClassComp =
      Object.prototype.isPrototypeOf.call(React.Component, Comp) ||
      Object.prototype.isPrototypeOf.call(React.PureComponent, Comp);

    const render = useMemo(() => {
      if (!isClassComp) {
        return (props: any) => {
          return trackFun(
            () => (Comp as React.FunctionComponent)(props),
            forceRender,
          );
        };
      }
      const ClassComp = Comp as React.ComponentClass<T, any>;

      const { prototype } = ClassComp;

      const originalRender = prototype.render;

      prototype.render = function () {
        return trackFun(originalRender.bind(this), forceRender);
      };

      return (props: any) => <ClassComp {...props} />;
    }, [Comp, isClassComp, forceRender]);

    useEffect(() => {
      return () => {
        cleanTrack(forceRender);
      };
    }, [forceRender]);

    let comp = null;
    let throwErr = null;

    try {
      comp = render(props);
    } catch (err) {
      throwErr = err;
    }

    if (throwErr) {
      throw throwErr;
    }

    return comp;
  };

  return Hoc as T;
}
