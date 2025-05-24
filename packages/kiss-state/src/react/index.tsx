import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { renderEffctWeakMap, trackFun } from '../store';

const useForceRender = () => {
  const [, setTick] = useState(0);
  const forceRender = useCallback(() => {
    setTick((v) => v + 1);
  }, []);

  return forceRender;
};

// let currentEffect = null;

// const trackFun = (fn: Function, callback: Function) => {
//   const res = fn();
//   return res;
// };

export const observer = (Comp: any, ...stores: any[]) => {
  const Hoc = (props: any) => {
    const forceRender = useForceRender();

    const isClassComp =
      Object.prototype.isPrototypeOf.call(React.Component, Comp) ||
      Object.prototype.isPrototypeOf.call(React.PureComponent, Comp);

    const render = useMemo(() => {
      if (!isClassComp) {
        return (props: any) => {
          return trackFun(() => Comp(props), forceRender);
        };
      }
      const ClassComp = Comp as React.ComponentClass<any, any>;

      const { prototype } = ClassComp;

      const originalRender = prototype.render;

      prototype.render = function () {
        return trackFun(originalRender.bind(this), forceRender);
      };

      return (props: any) => <ClassComp {...props} />;
    }, [Comp, isClassComp, forceRender]);

    // TODO: fgy 这里删除，改成自动收集依赖
    // useEffect(() => {
    //   stores.forEach((store) => {
    //     const callbacks = renderEffctWeakMap.get(store) || [];
    //     callbacks.push(forceRender);
    //     renderEffctWeakMap.set(store, callbacks);
    //   });
    //   return () => {
    //     stores.forEach((store) => {
    //       const callbacks = renderEffctWeakMap.get(store) || [];
    //       const newcallbacks = callbacks.filter(
    //         (callback) => callback !== forceRender,
    //       );
    //       renderEffctWeakMap.set(store, newcallbacks);
    //     });
    //   };
    // }, [forceRender]);

    useEffect(() => {
      console.log('------------fgylog renderend!!');
    }, []);

    // 使用 useMemo 包裹组件渲染以收集依赖
    // const comp = useMemo(() => {
    //   currentEffect = forceRender;
    //   console.log('------------fgylog renderstart!');
    //   try {
    //     return Comp(props);
    //   } finally {
    //     console.log('------------fgylog renderend!');
    //     currentEffect = null; // 渲染结束后停止收集
    //   }
    // }, [props, forceRender]);

    let comp = null;
    let throwErr = null;

    // currentEffect = forceRender;
    console.log('------------fgylog renderstart!');
    try {
      comp = render(props);
    } catch (err) {
      throwErr = err;
    } finally {
      console.log('------------fgylog renderend!');
      // currentEffect = null; // 渲染结束后停止收集
    }

    if (throwErr) {
      throw throwErr;
    }

    return comp;

    // return <Comp {...props} />;
  };

  return Hoc;
};
