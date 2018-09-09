
import { Store, ActionTree, ActionContext } from 'vuex'



export type ActionHandler<S, R> = (injectee: ActionContext<S, R>, payload: any) => any;

export type ActionHandlerTransform<S, R> = (handler: ActionHandler<S, R>, key: string) => ActionHandler<S, R>

export interface ActionObject<S, R>
{
  root?: boolean;
  handler: ActionHandler<S, R>;
}

export interface ActionCache<S, R>
{
  getKey: (injectee: ActionContext<S, R>, payload: any) => any
  handler: ActionHandler<S, R>
}

export interface ActionCaches<S, R>
{
  [key: string]: ActionCache<S, R>
}

export interface ActionCacheConditional<S, R>
{
  isInvalid: (injectee: ActionContext<S, R>, payload: any) => any
  handler: ActionHandler<S, R>
}

export interface ActionCacheConditionals<S, R>
{
  [key: string]: ActionCacheConditional<S, R>
}

export type ActionRouteOtherwise = (to, from, rejectReason) => any

/**
 * Options which can be passed to
 *
 */
export interface ActionsPluginOptions
{
  onActionStart (action: string, num: number)
  onActionReject (action: string, num: number, reason: any)
  onActionResolve (action: string, num: number, resolved: any)
  onActionEnd (action: string, num: number, result: any, resolved: boolean)
  onActionsDone ()
  createCacheKey (input: any): string
}

const ASSERT_STORE = 'VuexRouterActions must be passed as a plugin to one store'
const ASSERT_HANDLER = 'Cached action handler must be a function.'
const ASSERT_IS_INVALID = 'Cached action isInvalid must be a function.'
const ASSERT_GET_KEY = 'Cached action getKey must be a function.'
const ASSERT_ACTION_INVALID = 'An action passed is not a valid Vuex action.'

const DEFAULT_OTHERWISE = (to, from, rejectReason) => false


let defaultStore: Store<any>
let store: Store<any>
let options: ActionsPluginOptions = actionsDefaultOptions()
let actionNum: number = 0
let actionDone: number = 0


/**
 * This is the plugin that should be invoked and passed in the plugins option
 * to the store which utilizes `actionBeforeRoute` and `actionsLoading` (or
 * any store if those functions are not used if you plan on using `actionsWatch`).
 * If you don't plan on using any of those functions you don't need to include
 * the plugin, otherwise an error will be thrown at runtime when those
 * functions run.
 *
 * ```javascript
 * import VuexRouterActions, { actionsWatch } from 'vuex-router-actions'
 * const actionsPlugin = VuexRouterActions({
 *   onActionStart (action, num) {},
 *   onActionEnd (action, num, result, resolved) {}
 * })
 * const store = new Vuex.Store({
 *    plugins: [actionsPlugin],
 *    actions: {
 *      ...actionsWatch({
 *        load (context, payload) { } // return promise to watch
 *      })
 *    }
 * })
 * ```
 *
 * @param _options The options which contains callbacks which will be invoked
 *    for all actions passed through `actionsWatch`.
 */
export default function(_options?: Partial<ActionsPluginOptions>)
{
  return function(_store: Store<any>)
  {
    assert(store === undefined, ASSERT_STORE)

    store = _store

    if (_options)
    {
      options.onActionStart = _options.onActionStart || options.onActionStart
      options.onActionReject = _options.onActionReject || options.onActionReject
      options.onActionResolve = _options.onActionResolve || options.onActionResolve
      options.onActionEnd = _options.onActionEnd || options.onActionEnd
      options.onActionsDone = _options.onActionsDone || options.onActionsDone
      options.createCacheKey = _options.createCacheKey || options.createCacheKey
    }
  }
}

/**
 * Destroys the plugin so it can be added to another store. This should only
 * be used for testing purposes.
 */
export function actionsDestroy()
{
  store = defaultStore
  options = actionsDefaultOptions()
  actionNum = 0
  actionDone = 0
}

