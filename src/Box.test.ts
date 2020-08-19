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

    test('should create observable array-like values', () => {
      const box = new Box([1,2,3,4]);
      expect(box.get()).toEqual([1,2,3,4]);
    });

    test('object-like values should be cloned from ancestor', () => {
      const ancestor = { foo: 'bar' };
      const box = new Box(ancestor);
      expect(box.get()).not.toBe(ancestor);

      ancestor.foo = 'another'
      expect(box.get().foo).not.toBe('another');
    });
  });

  // describe('extend Box', () => {
  //   test('')
  // })

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


  describe('method .pick()', () => {
    test('should return the same value as getter .value', () => {
      const box = new Box('string');
      const boxWithObject = new Box({ foo: 'bar' });

      expect(box.pick()).toBe(box.value);
      expect(boxWithObject.pick()).toBe(boxWithObject.value);
    });
    test('should return value from array by index ', () => {
      const box = new Box([1,2,3,4]);

      expect(box.pick(2)).toBe(3);
    });
    test('.pick([path], [devaultValue]) should return value from given path, otherwise - defaultValue', () => {
      const box = new Box('string');
      const boxWithObject = new Box({ foo: [1, 2, 3, 4] });

      expect(box.pick('') === box.value).toBe(true);
      expect(box.pick('foo')).toBe(undefined);
      expect(box.pick('foo', 'default')).toBe('default');
      expect(boxWithObject.pick('foo.0')).toBe(1);
    });
  })

  describe('method .get()', () => {
    test('should return the same value as getter .value', () => {
      const box = new Box('string');
      const boxWithObject = new Box({ foo: 'bar' });

      expect(box.get()).toBe(box.value);
      expect(boxWithObject.get()).toBe(boxWithObject.value);
    });
  })

  describe('method .set()', () => {

    test('.set([newValue]) should change observable value to newValue', () => {
      const box = new Box('string');
      const boxWithObject = new Box<{ [key: string]: string }>({ foo: 'bar' });
      const boxWithArray = new Box([1,2,3]);

      box.set('newString');
      boxWithObject.set({ bar: 'foo' })
      boxWithArray.set([4,5,6]);


      expect(box.get()).toBe('newString');
      expect(boxWithObject.get()).toEqual({ bar: 'foo' });
      expect(boxWithArray.get()).toEqual([4,5,6]);
    });

    test('.set([callback]) should change observable value as the result of callback function', () => {
      const box = new Box('string');
      const boxWithObject = new Box<{ [key: string]: string }>({ foo: 'bar' });

      box.set(oldValue => `new-${oldValue}`);
      boxWithObject.set((oldValue) => {
        oldValue.bar = 'foo';
        return oldValue;
      })

      expect(box.get()).toBe('new-string');
      expect(boxWithObject.pick('bar')).toBe('foo');
      
    });

    test('.set([callback]) shouldn\'t mutate old value', () => {
      const boxWithObject = new Box<{ [key: string]: string }>({ foo: 'bar' });
      const reference = boxWithObject.get();

      boxWithObject.set(oldValue => oldValue)

      expect(boxWithObject.get()).not.toBe(reference);
    });
  });

  describe('method .merge()', () => {
    test('.merge([newValue]) should mergeDeep newValue and oldValue', () => {
      const boxWithObject = new Box<{ [key: string]: string }>({ foo: 'bar' });

      boxWithObject.merge({ bar: 'foo' });

      expect(boxWithObject.get()).toEqual({ foo: 'bar', bar: 'foo' });
    });

    test('.merge([newValue]) should throw in case non object-like value', () => {
      const boxWithObject = new Box(8);

      expect(() => boxWithObject.merge({ bar: 'foo' } as any)).toThrow();
    });

    test('.merge([callback]) should mergeDeep result of callback and oldValue', () => {
      const boxWithObject = new Box<{ [key: string]: string }>({ foo: 'bar' });

      boxWithObject.merge(oldValue => ({ [oldValue.foo]: 'foo' }))

      expect(boxWithObject.get()).toEqual({ foo: 'bar', bar: 'foo' });
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

  describe('method .update', () => {
    test('.update([newValue]) should update value', (end) => {
      const box = new Box('string');
      const boxWithObject = new Box<{ [key: string]: string }>({ foo: 'bar' });
      const boxWithArray = new Box([1,2,3]);

      box.update('newString');
      boxWithObject.update({ bar: 'foo' })
      boxWithArray.update([4,5,6]);

      setTimeout(() => {
        expect(box.get()).toBe('newString');
        expect(boxWithObject.get()).toEqual({ foo: 'bar', bar: 'foo' });
        expect(boxWithArray.get()).toEqual([4,5,6]);
        end();
      }, 100);
    });

    test('.update([newValue]) callback passed as newValue shoul access updateAccumulator', (end) => {
      const box = new Box('string');
      const boxWithObject = new Box<Record<string, string>>({ foo: 'bar' });

      box.update('newString');
      boxWithObject.update({ bar: 'foo' });

      box.update((value, acc) => {
        expect(acc).toBe('newString');
        return acc as string;
      });

      boxWithObject.update((value, acc) => {
        expect(acc).toEqual({ bar: 'foo' });
        return acc as Record<string, string>;
      })

      // -------
      const arrayBox = new Box([0,1,2,3,4,5]);
      const event = jest.fn(() => { });

      arrayBox.subscribe(event);
      
      arrayBox.update((value) => [...value,  6]);
      arrayBox.update((value, canidate) => [...(canidate || value),  7]);
      arrayBox.update((value, canidate) => [...(canidate || value),  8]);
      arrayBox.update((value, canidate) => [...(canidate || value),  9]);
      
      setTimeout(() => {
        expect(arrayBox.get()).toEqual([0,1,2,3,4,5,6,7,8,9]);
        end();
      }, 0);
      // -----
    });
    
    test('.update([newValue]) should trigger subscribe only once in sync flow', (end) => {
      const box = new Box(0);
      const event = jest.fn(() => { });
      box.subscribe(event);

      box.update(1);
      box.update(2);
      box.update(3);

      setTimeout(() => {
        expect(event).toHaveBeenCalledTimes(1);
        end();
      }, 100);
    });

    test('.update([newValue]) should update value in next tick', (end) => {
      const box = new Box(0);
      const boxWithObject = new Box<Record<string, string>>({ foo: 'bar' });

      box.update(1);
      boxWithObject.update({ bar: 'foo' });

      setTimeout(() => {
        expect(box.get()).toBe(1);
        expect(boxWithObject.get()).toEqual({ foo: 'bar',  bar: 'foo' });
        end();
      }, 10);
    });

    test('.update([newValue]) should be able to accept updater function as asn agrument', (end) => {
      const box = new Box(0);
      const boxWithObject = new Box({ foo: 'bar' });

      box.update(v => v + 1);
      boxWithObject.update(v => ({...v, bar: 'foo' }));

      setTimeout(() => {
        expect(box.get()).toBe(1);
        expect(boxWithObject.get()).toEqual({ foo: 'bar',  bar: 'foo' });
        end();
      }, 100);
    });

     test('.mergeAsync([newValue]) should throw in case non object-like value', () => {
      const boxWithObject = new Box(8);

      expect(() => boxWithObject.mergeAsync({ bar: 'foo' } as any)).toThrow();
    });

     test('.mergeAsync([newValue]) to accept updater function as an agrument', (end) => {
      const boxWithObject = new Box({ foo: 'bar' });
      boxWithObject.mergeAsync(v => ({...v, bar: 'foo' }));

      setTimeout(() => {
        expect(boxWithObject.get()).toEqual({ foo: 'bar',  bar: 'foo' });
        end();
      }, 100);
    });
  });
});
