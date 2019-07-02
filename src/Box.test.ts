import Box from './Box';

describe('class Box', () => {
  describe('constructor', () => {
    test('should create observable values from primitives', () => {
      const boxWithNumber = new Box(100);
      const boxWithString = new Box('string');
      const boxWithBooelan = new Box(true);

      expect(boxWithNumber.get()).toBe(100);
      expect(boxWithString.get()).toBe('string');
      expect(boxWithBooelan.get()).toBe(true);
    });

    test('should create observable object-like values', () => {
      const box = new Box({ foo: 'bar' });
      expect(box.get()).toEqual({ foo: 'bar' });
    });

    test('object-like values should be cloned from ancestor', () => {
      const ancestor = { foo: 'bar' };
      const box = new Box(ancestor);
      expect(box.get()).not.toBe(ancestor);

      ancestor.foo = 'another'
      expect(box.get().foo).not.toBe('another');
    });
  })

  describe('setter and getter', () => {
    test('getter .value should return current value of observable', () => {
      const box = new Box(true);
      expect(box.value).toBe(true);
    });

    test('setter .value should change observable', () => {
      const box = new Box(123);
      box.value = 321;
      expect(box.value).toBe(321);
    });
  });

  describe('method .get()', () => {
    test('.get() should return the same value as getter .value', () => {
      const box = new Box('string');
      const boxWithObjest = new Box({ foo: 'bar' });

      expect(box.get()).toBe(box.value);
      expect(boxWithObjest.get()).toBe(boxWithObjest.value);
    });
    test('.get([path], [devaultValue]) should return value from given path, otherwise - defaultValue', () => {
      const box = new Box('string');
      const boxWithObjest = new Box({ foo: [1, 2, 3, 4] });

      expect(box.get('') === box.value).toBe(true);
      expect(box.get('foo')).toBe(undefined);
      expect(box.get('foo', 'default')).toBe('default');
      expect(boxWithObjest.get('foo.0')).toBe(1);
    });
  })

  describe('method .set()', () => {

    test('.set([newValue]) should change observable value to newValue', () => {
      const box = new Box('string');
      const boxWithObjest = new Box<{ [key: string]: string }>({ foo: 'bar' });

      box.set('newString');
      boxWithObjest.set({ bar: 'foo' })

      expect(box.get()).toBe('newString');
      expect(boxWithObjest.get()).toEqual({ bar: 'foo' });
    });

    test('.set([callback]) should change observable value as the result of callback function', () => {
      const box = new Box('string');
      const boxWithObjest = new Box<{ [key: string]: string }>({ foo: 'bar' });

      box.set(oldValue => `new-${oldValue}`);
      boxWithObjest.set((oldValue) => {
        oldValue.bar = 'foo';
        return oldValue;
      })

      expect(box.get()).toBe('new-string');
      expect(boxWithObjest.get('bar')).toBe('foo');
    });

    test('.set([callback]) shouldn\'t mutate old value', () => {
      const boxWithObjest = new Box<{ [key: string]: string }>({ foo: 'bar' });
      const reference = boxWithObjest.get();

      boxWithObjest.set(oldValue => oldValue)

      expect(boxWithObjest.get()).not.toBe(reference);
    });
  });

  describe('method .merge()', () => {
    test('.merge([newValue]) should mergeDeep newValue and oldValue', () => {
      const boxWithObjest = new Box<{ [key: string]: string }>({ foo: 'bar' });

      boxWithObjest.merge({ bar: 'foo' })

      expect(boxWithObjest.get()).toEqual({ foo: 'bar', bar: 'foo' });
    });

    test('.merge([newValue]) should theow in case non object-like value', () => {
      const boxWithObjest = new Box(5);

      expect(() => boxWithObjest.merge(8)).toThrow();
    });

    test('.merge([callback]) should mergeDeep result of callback and oldValue', () => {
      const boxWithObjest = new Box<{ [key: string]: string }>({ foo: 'bar' });

      boxWithObjest.merge(oldValue => ({ [oldValue.foo]: 'foo' }))

      expect(boxWithObjest.get()).toEqual({ foo: 'bar', bar: 'foo' });
    });
  });

  describe('method .subscribe()', () => {
    test('.subscribe([callback]) should assign callback execution on every observable value change', (done) => {
      const box = new Box(0);
      let counter = 0;
      box.subscribe(() => {
        counter += 1;
        expect(box.get()).toBe(counter)
        if (counter > 3) {
          done();
        }
      })

      setInterval(
        () => box.set(oldValue => oldValue + 1),
        10,
      );
    });

    test('.subscribe([callback]) should provide callback with arguments newValue and oldValue', (done) => {
      const box = new Box(0);
      box.subscribe((newValue, oldValue) => {
        expect(newValue).toBe(1)
        expect(oldValue).toBe(0)
        done();
      })

      box.set(oldValue => oldValue + 1);
    });

    test('.subscribe([callback]) should return unsubscribe function', (done) => {
      const box = new Box(0);
      const event = jest.fn(() => {
        unsubscribe();
      });
      const unsubscribe = box.subscribe(event);

      box.set(oldValue => oldValue + 1);

      expect(event).toHaveBeenCalledTimes(1);
      setTimeout(done, 100);
    });

    test('.subscribe([callback], [condition]) should execute callback only if condition() === true', () => {
      const box = new Box(0);
      const event = jest.fn(() => { });
      box.subscribe(event, (newValue => newValue < 3));

      for (let i = 0; i < 10; i += 1) {
        box.set(oldValue => oldValue + 1);
      }

      expect(event).toHaveBeenCalledTimes(2)
    });
  });
});
