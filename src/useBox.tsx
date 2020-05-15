import * as React from 'react';

import Box, { BoxEvent } from './Box';

function useBox<T1, T2 extends Box<T1>>(
  initialValue: T1 | T2,
  comparator: ((newValue: T1, oldValue: T1) => boolean) = () => true,
  updateInterceptor: (update: () => void) => (() => void) = (update) => () => update(),
) {
  const [, update] = React.useState(Symbol('(ಠ_ಠ)'));
  const box: Box<T1> | T2 = React.useMemo(
    () => {
      if (initialValue instanceof Box) {
        return initialValue;
      }
      return new Box(initialValue);
    },
    [],
  );

  const updater = React.useMemo(() => (
    updateInterceptor(() => update(Symbol('(ಠ_ಠ)')))
  ), [updateInterceptor]);

  React.useEffect(
    () => {
      const listener: BoxEvent<T1> = (newValue, oldValue) => {
        if (comparator(newValue, oldValue)) {
          updater();
        }
      };
      return box.subscribe(listener);
    },
    [],
  );

  box.set = box.set.bind(box);
  box.get = box.get.bind(box);
  box.pick = box.pick.bind(box);
  box.merge = box.merge.bind(box);
  box.subscribe = box.subscribe.bind(box);

  if (initialValue instanceof Box) {
    return box as T2;
  }
  return box as Box<T1>;
}

export default useBox;
