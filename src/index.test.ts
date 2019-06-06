/* eslint no-param-reassign:0 */
import Store, { ActionMap } from 'final-state';
import { Observable } from 'rxjs';
import applyRxHandler from '.';

function sleep(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

interface State {
  count: number;
}

const initialState: State = {
  count: 0,
};

const actions: ActionMap = {
  increaseCount(draft: State, n = 1) {
    draft.count += n;
  },
  increaseCountByNEvery200msRepeat5Times: {
    handler: 'rx',
    action(n = 1) {
      let c = 0;
      return new Observable(subscriber => {
        const id = setInterval(() => {
          subscriber.next(['increaseCount', n]);
          c += 1;
          if (c === 5) {
            clearInterval(id);
            subscriber.complete();
          }
        }, 200);
      });
    },
  },
  increaseCountEvery200msRepeat5Times: {
    handler: 'rx',
    action() {
      let c = 0;
      return new Observable(subscriber => {
        const id = setInterval(() => {
          subscriber.next('increaseCount');
          c += 1;
          if (c === 5) {
            clearInterval(id);
            subscriber.complete();
          }
        }, 200);
      });
    },
  },
  badNextValue: {
    handler: 'rx',
    action() {
      return new Observable(subscriber => {
        subscriber.next(1);
      });
    },
  },
};

test('rx action should work properly', async () => {
  const store = new Store(initialState, actions, 'final-state-rx-test-1');
  applyRxHandler(store);
  expect(store.getState().count).toBe(0);
  store.dispatch('increaseCountByNEvery200msRepeat5Times', 2);
  expect(store.getState().count).toBe(0);
  await sleep(300);
  expect(store.getState().count).toBe(2);
  await sleep(200);
  expect(store.getState().count).toBe(4);
  await sleep(200);
  expect(store.getState().count).toBe(6);
  await sleep(200);
  expect(store.getState().count).toBe(8);
  await sleep(200);
  expect(store.getState().count).toBe(10);
});

test('rx action complete works', async () => {
  const store = new Store(initialState, actions, 'final-state-rx-test-2');
  applyRxHandler(store);
  expect(store.getState().count).toBe(0);
  const complete = store.dispatch('increaseCountEvery200msRepeat5Times');
  await complete;
  expect(store.getState().count).toBe(5);
});

test('bad next value will throw an exception', async () => {
  const store = new Store(initialState, actions, 'final-state-rx-test-3');
  applyRxHandler(store);
  try {
    await store.dispatch('badNextValue');
  } catch (e) {
    expect(e.message).toBe('Bad next value.');
  }
});
