import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ForwardedRef,
  forwardRef,
  useRef,
  useDebugValue,
} from 'react';
import { getValues, trackFun } from '../store';
import { ITrackObj } from '../types';

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

let tractId = 0;

const useKissDebug = (trackObj: ITrackObj) => {
  useDebugValue(trackObj, (trackObj) => getValues(trackObj));
}

const useTrackObj = (renderFn: Function) => {
  const trackObjRef = useRef<ITrackObj>({ fn: renderFn, id: `R-${tractId++}` });

  useEffect(() => {
    trackObjRef.current.fn = renderFn;
    return () => {
      trackObjRef.current.fn = null;
    };
  }, [renderFn]);

  useKissDebug(trackObjRef.current);

  return trackObjRef.current;
}

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

  // const IS_DEV = "production" !== process.env.NODE_ENV;

  const Hoc = (props: any, ref: ForwardedRef<T>) => {
    const forceRender = useForceRender();
    // const [_, setIsMounted] = useState(false);

    const trackObj = useTrackObj(forceRender);

    // 兼容react严格模式
    // useEffect(() => {
    //   IS_DEV && setIsMounted(true);
    //   return () => {
    //     IS_DEV && setIsMounted(false);
    //     cleanTrack(forceRender);
    //   };
    // }, [forceRender]);

    const render = useMemo(() => {
      if (!isClassComp) {
        if (isForward) {
          return (props: any, ref_: ForwardedRef<T>) => {
            const ForwardComp = Comp as React.ForwardRefExoticComponent<T>;
            (ForwardComp as any).render = (
              props: any,
              ref: ForwardedRef<T>,
            ) => {
              return trackFun(() => originalRender(props, ref), trackObj);
            };
            return <ForwardComp {...props} ref={ref_} />;
          };
        }
        return (props: any) => {
          return trackFun(
            () => (Comp as React.FunctionComponent<T>)(props),
            trackObj,
          );
        };
      }

      const ClassComp = Comp as React.ComponentClass<T, any>;
      const { prototype = {} } = ClassComp || {};

      prototype.render = function () {
        return trackFun(classOriginalRender.bind(this), trackObj);
      };

      return (props: any) => <ClassComp {...props} />;
    }, [Comp, isClassComp, isForward, trackObj]);

    return render(props, ref);
  };

  const FinalHoc = isClassComp || !isForward ? Hoc : forwardRef(Hoc);

  if (componentName) {
    (FinalHoc as any).displayName = componentName;
  }

  return FinalHoc as T;
}
