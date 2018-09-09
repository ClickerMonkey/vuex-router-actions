
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import { expect } from 'chai'

import * as Vue from 'vue'
import * as Vuex from 'vuex'

import VuexRouterActions, {
  actionsDestroy,
  actionsDestroyCache,
  actionBeforeRoute,
  actionOptional,
  actionsCachedConditional,
  actionsCached,
  actionsCachedResults,
  actionsWatch,
  actionsProtect,
  actionsLoading
} from '../src'

const DEFAULT_OPTIONS = {
  onActionStart: (action: string, num: number) => {},
  onActionReject: (action: string, num: number, reason: any) => {},
  onActionResolve: (action: string, num: number, resolved: any) => {},
  onActionEnd: (action: string, num: number, result: any, resolved: boolean) => {},
  onActionsDone: () => {},
  createCacheKey: (input: any) => JSON.stringify(input)
}


describe('actions', function()
{

  const VueTest: any = Vue

  before(function()
  {
    VueTest.use(Vuex)
  })

  beforeEach(function()
  {
    actionsDestroy()
  })

  it('actionsLoading', function(done)
  {
    const plugin = VuexRouterActions()

    type TestStore = {
      loading: boolean
    }

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
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
          loader: actionTimeout(2)
        })
      }
    })

    expect(store.state.loading).to.be.false

    store.dispatch('loader').then(() => {
      expect(store.state.loading).to.be.false
      done()
    })

    expect(store.state.loading).to.be.true
  })

  it('actionsLoading handler', function(done)
  {
    const plugin = VuexRouterActions()

    type TestStore = {
      loading: boolean
    }

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      state: {
        loading: false
      },
      mutations: {
        setLoading (state, loading) {
          state.loading = loading
        }
      },
      actions: {
        ...actionsLoading(
          (context, loading) => context.commit('setLoading', loading),
          {
            loader: actionTimeout(2)
          }
        )
      }
    })

    expect(store.state.loading).to.be.false

    store.dispatch('loader').then(() => {
      expect(store.state.loading).to.be.false
      done()
    })

    expect(store.state.loading).to.be.true
  })

  it('actionsCachedConditional', function()
  {
    const plugin = VuexRouterActions()

    type TestStore = {
      times: number
    }

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      state: {
        times: 0
      },
      mutations: {
        addTimes (state) {
          state.times++
        }
      },
      actions: {
        ...actionsCachedConditional({
          updateTimes: {
            isInvalid: ({state}) => state.times % 2 === 0,
            handler: ({commit}) => commit('addTimes')
          }
        })
      }
    })

    expect(store.state.times).to.equal(0)
    store.dispatch('updateTimes')
    expect(store.state.times).to.equal(1)
    store.dispatch('updateTimes')
    expect(store.state.times).to.equal(1)
    store.commit('addTimes')
    expect(store.state.times).to.equal(2)
    store.dispatch('updateTimes')
    expect(store.state.times).to.equal(3)
    store.dispatch('updateTimes')
    expect(store.state.times).to.equal(3)
  })

  it('actionsCached', function()
  {
    const plugin = VuexRouterActions()

    type TestStore = {
      times: number,
      id: string
    }

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      state: {
        times: 0,
        id: 'x'
      },
      mutations: {
        addTimes (state) {
          state.times++
        },
        setId (state, id) {
          state.id = id
        }
      },
      actions: {
        ...actionsCached({
          updateTimes: {
            getKey: ({state}) => state.id,
            handler: ({commit}) => commit('addTimes')
          }
        })
      }
    })

    expect(store.state.times).to.equal(0)
    store.dispatch('updateTimes')
    expect(store.state.times).to.equal(1)
    store.dispatch('updateTimes')
    expect(store.state.times).to.equal(1)
    store.commit('setId', 'y')
    expect(store.state.times).to.equal(1)
    store.dispatch('updateTimes')
    expect(store.state.times).to.equal(2)
    store.dispatch('updateTimes')
    expect(store.state.times).to.equal(2)
  })

  it('actionsCached custom', function()
  {
    const plugin = VuexRouterActions()

    type TestStore = {
      times: number,
      id: string
    }

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      state: {
        times: 0,
        id: 'x'
      },
      mutations: {
        addTimes (state) {
          state.times++
        },
        setId (state, id) {
          state.id = id
        }
      },
      actions: {
        ...actionsCached({
          updateTimes: {
            getKey: ({state}, payload) => payload,
            handler: ({commit}) => commit('addTimes')
          }
        }, {
          createCacheKey (x: any): string {
            return x.length
          }
        })
      }
    })

    expect(store.state.times).to.equal(0)
    store.dispatch('updateTimes', [1, 2, 3])
    expect(store.state.times).to.equal(1)
    store.dispatch('updateTimes', [4, 5, 6])
    expect(store.state.times).to.equal(1)
    store.dispatch('updateTimes', [1, 2])
    expect(store.state.times).to.equal(2)
    store.dispatch('updateTimes', [3, 4])
    expect(store.state.times).to.equal(2)
  })

  it('actionsCachedResults', function()
  {
    const plugin = VuexRouterActions()

    type TestStore = {
      parent: {
        id: string,
        children: { [key: string]: string }
      }
    }

    let childLoads: number = 0
    let childAdds: number = 0

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      state: {
        parent: {
          id: '1',
          children: {}
        }
      },
      mutations: {
        setParent(state, id) {
          state.parent = { id, children: {} }
        },
        addChild (state, child) {
          childAdds++
          state.parent.children[child.id] = child
        }
      },
      actions: {
        loadChild (context, child_id) {
          childLoads++
          const child = { id: child_id }
          context.commit('addChild', child)
          return child
        },
        ...actionsCachedResults({
          getChild: {
            getKey: ({state}) => state.parent.id,
            getResultKey: (context, child_id) => child_id,
            handler: ({dispatch}, child_id) => dispatch('loadChild', child_id)
          }
        })
      }
    })

    expect(childLoads).to.equal(0)
    expect(childAdds).to.equal(0)

    store.dispatch('getChild', 23)

    expect(childLoads).to.equal(1)
    expect(childAdds).to.equal(1)

    store.dispatch('getChild', 23)

    expect(childLoads).to.equal(1)
    expect(childAdds).to.equal(1)

    store.dispatch('getChild', 45)

    expect(childLoads).to.equal(2)
    expect(childAdds).to.equal(2)

    store.commit('setParent', '6')

    expect(childLoads).to.equal(2)
    expect(childAdds).to.equal(2)

    store.dispatch('getChild', 23)

    expect(childLoads).to.equal(3)
    expect(childAdds).to.equal(3)

    store.dispatch('getChild', 45)

    expect(childLoads).to.equal(4)
    expect(childAdds).to.equal(4)

  })

  it('actionsWatch', function(done)
  {
    let started = 0
    let ended = 0

    const plugin = VuexRouterActions({
      onActionStart(key, num) {
        started++
      },
      onActionEnd(key, num) {
        ended++
      }
    })

    type TestStore = {}

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      actions: {
        ...actionsWatch({
          immediate: (context, payload) => 456,
          promised: actionTimeout(10)
        })
      }
    })

    expect(started).to.equal(0)
    expect(ended).to.equal(0)

    store.dispatch('immediate')

    expect(started).to.equal(1)
    expect(ended).to.equal(1)

    store.dispatch('promised')
      .then(() => {
        expect(started).to.equal(2)
        expect(ended).to.equal(2)
        done()
      })

    expect(started).to.equal(2)
    expect(ended).to.equal(1)
  })

  it('actionsWatch custom', function(done)
  {
    let pluginStarted = 0
    let pluginEnded = 0
    let watchEnded = 0

    const plugin = VuexRouterActions({
      onActionStart (key, num, context, payload) {
        pluginStarted++
      },
      onActionEnd (key, num, context, payload) {
        pluginEnded++
      }
    })

    type TestStore = {}

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      actions: {
        ...actionsWatch({
          immediate: (context, payload) => 456,
          promised: actionTimeout(10)
        }, {
          onActionEnd(key, num, context, payload) {
            watchEnded++
          }
        })
      }
    })

    expect(pluginStarted).to.equal(0)
    expect(pluginEnded).to.equal(0)
    expect(watchEnded).to.equal(0)

    store.dispatch('immediate')

    expect(pluginStarted).to.equal(1)
    expect(pluginEnded).to.equal(0)
    expect(watchEnded).to.equal(1)

    store.dispatch('promised')
      .then(() => {
        expect(pluginStarted).to.equal(2)
        expect(pluginEnded).to.equal(0)
        expect(watchEnded).to.equal(2)
        done()
      })

    expect(pluginStarted).to.equal(2)
    expect(pluginEnded).to.equal(0)
    expect(watchEnded).to.equal(1)
  })

  it('actionsWatch localDone', function(done)
  {
    let pluginDone = 0
    let localDone = 0

    const plugin = VuexRouterActions({
      onActionsDone() {
        pluginDone++
      }
    })

    type TestStore = {}

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      actions: {
        ...actionsWatch({
          pluginAction: actionTimeout(5)
        }),
        ...actionsWatch({
          localAction: actionTimeout(10)
        }, {
          onActionsDone() {
            localDone++
          }
        })
      }
    })

    expect(pluginDone).to.equal(0)
    expect(localDone).to.equal(0)

    const p1 = store.dispatch('pluginAction')
    const p2 = store.dispatch('localAction')

    expect(pluginDone).to.equal(0)
    expect(localDone).to.equal(0)

    p1.then(() => {
      expect(pluginDone).to.equal(1)
      expect(localDone).to.equal(0)
    })

    p2.then(() => {
      expect(pluginDone).to.equal(1)
      expect(localDone).to.equal(1)
      done()
    })
  })

  it('actionsProtect', function(done)
  {
    const plugin = VuexRouterActions()

    type TestStore = {
      times: number
    }

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      state: {
        times: 0
      },
      mutations: {
        setTimes(state, times) {
          state.times = times
        }
      },
      actions: {
        ...actionsProtect({
          isEven: ({state}) => state.times % 2 === 0
        })
      }
    })

    store.dispatch('isEven')
      .then(
        resolved => {
          store.commit('setTimes', 1)
          store.dispatch('isEven')
            .then(
              resolved => {
                expect(false).to.be.true
              },
              reason => {
                done()
              }
            )
        },
        reason => {
          expect(false).to.be.true
        }
      )

  })

  it('actionsDestroyCache actionsCached', function()
  {
    const plugin = VuexRouterActions()

    type TestStore = {}

    let refreshes: number = 0

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      actions: {
        ...actionsCached({
          refresh: {
            getKey: () => 23,
            handler: () => ++refreshes
          }
        })
      }
    })

    expect(refreshes).to.equal(0)

    store.dispatch('refresh')

    expect(refreshes).to.equal(1)

    store.dispatch('refresh')

    expect(refreshes).to.equal(1)

    actionsDestroyCache()

    expect(refreshes).to.equal(1)

    store.dispatch('refresh')

    expect(refreshes).to.equal(2)

    store.dispatch('refresh')

    expect(refreshes).to.equal(2)
  })

  it('actionsDestroyCache actionsCachedConditional', function()
  {
    const plugin = VuexRouterActions()

    type TestStore = {}

    let refreshes: number = 0

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      actions: {
        ...actionsCachedConditional({
          refresh: {
            isInvalid: () => false,
            handler: () => ++refreshes
          }
        })
      }
    })

    expect(refreshes).to.equal(0)

    store.dispatch('refresh')

    expect(refreshes).to.equal(1)

    store.dispatch('refresh')

    expect(refreshes).to.equal(1)

    actionsDestroyCache()

    expect(refreshes).to.equal(1)

    store.dispatch('refresh')

    expect(refreshes).to.equal(2)

    store.dispatch('refresh')

    expect(refreshes).to.equal(2)
  })

  it('actionsDestroyCache actionsCachedResults', function()
  {
    const plugin = VuexRouterActions()

    type TestStore = {}

    let refreshes: number = 0

    const store = new Vuex.Store<TestStore>({
      plugins: [plugin],
      actions: {
        ...actionsCachedResults({
          refresh: {
            getKey: () => 34,
            getResultKey: () => 12,
            handler: () => ++refreshes
          }
        })
      }
    })

    expect(refreshes).to.equal(0)

    store.dispatch('refresh')

    expect(refreshes).to.equal(1)

    store.dispatch('refresh')

    expect(refreshes).to.equal(1)

    actionsDestroyCache()

    expect(refreshes).to.equal(1)

    store.dispatch('refresh')

    expect(refreshes).to.equal(2)

    store.dispatch('refresh')

    expect(refreshes).to.equal(2)
  })

})

function actionTimeout(time)
{
  return function (context, payload) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time)
    })
  }
}
