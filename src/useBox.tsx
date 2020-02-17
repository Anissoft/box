import * as React from 'react';

import Box, { BoxEvent } from './Box';

function useBox<T1>(
  initialValue: T1 | Box<T1>,
  comparator: ((newValue: T1, oldValue: T1) => boolean) = () => true,
  updateInterceptor: (update: () => void) => (() => void) = (update) => () => update(),
) {
  const [, update] = React.useState(Symbol('(ಠ_ಠ)'));
  const box = React.useMemo(
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
  ), [updateInterceptor])

  React.useEffect(
    () => {
      let listener: BoxEvent<T1> = (newValue, oldValue) => {
        if (comparator(newValue, oldValue)) {
          updater();
        }
      };
     
      return box.subscribe(listener);
    },
    []
  );

  box.set = box.set.bind(box);
  box.get = box.get.bind(box);
  box.pick = box.pick.bind(box);

  return box;
}

export default useBox;
