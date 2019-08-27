/* eslint @typescript-eslint/no-explicit-any:0 */
import { Store, PluginAction } from 'final-state';
import { Observable } from 'rxjs';

type NextValue = [string, any] | string;

/**
 * @template T the type of params
 * @template K the type of your state
 */
export type RxAction<T = any, K = any> = (
  params: T,
  getState: () => K,
) => Observable<NextValue>;

// eslint-disable-next-line import/prefer-default-export
export const applyRxHandler = (store: Store) => {
  store.registerActionHandler(
    'rx',
    (pluginAction: PluginAction<RxAction>, params: any) =>
      new Promise((resolve, reject) =>
        pluginAction.action(params, store.getState.bind(store)).subscribe({
          next(value: NextValue) {
            if (Array.isArray(value)) {
              store.dispatch(...value);
            } else if (typeof value === 'string') {
              store.dispatch(value);
            } else {
              // this branch is a runtime check
              // eslint-disable-next-line no-console
              console.error('Bad next value:', value);
              reject(new Error('Bad next value.'));
            }
          },
          error: reject,
          complete() {
            resolve();
          },
        }),
      ),
  );
};
