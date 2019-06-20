import clone from 'lodash/cloneDeep';

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

  public get = () => this.value;

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
