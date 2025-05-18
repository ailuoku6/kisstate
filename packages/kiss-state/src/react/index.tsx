import React, { useState, useEffect, useCallback } from 'react';

import { renderEffctWeakMap } from '../store';

const useForceRender = () => {
  const [, setRandom] = useState(0);
  const forceRender = useCallback(() => {
    setRandom((v) => v + 1);
  }, []);

  return forceRender;
};

export const observer = (Comp: any, ...stores: any[]) => {
  const Hoc = (props: any) => {
    const forceRender = useForceRender();

    useEffect(() => {
      stores.forEach((store) => {
        const callbacks = renderEffctWeakMap.get(store) || [];
        callbacks.push(forceRender);
        renderEffctWeakMap.set(store, callbacks);
      });
      return () => {
        stores.forEach((store) => {
          const callbacks = renderEffctWeakMap.get(store) || [];
          const newcallbacks = callbacks.filter(
            (callback) => callback !== forceRender,
          );
          renderEffctWeakMap.set(store, newcallbacks);
        });
      };
    }, [forceRender]);

    return <Comp {...props} />;
  };

  return Hoc;
};
