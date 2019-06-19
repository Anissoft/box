import clone from 'lodash/clone';

class Observable<T1>{
  private state: T1;
  private observers: ((newValue: T1, oldValue: T1) => void)[] = []

  constructor(value: T1) {
    this.state = clone(value);
  }

  public get value() {
    return this.state;
  }

  public set value(newValue: T1) {
    const oldValue = this.value;
    this.state = clone(newValue);

    this.observers.forEach(
      observer => observer.call(null, this.state, oldValue),
    )
  }

  public observe = (candidate: Observable<T1>["observers"][0]) => {
    this.observers.push(candidate);

    return () => {
      this.observers = this.observers.filter(observer => candidate !== observer);
    }
  }
}

export default Observable;
