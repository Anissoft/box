import Observable from './Box';

function observable<T>(value: T) {
  return new Observable(value);
};

export {
  Observable as Box,
  observable as box,
};
