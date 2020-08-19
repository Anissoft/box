# 📦 Box  

Extremely simple, lightweight and well typed observer for variables in your applications. Just put it in the box!

## Installation

Just run [`npm install`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) command:

```bash
$ npm install @anissoft/box --save
```

## Examples

#### Box with primitive value
```typescript
import Box from '@anissoft/box';

const nameBox = new Box('Jeremy')

console.log(`Hello, ${nameBox.value}`); // Hello, Jeremy

nameBox.subscribe(
  (newValue, oldValue) => {
    console.log(`Change box value from ${oldValue} to ${newValue}`);
  },
);

nameBox.value = 'Jacob';
console.log(`Hello, ${nameBox.value}`); // Hello, Jacob

nameBox.set('John');
console.log(`Hello, ${nameBox.get()}`); // Hello, Jonh

nameBox.set(oldValue => `${oldValue} Jr`);
console.log(`Hello, ${nameBox.get()}`); // Hello, Jonh Jr
```

#### Box with object-like value

```typescript
import Box from '@anissoft/box';

const objectBox = new Box({ name: 'Mike' });
objectBox.merge({ lastname: 'Wazowski' });

console.log(`${objectBox.pick('name')} - ${objectBox.pick('lastname')}`) // Mike - Wazowski
```

#### Box as base class

```typescript
import Box from '@anissoft/box';

class User extends Box<{
  login: string;
  firstname: string;
  lastname: string;
  preferences?: Record<string, string>
}> {
  constructor(initials: { 
    login: string;
    firstname: string;
    lastname: string;
  }) {
    super(initials);
    ...
  }

  public savePreferences(preferences) {
    this.merge({ preferences })
  }
  ...
}

```

## API

### .get()

Return box value

```typescript
const nameBox = new Box('Jeremy')

nameBox.get(); // Jeremy
```

### .set(newValue)

Set new value in the box and trigger all subcriptions

```typescript
const nameBox = new Box('Jeremy');
const numberBox = new Box(0);

nameBox.set('Gerry');
numberBox.set(oldValue => oldValue + 1);

nameBox.get(); // Gerry
numberBox.get(); // 1
```

### .subscribe(callback[, condition])

Execute callback on every value change. If condition was specified - callback will be executed only if condition returns `true`; 

```typescript
const numberBox = new Box(0);

numberBox.subscribe(
  () => console.log('value: ',number.box.get());
);

numberBox.subscribe(
  () => console.log('value now greater than 3'),
  (newValue, oldValue) => newValue > 3,
);

setInterval(() => {
  numberBox.set(oldValue => oldValue + 1);
}, 1000);
```

### .merge(newPartialValue)

Like `.set`, but for object-like values. Instead of replacing an old value, will deeply merge it with the new one

```typescript
const objectBox = new Box({ foo: 1, bar: 2 });

onjectBox.merge({ bar: 3 });

objectBox.get() // { foo: 1, bar: 3 }
```


### .pick(key)

Returns property from object-like value. Shorthand for `box.get()[key]`

```typescript
const objectBox = new Box({ name: 'Finn ', race: 'Human' });

console.log(`${objectBox.pick('name')} the ${objectBox.pick(race)}`);
```

### .update(newPartialValue)

Update works just like `.set` or `.merge`, but delay actual value change till the next tick.

```typescript
const arrayBox = new Box([0,1,2,3,4,5]);

arrayBox.subscribe(() => {
  console.log('I was executed only once');
});

arrayBox.update(value => [...value, 6]);
arrayBox.update(value => [...value, 7]);
arrayBox.update(value => [...value, 8]);
arrayBox.update(value => [...value, 9]);

arrayBox.get(); // [0,1,2,3,4,5]

setTimeout(() => {
  arrayBox.get(); // [0,1,2,3,4,5,9]
}, 0);

```

You can use the second argument in updater Callback, to access previous update values in current tick:

```typescript
const arrayBox = new Box([0,1,2,3,4,5]);

arrayBox.subscribe(() => {
  console.log('I was executed only once');
});

arrayBox.update((value) => [...value,  6]);
arrayBox.update((value, canidate) => [...canidate,  7]);
arrayBox.update((value, canidate) => [...canidate,  8]);
arrayBox.update((value, canidate) => [...canidate,  9]);

setTimeout(() => {
  arrayBox.get(); // [0,1,2,3,4,5,6,7,8,9]
}, 0);
```

## With React

You can use boxed value in your React components via handy [hook](https://reactjs.org/docs/hooks-overview.html)

```tsx
import * as React from 'react';
import { useBox } from '@anissoft/box';

function Countdown(props: { start: number }) {
  const { 
    get: getRemainingTime, 
    set: setRemainingTime,
    subscribe,
  }  = useBox(props.start);

  React.useEffect(
    () => {
      const interval = setInterval(
        () => setRemainingTime(oldValue => oldValue - 1),
        1000,
      ); 

      const clear = () => clearInterval(interval);
      const unsubscribe = subscribe(
        () => clear(),
        newValue => newValue <= 0,
      );

      return () => {
        clear();
        unsubscribe();
      };
    },
    [],
  );

  return (
    <div>
      <span>Seconds left {getRemainingTime()}</span>
    </div>
  )
}
```

``useBox`` can accept already created box as agrument:

```tsx
import * as React from 'react';
import { useBox } from '@anissoft/box';

import myBoxedState from 'Models/state';

function Component() {
  const { get: getState, set: setState } = useBox(myBoxedState);
 
  return (
    <div>
      {Object.entries(getState()).map(
        ([key, value]) => <p>{`${key}: ${value}`}</p>
      )}
    </div>
  )
}
```

You can pass comparator as second argument, to specify condition when hook should initiate component update:

```tsx
import * as React from 'react';
import { useBox } from '@anissoft/box';

function Countdown(props: { start: number }) {
  const { 
    get: getRemainingTime, 
    set: setRemainingTime,
  }  = useBox(props.start, (newValue) => newValue >= 0);

  React.useEffect(
    () => {
      const interval = setInterval(
        () => setRemainingTime(oldValue => oldValue - 1),
        1000,
      ); 

      return () => clearInterval(interval);
    },
    [],
  );

  return (
    <div>
      <span>{`Seconds left ${getRemainingTime()}`}</span>
    </div>
  )
}
```


## Author

👤 \*\*Alexey Anisimov

- Github: [@Anissoft](https://github.com/Anissoft)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/Anissoft/box/issues).