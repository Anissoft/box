import Box, { BoxEvent } from './Box';
import useBox from './useBox';

function createBox<T>(value: T) {
  return new Box(value);
}

function subscribe(callback: () => void, boxes: (Box<any>)[]) {
  const ubsubscribes = boxes.map(
    box => box.subscribe(callback),
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
};

export default Box;
