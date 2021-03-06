import { Store, Action, ActionTree, ActionContext } from 'vuex';
export declare type ActionHandler<S, R> = (injectee: ActionContext<S, R>, payload: any) => any;
export declare type ActionHandlerTransform<S, R> = (handler: ActionHandler<S, R>, key: string) => ActionHandler<S, R>;
export interface ActionObject<S, R> {
    root?: boolean;
    handler: ActionHandler<S, R>;
}
export interface ActionCache<S, R> {
    getKey: (injectee: ActionContext<S, R>, payload: any) => any;
    action: Action<S, R>;
    onFree?: (result: any) => any;
}
export interface ActionCaches<S, R> {
    [key: string]: ActionCache<S, R>;
}
export interface ActionResultCache<S, R> {
    getKey?: (injectee: ActionContext<S, R>, payload: any) => any;
    getResultKey: (injectee: ActionContext<S, R>, payload: any) => any;
    action: Action<S, R>;
    onFree?: (result: any) => any;
}
export interface ActionResultCaches<S, R> {
    [key: string]: ActionResultCache<S, R>;
}
export interface ActionCacheConditional<S, R> {
    isInvalid: (injectee: ActionContext<S, R>, payload: any) => any;
    action: Action<S, R>;
    onFree?: (result: any) => any;
}
export interface ActionCacheConditionals<S, R> {
    [key: string]: ActionCacheConditional<S, R>;
}
export declare type ActionRouteOtherwise = (to: any, from: any, rejectReason: any, store: any, action: any) => any;
export declare type ActionRouteName = string;
export declare type ActionRouteNameCallback = (to: any, from: any, store: any) => string;
export declare type ActionRouteNameInput = ActionRouteName | ActionRouteNameCallback;
export declare type ActionLoadingHandler<S, R> = (injectee: ActionContext<S, R>, loading: boolean) => any;
export declare type ActionLoadingInput<S, R> = string | ActionLoadingHandler<S, R>;
export interface ActionsPluginOptions extends ActionsWatchOptions {
    createCacheKey(input: any): string;
}
export interface ActionsWatchOptions {
    onActionStart<S, R>(action: string, num: number, injectee: ActionContext<S, R>, payload: any): any;
    onActionReject<S, R>(action: string, num: number, injectee: ActionContext<S, R>, payload: any, reason: any): any;
    onActionResolve<S, R>(action: string, num: number, injectee: ActionContext<S, R>, payload: any, resolved: any): any;
    onActionEnd<S, R>(action: string, num: number, injectee: ActionContext<S, R>, payload: any, result: any, resolved: boolean): any;
    onActionsDone<S, R>(injectee: ActionContext<S, R>): any;
}
export interface ActionsCacheOptions {
    createCacheKey(input: any): string;
}
export declare type ActionsCacheDestroyer = () => any;
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
 *   onActionStart (action, num, context, payload) {},
 *   onActionEnd (action, num, contact, payload, result, resolved) {}
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
export default function (_options?: Partial<ActionsPluginOptions>): (_store: Store<any>) => void;
/**
 * Destroys the plugin so it can be added to another store. This should only
 * be used for testing purposes.
 */
export declare function actionsDestroy(): void;
/**
 * Generates the default options for the plugin.
 */
export declare function actionsDefaultOptions(): ActionsPluginOptions;
/**
 * This function destroys all caches created with `actionsCached`,
 * `actionsCachedConditional`, and `actionsCachedResults`. This is a necessary
 * function when you are implementing something like a Sign Out function in
 * your app.
 */
export declare function actionsDestroyCache(): void;
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
 *   ...actionBeforeRoute('loadMyPage', (to, from, rejectReason, store, action) => {
 *      return '/path/i/can/goto/perhaps/previous/which/also/does/check'
 *   })
 * }
 * </script>
 * ```
 *
 * @param actionInput The action to dispatch on the store and wait for.
 * @param getOtherwise Where to go if the dispatched action is a reject.
 */
export declare function actionBeforeRoute(actionInput: ActionRouteNameInput, getOtherwise?: ActionRouteOtherwise): {
    beforeRouteEnter: (to: any, from: any, next: any) => void;
    beforeRouteUpdate: (to: any, from: any, next: any) => void;
};
/**
 * Dispatches an action in the store and optionally waits for the action to
 * finish before leaving the current component (see `beforeRouteLeave` in
 * `vue-router`).
 *
 * ```javascript
 * // MyPage.vue
 * <script>
 * import { actionBeforeLeave } from 'vuex-router-actions'
 *
 * export default {
 *   ...actionBeforeLeave('unloadMyPage')
 * }
 * </script>
 * ```
 *
 * @param actionInput The action to dispatch on the store and optionally wait for.
 * @param waitForFinish If the unload action should finish before the component
 *    is left.
 */
export declare function actionBeforeLeave(actionInput: ActionRouteNameInput, waitForFinish?: boolean): {
    beforeRouteLeave: (to: any, from: any, next: any) => void;
};
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
export declare function actionOptional<T>(promise: Promise<T>, resolveOnReject?: () => any): Promise<T>;
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
 *          action: (context, payload) => null // some result that can be cached
 *        }
 *      })
 *    }
 * })
 * ```
 *
 * @param actions The actions to conditionally cache.
 */
