import clone from 'lodash/cloneDeep';
import get from 'lodash/get';
import merge from 'lodash/merge';

export type BoxEvent<T1> = ((newValue: T1, oldValue: T1) => void);
export type Condition<T1> = ((newValue: T1, oldValue: T1) => boolean);

class Box<T1> {
  private state: T1;
  private observers: { id: Symbol, observer: BoxEvent<T1>, condition: Condition<T1> }[] = [];

  constructor(value: T1) {
    this.state = clone(value);
  }

  public get value() {
    return this.state;
  }

  public get = (path?: string[] | string, defaultValue?: any) => {
    if (!path) {
      return this.value;
    }
    return get(this.value, path, defaultValue);
  };

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

  public set = (newValue: ((oldValue: T1) => T1) | T1) => {
    if (typeof newValue === 'function') {
      this.value = (newValue as ((oldValue: T1) => T1))(this.value);
    } else {
      this.value = newValue;
    }
  }

  public merge = (updatedPart: ((oldValue: T1) => Partial<T1>) | Partial<T1>) => {
    if (typeof this.state !== 'object') {
      throw new Error('Box.merge(...) can be used only for boxes with object-like values');
    }
    if (typeof updatedPart === 'function') {
      this.value = merge({}, this.value, (updatedPart as ((oldValue: T1) => Partial<T1>))(this.value));
    } else {
      this.value = merge({}, this.value, updatedPart);
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
