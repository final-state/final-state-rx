[![Build Status](https://travis-ci.com/final-state/final-state-rx.svg?branch=master)](https://travis-ci.com/final-state/final-state-rx)
[![codecov.io](https://codecov.io/gh/final-state/final-state-rx/branch/next/graph/badge.svg)](https://codecov.io/gh/final-state/final-state-rx)
[![Known Vulnerabilities](https://snyk.io/test/github/final-state/final-state-rx/badge.svg)](https://snyk.io/test/github/final-state/final-state-rx)
[![minified + gzip](https://badgen.net/bundlephobia/minzip/@liyuanqiu/final-state-rx@0.2.0)](https://bundlephobia.com/result?p=@liyuanqiu/final-state-rx@0.2.0)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# final-state-rx

> A plugin for `final-state` to handle observable actions

## Installation

```bash
yarn add final-state
yarn add final-state-rx
```

You should care about the `peer dependencies` of this package. If something not installed, just install them manually.

`final-state-rx` is written in `Typescript`, so you don't need to find a type definition for it.

## Basic Example

```javascript
import { createStore } from 'final-state';
import { applyRxHandler } from 'final-state-rx';
import { Observable } from 'rxjs';

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
  rxIncreaseCount: {
    handler: 'rx',
    action(n = 1) {
      return new Observable(subscriber => {
        subscriber.next('increaseCount');
        setTimeout(() => {
          subscriber.next(['increaseCount', n]);
          subscriber.complete();
        }, 1000);
      });
    },
  },
};

const store = createStore(initialState, actions, 'example-store');

applyRxHandler(store);

// count = 0
store.dispatch('rxIncreaseCount', 5);
// count = 1
// after 1000 milliseconds, count = 6
```

## Action schema

`final-state`'s default action handler will handler all the functional actions like:

```javascript
actions = {
  fooAction() {
    // default handler
  },
  barAction: async () => {
    // default handler
  },
};
```

It is difficult to handle a complicated asynchronous workflow.

`final-state-rx` is a plugin to enable you to design an observable action. If you applied it to your store instance, you can write your action like this:

```javascript
actions = {
  fooAction: {
    // field `handler` is required
    // it lets `final-state` know which plugin to use to handle this action
    // here `rx` means to use `final-state-rx` as action handler
    handler: 'rx',
    // field `action` is defined by `final-state-rx`
    // it's signature is:
    // type RxAction = (params: any) => Observable<NextValue>;
    // the `params` is exactly the same `params` in Store#dispatch
    action(params) {
      return new Observable();
    },
  },
};
```

## Test

This project uses [jest](https://jestjs.io/) to perform testing.

```bash
yarn test
```