/**
 * Generates the default options for the plugin.
 */
export function actionsDefaultOptions()
{
  return {
    onActionStart: (action: string, num: number) => {},
    onActionReject: (action: string, num: number, reason: any) => {},
    onActionResolve: (action: string, num: number, resolved: any) => {},
    onActionEnd: (action: string, num: number, result: any, resolved: boolean) => {},
    onActionsDone: () => {},
    createCacheKey: (input: any) => JSON.stringify(input)
  }
}

/**
 * Dispatches an action in the store and waits for the action to finish before
 * the routed component this is placed in is entered or updated (see
 * `beforeRouteEnter` and `beforeRouteUpdate` in `vue-router`). If the action
 * resolves the routed component will be entered, otherwise `getOtherwise` will
 * be invoked to determine where the router should be redirected. `getOtherwise`
 * by default returns false which simply stops routing. If it returned undefined
 * it would proceed as normal. If it returned a string or a route object it
 * would redirect to that route.
 *
 * ```javascript
 * // MyPage.vue
 * <script>
 * import { actionBeforeRoute } from 'vuex-router-actions'
 *
 * export default {
 *   ...actionBeforeRoute('loadMyPage', (to, from, rejectReason) => {
 *      return '/path/i/can/goto/perhaps/previous/which/also/does/check'
 *   })
 * }
 * </script>
 * ```
 *
 * @param action The action to dispatch on the store and watch for.
 * @param getOtherwise Where to go if the dispatched action is a reject.
 */
export function actionBeforeRoute (action: string, getOtherwise: ActionRouteOtherwise = DEFAULT_OTHERWISE)
{
  const dispatch = (to, from, next) =>
  {
    assert(store !== undefined, ASSERT_STORE)

    store.dispatch(action, to).then(
      (resolved) => {
        next()
      },
      (reason) => {
        next(getOtherwise(to, from, reason))
      }
    )
  }

  return {
    beforeRouteEnter: dispatch,
    beforeRouteUpdate: dispatch
  }
}

/**
 * Allows you to pass the results of a dispath through this function and whether
 * or not it resolves or rejects it won't stop from proceeding. This happens by
 * returning a promise which always resolves. If the given promise is rejected
 * then `resolveOnReject` is passed to the resolve function of the returned
 * Promise.
 *
 * @param promise The Promise which is optional.
 * @param resolveOnReject The function to call to get a resolved value to return
 *    to the returned Promise when the given Promise rejects.
 * @returns A new promise which always resolves.
 */
export function actionOptional <T>(promise: Promise<T>, resolveOnReject: () => any = () => null): Promise<T>
{
  return new Promise((resolve, reject) =>
  {
    promise.then(resolve, reason => resolve(resolveOnReject()))
  })
}

/**
 * Produces actions with cached results based on some condition. The action will
 * always run the first time.
 *
 * ```javascript
 * const store = new Vuex.Store({
 *    actions: {
 *      ...actionsCachedConditional({
 *        loadPage: {
 *          isInvalid: (context, payload) => true, // look at store, getters, payload, etc
 *          handler: (context, payload) => null // some result that can be cached
 *        }
 *      })
 *    }
 * })
 * ```
 *
 * @param actions The actions to conditionally cache.
 */
export function actionsCachedConditional <S, R>(actions: ActionCacheConditionals<S, S>): ActionTree<S, S>
{
  const out = Object.create(null)
  const cachedResults = Object.create(null)

  for (const key in actions)
  {
    const action = actions[key]
    const { handler, isInvalid } = action

    assert(typeof handler === 'function', ASSERT_HANDLER)
    assert(typeof isInvalid === 'function', ASSERT_IS_INVALID)

    out[key] = function(context, payload)
    {
      if (!(key in cachedResults) || isInvalid.call(this, context, payload))
      {
        cachedResults[key] = handler.call(this, context, payload)
      }

      return cachedResults[key]
    }
  }

  return out
}

