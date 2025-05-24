import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { cleanTrack, trackFun } from '../store';

const useForceRender = () => {
  const [, setTick] = useState(0);
  const forceRender = useCallback(() => {
    setTick((v) => v + 1);
  }, []);

  return forceRender;
};

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
    } finally {
    }

    if (throwErr) {
      throw throwErr;
    }

    return comp;
  };

  return Hoc;
};
