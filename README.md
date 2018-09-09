## vuex-router-actions

The library you've been waiting for to streamline complex Vuex actions and fast and secure routing in your app.

## Goals

- To make it easier to use Vuex actions.
- To make it easier to produce apps which can load data asynchronously before being routed to a page and also check along the way whether that user can go to that page - and also what to do when they cannot.
- To cache action results so traversing through an app is as efficient as possible.
- To make it easier to track asynchronous actions and keep the user notified when the app is loading.

## Features

- Cache the results of an action based on logic or a cache key.
- Listen to when actions are started, resolved, rejected, ended, and all pending actions are done.
- Call a mutation with a flag on whether a set of actions are currently running.
- Check the state of the store to determine whether an action can continue (subsequently a route).
- Keep a routed Vue component from loading or updating until an action is finished.
- If an action has exited because a user cannot visit a route, provide a way to redirect the user somewhere else.
- Communicate to the user when one or more actions are being processed (makes it easy to create loading screens).

## Contents

- [Goals](#goals)
- [Features](#features)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [API](#api)
  - [actionsWatch](#actionswatch)
  - [actionsLoading](#actionsloading)
  - [actionsCached](#actionscached)
  - [actionsCachedConditional](#actionscachedconditional)
  - [actionsProtect](#actionsprotect)
  - [actionBeforeRoute](#actionbeforeroute)
  - [actionOptional](#actionoptional)

### Dependencies

No build time dependencies, but this library is used in conjunction with `vuex` and optionally `vue-router`.

### Installation

#### npm

Installation via npm : `npm install --save vuex-router-actions`

## API

#### actionsWatch

Watches the given actions and invokes the callbacks passed in the options of `VuexRouterActions`. If the result of an action is a promise - it is watched and immediately invokes `onActionStart` followed by `onActionResolve` or `onActionReject` and then `onActionEnd`. If the result of an action is not a promise then `onActionStart` and `onActionEnd` are invoked immediately. If there are no more watched actions being executed then `onActionsDone` is invoked after the last `onActionEnd`.

```javascript
import VuexRouterActions, { actionsWatch } from 'vuex-router-actions'
const plugin = VuexRouterActions({
  onActionStart (action, num) {},
  onActionEnd (action, num, result, resolved) {}
})
const store = new Vuex.Store({
  plugins: [plugin],
  actions: {
    ...actionsWatch({
      loadThis (context, payload) {},
      loadThat (context, payload) {} // return a Promise
    })
  }
})
```

#### actionsLoading

Calls a mutation on a store when any of the passed actions are running and when they stop. This provides an easy way to signal to the user when something is loading, even a complex set of asynchronous actions.

```javascript
import { actionsLoading } from 'vuex-router-actions'
const store = new Vuex.Store({
  state: {
    loading: false
  },
  mutations: {
    setLoading (state, loading) {
      state.loading = loading
    }
  },
  actions: {
    ...actionsLoading('setLoading', {
      page1 (context, payload) {},
      page2 (context, payload) {}
    })
  }
})
```

#### actionsCached

Produces actions with cached results based on some cache key. The action will always run the first time unless the cache key returned `undefined`. The cached results of the action are "cleared" when a different key is returned for a given action.

```javascript
import { actionsCached } from 'vuex-router-actions'
const store = new Vuex.Store({
  actions: {
    ...actionsCached({
      loadPage: {
        getKey: (context, payload) => payload, // look at store, getters, payload, etc
        handler: (context, payload) => null // some result that can be cached
      }
    })
  }
})
```

#### actionsCachedConditional

Produces actions with cached results based on some condition. The action will always run the first time.

```javascript
import { actionsCachedConditional } from 'vuex-router-actions'
const store = new Vuex.Store({
  actions: {
    ...actionsCachedConditional({
      loadPage: {
        isInvalid: (context, payload) => true, // look at store, getters, payload, etc
        handler: (context, payload) => null // some result that can be cached
      }
    })
  }
})
```

#### actionsProtect

Creates "protection" actions. These are functions which return a truthy or falsy value and the action returned produces a Promise that is resolved or rejected. This is useful when creating actions which load data for a route. You can add protection actions before and/or after the loading actions so it can validate the route path and afterwards validate whether the user should be able to see the given route. If the protect action returns another promise that promise is passed through, and whether it resolves or rejects determines if the action stops or continues.

```javascript
import { actionsProtect, actionBeforeRoute } from 'vuex-router-actions'
const store = new Vuex.Store({
  actions: {
    loadUser (context, user_id) {}, // returns promise which loads user data, also commits user to state
    loadTask (context, task_id) {}, // returns promise which loads task data

    // for actionBeforeRoute the to route is passed
    loadTaskPage ({dispatch}, to) {
      return dispatch('loadUser', to.params.user)
        .then(user => dispatch('hasUser'))
        .then(hasUser => dispatch('loadTask', to.params.task))
        .then(task => dispatch('canEditTask', task))
    },
    ...actionsProtect({
      hasUser ({state}) { return state.user && !state.user.disabled },
      canEditTask ({state}, task) { return state.user.canEdit( task ) }
    })
  }
})
// Task page
const component = {
  ...actionBeforeRoute('loadTaskPage')
}
```

#### actionBeforeRoute

Dispatches an action in the store and waits for the action to finish before the routed component this is placed in is entered or updated (see `beforeRouteEnter` and `beforeRouteUpdate` in `vue-router`). If the action resolves the routed component will be entered, otherwise `getOtherwise` will be invoked to determine where the router should be redirected. `getOtherwise` by default returns false which simply stops routing. If it returned undefined it would proceed as normal. If it returned a string or a route object it would redirect to that route.

```javascript
// MyPage.vue
import { actionBeforeRoute } from 'vuex-router-actions'
export default {
 ...actionBeforeRoute('loadMyPage', (to, from, rejectReason) => {
    return '/path/i/can/goto/perhaps/previous/which/also/does/check'
 })
}
```

#### actionOptional

Allows you to pass the results of a dispatch through this function and whether or not it resolves or rejects it won't stop from proceeding. This happens by returning a promise which always resolves. If the given promise is rejected then `resolveOnReject` is passed to the resolve function of the returned Promise.

## LICENSE
[MIT](https://opensource.org/licenses/MIT)
