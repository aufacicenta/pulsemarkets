import { useEffect, useState } from "react";
import { Observable, Subscription } from "rxjs";

export const useSubscription = (initialValue: any, observable: Observable<any>) => {
  const [value, setValue] = useState<any>(initialValue);

  let subscription: Subscription;

  const subscribe = async () => {
    subscription = observable.subscribe(setValue);
  };

  useEffect(() => {
    subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return value;
};