export declare function actionsCachedConditional<S = any>(actions: ActionCacheConditionals<S, S>): ActionTree<S, S>;
/**
 * Produce an action with cached results based on some condition. The action will
 * always run the first time.
 *
 * ```javascript
 * const store = new Vuex.Store({
 *    actions: {
 *      loadPage: actionCachedConditional({
 *        isInvalid: (context, payload) => true, // look at store, getters, payload, etc
 *        action: (context, payload) => null // some result that can be cached
 *      })
 *    }
 * })
 * ```
 *
 * @param input The action to conditionally cache.
 */
export declare function actionCachedConditional<S = any>(input: ActionCacheConditional<S, S>): Action<S, S>;
/**
 * Produces actions with cached results based on some cache key. The action will
 * always run the first time. The cached results of the action are "cleared"
 * when a different key is returned for a given action.
 *
 * ```javascript
 * const store = new Vuex.Store({
 *    actions: {
 *      ...actionsCached({
 *        loadPage: {
 *          getKey: (context, payload) => payload, // look at store, getters, payload, etc
 *          action: (context, payload) => null // some result that can be cached
 *        }
 *      })
 *    }
 * })
 * ```
 *
 * @param actions The actions to cache.
 * @param cache Cache options to override the global options passed to the
 *    plugin. If an option is not passed in the input it defaults to the
 *    equivalent plugin option.
 */
export declare function actionsCached<S = any>(actions: ActionCaches<S, S>, cache?: Partial<ActionsCacheOptions>): ActionTree<S, S>;
/**
 * Produces actions with cached results based on some cache key. The action will
 * always run the first time. The cached results of the action are "cleared"
 * when a different key is returned for a given action.
 *
 * ```javascript
 * const store = new Vuex.Store({
 *    actions: {
 *      loadPage: actionCached({
 *        getKey: (context, payload) => payload, // look at store, getters, payload, etc
 *        action: (context, payload) => null // some result that can be cached
 *      })
 *    }
 * })
 * ```
 *
 * @param actions The actions to cache.
 * @param cache Cache options to override the global options passed to the
 *    plugin. If an option is not passed in the input it defaults to the
 *    equivalent plugin option.
 */
export declare function actionCached<S = any>(input: ActionCache<S, S>, cache?: Partial<ActionsCacheOptions>): Action<S, S>;
/**
 * Produces actions with multiple cached results. Each action has a `getKey`
 * function which is optional - when the result of that function changes it
 * clears the cache for all the results for that action. Each action has a
 * required `getResultKey` function which is unique to that action call - and
 * if that key has not ran for that action it is ran, otherwise the cached
 * result is returned.
 *
 * @param actions The actions to cache all the results of.
 * @param cache Cache options to override the global options passed to the
 *    plugin. If an option is not passed in the input it defaults to the
 *    equivalent plugin option.
 */
export declare function actionsCachedResults<S = any>(actions: ActionResultCaches<S, S>, cache?: Partial<ActionsCacheOptions>): ActionTree<S, S>;
/**
 * Produce an action with multiple cached results. The action has a `getKey`
 * function which is optional - when the result of that function changes it
 * clears the cache for all the results for that action. Each action has a
 * required `getResultKey` function which is unique to that action call - and
 * if that key has not ran for that action it is ran, otherwise the cached
 * result is returned.
 *
 * @param actions The action to cache all the results of.
 * @param cache Cache options to override the global options passed to the
 *    plugin. If an option is not passed in the input it defaults to the
 *    equivalent plugin option.
 */
export declare function actionCachedResults<S = any>(input: ActionResultCache<S, S>, cache?: Partial<ActionsCacheOptions>): Action<S, S>;
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
 * @param watch Watch options to override the global options passed to the
 *    plugin. If an option is not passed in the input it defaults to the
 *    equivalent plugin option.
 */
export declare function actionsWatch<S = any>(actions: ActionTree<S, S>, watch?: Partial<ActionsWatchOptions>): ActionTree<S, S>;
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
export declare function actionsProtect<S = any>(actions: ActionTree<S, S>): ActionTree<S, S>;
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
export declare function actionsLoading<S = any>(input: ActionLoadingInput<S, S>, actions: ActionTree<S, S>): ActionTree<S, S>;
