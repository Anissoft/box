import clone from 'lodash/cloneDeep';
import get from 'lodash/get';
import merge from 'lodash/merge';

export type BoxEvent<T1> = ((newValue: T1, oldValue: T1) => void);
export type Condition<T1> = ((newValue: T1, oldValue: T1) => boolean);
export interface ObservableBox<T1> {
  get: () => T1;
  set: (setter: ((oldValue: T1) => T1) | T1) => void;
  subscribe: (event: BoxEvent<T1>, condition: Condition<T1>) => (() => void);
}

class Box<T1> implements ObservableBox<T1> {
  private state: T1;
  private observers: { id: Symbol, observer: BoxEvent<T1>, condition: Condition<T1> }[] = [];

  constructor(value: T1) {
    this.state = clone(value);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.merge = this.merge.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.pick = this.pick.bind(this);
  }

  public get value() {
    return this.state;
  }

  public set value(value: T1) {
    const oldValue = this.state;
    const newValue = clone(value);
    this.state = newValue;

    this.observers.forEach(
      ({ observer, condition }) => {
        if (condition.apply(null, [newValue, oldValue])) {
          observer.apply(null, [newValue, oldValue])
        }
      },
    );
  }

  public get = () => {
    return this.value;
  }

  public set = (newValue: ((oldValue: T1) => T1) | T1) => {
    if (typeof newValue === 'function') {
      this.value = (newValue as ((oldValue: T1) => T1))(this.value);
    } else {
      this.value = newValue;
    }
  }

  public update = this.set

  public pick(): T1;
  public pick<T2 = T1>(path?: string[] | string, defaultValue?: T2): T2;
  public pick<T2 = T1>(path?: string[] | string, defaultValue?: T2) {
    if (!path) {
      return this.get();
    }
    return get(this.value, path, defaultValue);
  };

  public merge = (updatedPart: ((oldValue: T1) => Partial<T1>) | Partial<T1>) => {
    if (typeof this.state !== 'object') {
      throw new Error('Box.merge(...) can be used only for boxes with object-like values');
    }
    if (typeof updatedPart === 'function') {
      this.set(merge({}, this.get(), (updatedPart as ((oldValue: T1) => Partial<T1>))(this.value)));
    } else {
      this.set(merge({}, this.get(), updatedPart));
    }
  }

  public subscribe = (
    candidate: BoxEvent<T1>,
    condition: Condition<T1> = () => true,
  ) => {
    const id = Symbol(candidate.name || 'noName');
    this.observers.push({ id, observer: candidate, condition });

    return () => {
      this.observers = this.observers.filter(observer => observer.id !== id);
    };
  }
}

export default Box;
