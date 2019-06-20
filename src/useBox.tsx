import * as React from 'react';

import Box from './Box';

function useBox<T1>(
  initialValue: T1 | Box<T1>,
  comparator: ((newValue: T1, oldValue: T1) => boolean) = () => false,
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

  React.useEffect(
    () => {
      return box.subscribe((newValue, oldValue) => {
        if (!comparator(newValue, oldValue)) {
          update(Symbol('(ಠ_ಠ)'));
        }
      });
    },
    []
  );

  box.set = box.set.bind(box);
  box.get = box.get.bind(box);

  return box;
}

export default useBox;
