import { BehaviorSubject } from "rxjs";

export const useObservable = () => {
  const observers = new Map<string, BehaviorSubject<any>>();

  const create = (key: string, value: any) => {
    let observer = observers.get(key);

    if (observer !== undefined) return observer;

    observer = new BehaviorSubject<string>(value);

    observers.set(key, observer);

    return observer.asObservable();
  };

  const set = (key: string, value: any) => {
    const observer = observers.get(key);

    if (observer === undefined) return;

    observer.next(value);
  };

  return { create, set };
};