/**
 * Produces actions with cached results based on some cache key. The action will
 * always run the first time unless the cache key returned `undefined`. The
 * cached results of the action are "cleared" when a different key is returned
 * for a given action.
 *
 * ```javascript
 * const store = new Vuex.Store({
 *    actions: {
 *      ...actionsCached({
 *        loadPage: {
 *          getKey: (context, payload) => payload, // look at store, getters, payload, etc
 *          handler: (context, payload) => null // some result that can be cached
 *        }
 *      })
 *    }
 * })
 * ```
 *
 * @param actions The actions to cache.
 */
export function actionsCached <S, R>(actions: ActionCaches<S, S>): ActionTree<S, S>
{
  const out = Object.create(null)
  const cachedResults = Object.create(null)
  const cachedKeys = Object.create(null)

  for (const key in actions)
  {
    const action = actions[key]
    const { handler, getKey } = action

    assert(typeof handler === 'function', ASSERT_HANDLER)
    assert(typeof getKey === 'function', ASSERT_GET_KEY)

    out[key] = function(context, payload)
    {
      const cacheKey = options.createCacheKey(getKey.call(this, context, payload))

      if (cacheKey !== cachedKeys[key])
      {
        cachedKeys[key] = cacheKey
        cachedResults[key] = handler.call(this, context, payload)
      }

      return cachedResults[key]
    }
  }

  return out
}

/**
 * Watches the given actions and invokes the callbacks passed in the options
 * of `VuexRouterActions`. If the result of an action is a promise - it is
 * watched and immediately invokes `onActionStart` followed by `onActionResolve`
 * or `onActionReject` and then `onActionEnd`. If the result of an action is
 * not a promise then `onActionStart` and `onActionEnd` are invoked immediately.
 * If there are no more watched actions being executed then `onActionsDone` is
 * invoked after the last `onActionEnd`.
 *
 * ```javascript
 * const plugin = VuexRouterActions({
 *    onActionStart (action, num) {},
 *    onActionEnd (action, num, result, resolved) {}
 * })
 *
 * const store = new Vuex.Store({
 *    plugins: [plugin],
 *    actions: {
 *      ...actionsWatch({
 *        loadThis (context, payload) {},
 *        loadThat (context, payload) {} // return a Promise
 *      })
 *    }
 * })
 * ```
 *
 * @param actions The actions to watch.
 */
export function actionsWatch <S, R>(actions: ActionTree<S, S>): ActionTree<S, S>
{
  const checkDone = (num: number) =>
  {
    if (++actionDone === num)
    {
      options.onActionsDone()
    }
  }

  return actionsIterate(actions, (action, key) =>
  {
    return function (context, payload)
    {
      const result = action.call( this, context, payload )
      const num: number = ++actionNum

      if (result instanceof Promise)
      {
        options.onActionStart(key, num)

        result.then(
          (resolved) => {
            options.onActionResolve(key, num, resolved)
            options.onActionEnd(key, num, resolved, true)
            checkDone(num)
          },
          (reason) => {
            options.onActionReject(key, num, reason)
            options.onActionEnd(key, num, reason, false)
            checkDone(num)
          }
        )
      }
      else
      {
        options.onActionStart(key, num)
        options.onActionEnd(key, num, result, true)
        checkDone(num)
      }

      return result
    }
  })
}

/**
 * Creates "protection" actions. These are functions which return a truthy or
 * falsy value and the action returned produces a Promise that is resolved or
 * rejected. This is useful when creating actions which load data for a route.
 * you can add protection actions before and/or after the loading actions so
 * it can validate the route path and afterwards validate whether the user
 * should be able to see the given route. If the protect action returns another
 * promise that promise is passed through, and whether it resolves or rejects
 * determines if the action stops or continues.
 *
 * ```javascript
 * const store = new Vuex.Store({
 *    actions: {
 *      loadUser (context, user_id) {}, // returns promise which loads user data, also commits user to state
 *      loadTask (context, task_id) {}, // returns promise which loads task data
 *
 *      // for actionBeforeRoute the to route is passed
 *      loadTaskPage ({dispatch}, to) {
 *        return dispatch('loadUser', to.params.user)
 *          .then(user => dispatch('hasUser'))
 *          .then(hasUser => dispatch('loadTask', to.params.task))
 *          .then(task => dispatch('canEditTask', task))
 *      },
 *
 *      ...actionsProtect({
 *        hasUser ({state}) { return state.user && !state.user.disabled },
 *        canEditTask ({state}, task) { return state.user.canEdit( task ) }
 *      })
 *    }
 * })
 * // Task page
 * const component = {
 *    ...actionBeforeRoute('loadTaskPage')
 * }
 * ```
 *
 * @param actions The actions which return truthy, falsy, or promises.
 */
