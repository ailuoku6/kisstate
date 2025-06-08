import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ForwardedRef,
  forwardRef,
} from 'react';
import { cleanTrack, trackFun } from '../store';

const isForwardRef = (Component: any) => {
  return (
    Component.$$typeof &&
    Component.$$typeof.toString() === 'Symbol(react.forward_ref)'
  );
};

const isClassComponent = (Comp: any) => {
  return Object.prototype.isPrototypeOf.call(React.Component, Comp) ||
    Object.prototype.isPrototypeOf.call(React.PureComponent, Comp);
}

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

const EMPTY_FUNC = () => null;

/**
 * 使用此高阶函数包裹组件，使组件自动订阅kisstate状态更新
 */
export function observer<T extends IReactComponent>(Comp: T) {
  const isClassComp = isClassComponent(Comp);
  const isForward = isForwardRef(Comp);

  const componentName = (Comp as any).displayName || (Comp as any).name;

  const originalRender = isForward ? (Comp as any).render : EMPTY_FUNC;
  const classOriginalRender = isClassComp ? (Comp as any).prototype.render : EMPTY_FUNC;

  const IS_DEV = "production" !== process.env.NODE_ENV;

  const Hoc = (props: any, ref: ForwardedRef<T>) => {
    const forceRender = useForceRender();
    const [_, setIsMounted] = useState(false);

    // 兼容react严格模式
    useEffect(() => {
      IS_DEV && setIsMounted(true);
      return () => {
        IS_DEV && setIsMounted(false);
        cleanTrack(forceRender);
      };
    }, [forceRender]);

    const render = useMemo(() => {
      if (!isClassComp) {
        if (isForward) {
          return (props: any, ref_: ForwardedRef<T>) => {
            const ForwardComp = Comp as React.ForwardRefExoticComponent<T>;
            (ForwardComp as any).render = (
              props: any,
              ref: ForwardedRef<T>,
            ) => {
              console.log('fgylog forward render', componentName);
              return trackFun(() => originalRender(props, ref), forceRender);
            };
            return <ForwardComp {...props} ref={ref_} />;
          };
        }
        return (props: any) => {
          console.log('fgylog function render', componentName);
          return trackFun(
            () => (Comp as React.FunctionComponent<T>)(props),
            forceRender,
          );
        };
      }

      const ClassComp = Comp as React.ComponentClass<T, any>;
      const { prototype = {} } = ClassComp || {};

      prototype.render = function () {
        console.log('fgylog class render', componentName);
        return trackFun(classOriginalRender.bind(this), forceRender);
      };

      return (props: any) => <ClassComp {...props} />;
    }, [Comp, isClassComp, isForward, forceRender]);

    return render(props, ref);
  };

  const FinalHoc = isClassComp || !isForward ? Hoc : forwardRef(Hoc);

  if (componentName) {
    (FinalHoc as any).displayName = componentName;
  }

  return FinalHoc as T;
}
