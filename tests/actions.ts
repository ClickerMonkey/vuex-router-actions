
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import { expect } from 'chai'

import * as Vue from 'vue'
import * as Vuex from 'vuex'

import VuexRouterActions, {
  actionsDestroy,
  actionBeforeRoute,
  actionOptional,
  actionsCachedConditional,
  actionsCached,
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

})

function actionTimeout(time)
{
  return function (context, payload) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time)
    })
  }
}
