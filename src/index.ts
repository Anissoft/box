import Box from './Box';
import useBox from './useBox';

function box<T>(value: T) {
  return new Box(value);
}

export {
  Box,
  box,
  useBox,
};
