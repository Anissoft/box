# 📦 Box  

Extremely simple and lightweight observer for variable in JS/TS applications. Just put it in the box!

## Installation
Just run [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```bash
$ npm install @anissoft/box
```

## Usage

```ts
import {Box, box} from '@anissoft/box';

const nameBox = new Box('Jeremy');// or const nameBox = box('Jeremy');
console.log(`Hello, ${nameBox.value}`); // Hello, Jeremy

nameBox.subscribe(
  (newValue, oldValue) => {
    console.log(`Chnage box value from ${oldValue} to ${newValue}`);
  },
);

nameBox.value = 'Jacob';
console.log(`Hello, ${nameBox.value}`); // Hello, Jacob

nameBox.set('Mike');
console.log(`Hello, ${nameBox.get()}`); // Hello, Mike

nameBox.set(oldValue => `${oldValue} Jr`);
console.log(`Hello, ${nameBox.get()}`); // Hello, Mike Jr

```

You can use boxed value in your React components via handy [hook](https://reactjs.org/docs/hooks-overview.html)

```ts
import * as React from 'react';
import { useBox } from '@anissoft/box';

function Countdown(props: {start: number}) {
  const timeBox = useBox(props.start);
  const { get: getRemainingTime, set: setRemainingTime } = timeBox;

  React.useEffect(
    () => {
      const interval = setInterval(
        () => setRemainingTime(oldValue => oldValue - 1),
        1000,
      ); 

      const clear = () => clearInterval(interval);

      timeBox.subscribe(
        (newValue) => clear(),
        (newValue) => newValue <= 0,
        },
      );
      return clear;
    },
    [],
  );

  return (
    <div>
      <span>{`Seconds left ${getRemainingTime}`}</span>
    </div>
  )
}
```

``useBox`` can accept already created box as agrument:

```ts
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
