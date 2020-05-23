import Box, { BoxEvent, Condition } from './Box';
import useBox from './useBox';

function createBox<T>(value: T) {
  return new Box(value);
}

function subscribe(callback: () => void, boxes: (Box<any>)[], condition: Condition<any> | Condition<any>[] = []) {
  const ubsubscribes = boxes.map(
    (box, index) => box.subscribe(callback, typeof condition === 'function' ? condition : condition[index]),
  );

  return () => {
    ubsubscribes.forEach(
      ubsubscribe => ubsubscribe(),
    );
  };
}

export {
  createBox,
  subscribe,
  useBox,
  Box,
};

export default Box;
