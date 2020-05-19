# 📦 Box  

Extremely simple and lightweight observer for variable in your React applications. Just put it in the box!

## Installation

Just run [`npm install`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) command:

```bash
$ npm install @anissoft/box --save
```

## Usage

Just pass variable in Box cnstructor. Box will provide you with next functionality:

```typescript
import {Box, box} from '@anissoft/box';

// #1 primitive value
const nameBox = new Box('Jeremy');// or const nameBox = box('Jeremy');
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

```typescript
// #2 object-like value
const objectBox = new Box({ name: 'Mike' });
objectBox.merge({ lastname: 'Wazowski' });
console.log(`${objectBox.pick('name')} - ${objectBox.pick('lastname')}`) // Mike - Wazowski
```

```typescript
// #3 using Box as base class
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