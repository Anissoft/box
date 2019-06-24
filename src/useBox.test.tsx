import * as React from 'react';

import { act, renderHook } from '@testing-library/react-hooks';

import Box from './Box';
import useBox from './useBox';

describe('hook useBox', () => {
  let box: Box<string>;

  test('should return boxed value', () => {
    const { result } = renderHook(() => useBox(0))

    expect(result.current.get()).toBe(0)
  });

  test('should rerender component when box is updating from the inside', () => {
    const { result } = renderHook(() => useBox(0))

    act(() => {
      result.current.set(1);
    });

    expect(result.current.get()).toBe(1)
  });

  test('should rerender component when box is updating from the outside', () => {
    box = new Box('test string');
    const { result } = renderHook(() => useBox(box))

    act(() => {
      box.set('updated string');
    });

    expect(result.current.get()).toBe('updated string')
  });
});