export function actionsProtect <S, R>(actions: ActionTree<S, S>): ActionTree<S, S>
{
  return actionsIterate(actions, action =>
  {
    return function(context, payload)
    {
      const result = action.call( this, context, payload )

      return toPromise(result)
    }
  })
}

/**
 * Calls a mutation on a store when any of the passed actions are running and
 * when they stop. This provides an easy way to signal to the user when something
 * is loading, even a complex set of asynchronous actions.
 *
 * ```javascript
 * const store = new Vuex.Store({
 *    state: {
 *      loading: false
 *    },
 *    mutations: {
 *      setLoading (state, loading) {
 *        state.loading = loading
 *      }
 *    },
 *    actions: {
 *      ...actionsLoading('setLoading', {
 *        page1 (context, payload) {},
 *        page2 (context, payload) {}
 *      })
 *    }
 * })
 * ```
 *
 * @param mutation The mutation to call with true or false depending on
 *    whether an action passed is currently running.
 * @param actions The actions to watch.
 */
export function actionsLoading <S, R>(mutation: string, actions: ActionTree<S, S>): ActionTree<S, S>
{
  let loadingCount: number = 0
  let loading: boolean = false

  const start = () =>
  {
    loadingCount++
  }

  const end = () =>
  {
    loadingCount--
    check()
  }

  const check = () =>
  {
    let loadingNow: boolean = loadingCount > 0

    if (loadingNow !== loading)
    {
      assert(store !== undefined, ASSERT_STORE)

      store.commit(mutation, loading = loadingNow)
    }
  }

  return actionsIterate(actions, (action) =>
  {
    return function(context, payload)
    {
      const result = action.call( this, context, payload )

      if (result instanceof Promise)
      {
        start()
        result.then(end, end)
        check()
      }

      return result
    }
  })
}

// Iterates Vuex action input and returns a similar structure but with the handler replaced.
function actionsIterate <S, R>(actions: ActionTree<S, S>, getHandler: ActionHandlerTransform<S, S>): ActionTree<S, S>
{
  const iterated = Object.create(null)

  for (const key in actions)
  {
    const action = actions[key]

    if (isActionHandler(action))
    {
      iterated[key] = getHandler(action, key)
    }
    else if (isActionObject(action))
    {
      iterated[key] = {
        root: action.root,
        handler: getHandler(action.handler, key)
      }
    }
    else
    {
      assert(false, ASSERT_ACTION_INVALID)
    }
  }

  return iterated
}

// Converts the result to a promise. If its not a promise then its truthy value
// determines whether the returned promise is resolved or rejected.
function toPromise <T>(x: any): Promise<T>
{
  return x instanceof Promise ? x : (x ? Promise.resolve(x) : Promise.reject(x))
}

// Determines if the given input is a normal function action.
function isActionHandler <S, R>(x: any): x is ActionHandler<S, R>
{
  return typeof x === 'function'
}

// Determines if the given input is an action with an optional root and required
// handler function.
function isActionObject <S, R>(x: any): x is ActionObject<S, R>
{
  return typeof x === 'object' && typeof x.handler === 'function'
}

// Asserts the expecation, and when it's fasly throws an error.
function assert (expectation: boolean, message: string)
{
  if (!expectation) throw message
}