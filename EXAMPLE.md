# Example

The following example is to illustrate how all of these functions are used to create an app.

# App

This App will be a clone of Slack. Slack is a communication App with groups, channels, and messages.
This example will utilize Typescript but should easily be converted to plain Babel, JS, etc.
The app will utilize `Vue`, `Vuex`, `VueRouter`, and `VuexRouterActions`

## Project Structure

- [Models.ts](#models)
- [State.ts](#state)
- [Router.ts](#router)
- [Store.ts](#store)
- [Debug.ts](#debug)
- **pages/**
  - [SignInPage.vue](#signinpage-vue)
  - [HomePage.vue](#homepage-vue)
  - [GroupPage.vue](#grouppage-vue)
  - [ChannelPage.vue](#channelpage-vue)
- **actions/**
  - [Loaders.ts](#loaders)
  - [Protectors.ts](#protectors)
  - [Pages.ts](#pages)
  - [Getters.ts](#getters)
- **mutations/**
  - [Setters.ts](#setters)
  - [Auth.ts](#auth)

## Models

Lets get the models out of the way so we all understand the structure of this app:

```typescript
// Models.ts
export class User {
  id: string
  name: string
  picture: string
  group_ids: string[]
  // loaded through actions
  groups: Group[] = []
}
export class Group {
  id: string
  name: string
  user_ids: string[]
  channel_ids: string[]
  // loaded through actions
  users: User[] = []
  channels: Channel[] = []
}
export class Channel {
  id: string
  name: string
  user_ids: string[]
  // loaded through actions
  users: User[] = []
}
export class Message[] {
  id: string
  message: string
  user_id: string
  // loaded through actions
  user: User
}
```

## State

Since this example uses TypeScript, I like to use an interface to keep my `Vuex.Store` state typed

```typescript
// SlackState.ts
export interface SlackState {
  loading: boolean
  user_id: string
  user: User
  group: Group // currently viewed group
  channel: Channel // currently viewed channel
  messages: Message // current viewed messages in channel
}
export function getDefaultState(): SlackState {
  return {
    loading: false,
    user_id: null,
    user: null,
    group: null,
    channel: null,
    messages: null
  }
}
```

## Routes

The following routes describe the pages in the App
- `/`: The default page, shows your groups
- `/:group`: A group page, no channel is selected
- `/:group/channel/:channel`: A channel page with messages
- `/sign-in`: The page when you are not signed in

## Router

We're using vue-router and we're doing nested routes, so this file is very straightforward.

```typescript
// Router.ts

import Vue from 'vue'
import Router from 'vue-router'
import SignInPage from './pages/SignInPage.vue'
import HomePage from './pages/HomePage.vue'
import GroupPage from './pages/GroupPage.vue'
import ChannelPage from './pages/ChannelPage.vue'

export const router = new Router({
  routes: [
    {
      path: '/sign-in',
      component: SignInPage
    },
    {
      path: '/',
      component: HomePage
    },
    {
      path: '/:group',
      component: GroupPage,
      children: [
        {
          path: 'channel/:channel',
          component: ChannelPage
        }
      ]
    }
  ]
})
```

## Store

Finally the Vuex store! This will contant the states, mutations, and actions necessary to load data. This file references objects and constants stored in files that are defined below.

```typescript
import Vuex from 'vuex'
import VuexRouterActions, { actionsWatch } from 'vuex-router-actions'

import { DEBUG_OPTIONS } from './Debug'
import { SlackState, getDefaultState } from './State'
import { setters } from './mutations/Setters'
import { auths } from './mutations/Auth'
import { getters } from './actions/Getters'
import { loaders } from './actions/Loaders'
import { protects } from './actions/Protectors'
import { pages } from './actions/Pages'

export const plugin = VuexRouterActions( DEBUG_OPTIONS )

export const store = new VuexStore<SlackState>({
  plugins: [plugin],
  state: getDefaultState(),
  mutations: {
    ...setters,
    ...auths
  },
  actions: actionsWatch({
    ...getters,
    ...loaders,
    ...protects,
    ...pages
  })
})
```

## Debug

```typescript
// Debug.ts
export const DEBUG = process.env.NODE_ENV !== 'production'

export const DEBUG_FUNCTION = (name: string) => {
  return function() {
    console.debug(name, arguments)
  }
}

export const DEBUG_OPTIONS = !DEBUG
  ? undefined
  : {
    onActionStart: DEBUG_FUNCTION('onActionStart'),
    onActionResolve: DEBUG_FUNCTION('onActionResolve'),
    onActionReject: DEBUG_FUNCTION('onActionReject'),
    onActionEnd: DEBUG_FUNCTION('onActionEnd'),
    onActionsDone: DEBUG_FUNCTION('onActionsDone'),
  }

```

## App.vue

```vue
<template>
  <!-- loading -->
</template>
<script>
import { mapState } from 'vuex'
import { router } from './Router'
import { store } from './Store'

export default {
  store,
  router,
  computed: {
    ...mapState(['loading'])
  }
}
</script>
```

## SignInPage.vue

```vue
<template>
  <!-- signIn({username, password}) -->
</template>
<script>
import { mapMutations } from 'vuex'
import { auth } from './mutations/Auth'

export default {
  data() {
    return { username: '', password: '' }
  },
  methods: {
    ...mapMutations([auth.SIGN_IN])
  }
}
</script>
```

## HomePage.vue

```vue
<template>
  <!-- user, user.groups, viewGroup(), signOut() -->
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { actionBeforeRoute } from 'vuex-router-actions'
import { page } from './actions/Pages'
import { auth } from './mutations/Auth'

export default {
  ...actionBeforeRoute(page.HOME),
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapMutations([auth.SIGN_OUT]),
    viewGroup(group) {
      this.$router.push('/' + group.id)
    }
  }
}
</script>
```

## GroupPage.vue

```vue
<template>
  <!-- user, group, group.channels, viewChannel() -->
</template>
<script>
import { mapState } from 'vuex'
import { actionBeforeRoute } from 'vuex-router-actions'
import { page } from './actions/Pages'

export default {
  ...actionBeforeRoute(page.GROUP),
  computed: {
    ...mapState(['user', 'group'])
  },
  methods: {
    viewChannel(channel) {
      this.$router.push('/' + this.group.id + '/channel/' + channel.id)
    }
  }
}
</script>
```

## ChannelPage.vue

```vue
<template>
  <!-- user, group, channel, messages -->
</template>
<script>
import { mapState } from 'vuex'
import { actionBeforeRoute } from 'vuex-router-actions'
import { page } from './actions/Pages'

export default {
  ...actionBeforeRoute(page.CHANNEL),
  computed: {
    ...mapState(['user', 'group', 'channel', 'messages'])
  }
}
</script>
```

## Pages

```typescript
// actions/Pages.ts
import { actionsLoading } from 'vuex-router-actions'
import { setter } from '../mutations/Setters'
import { loader } from './Loaders'
import { protect } from './Protectors'

export const page = {
  HOME: 'pageHome',
  GROUP: 'pageGroup',
  CHANNEL: 'pageChannel'
}

export const pages = actionsLoading(setter.LOADING, {
  // load the user based on ID, check they are valid, then set the user to the store and load its groups from group_ids
  [page.HOME] ({dispatch, state}, {params}) {
    return dispatch(loader.USER, state.user_id)
      .then(user => dispatch(protect.HOME)
        .then(a => commit(setter.USER, user))
        .then(b => dispatch(loader.USER_GROUPS, user))
      )
  },
  // load the home, then based on the route load the group, check for access, and if it passes set the group to the store and load the groups users and channels
  [page.GROUP] ({dispatch}, {params}) {
    return dispatch(page.HOME)
      .then(user => dispatch(loader.GROUP, params.group))
      .then(group => dispatch(protect.GROUP, group)
        .then(a => commit(setter.GROUP, group))
        .then(b => dispatch(loader.GROUP_USERS, group))
        .then(c => dispatch(loader.GROUP_CHANNELS, group))
      )
  },
  // load the group, then based on the route load the channel, check for access, and if it passes set the channel to the store and load the channel users and messages
  [page.CHANNEL] ({dispatch}, {params}) {
    return dispatch(page.GROUP)
      .then(group => dispatch(loader.CHANNEL, params.channel))
      .then(channel => dispatch(protect.CHANNEL, channel)
        .then(a => commit(setter.CHANNEL, channel))
        .then(b => dispatch(loader.CHANNEL_USERS, channel))
        .then(c => dispatch(loader.CHANNEL_MESSAGES, channel))
        .then(messages => dispatch(loader.MESSAGES_USERS, messages)
          .then(d => commit(setter.MESSAGES, messages))
        )
      )
  }
})
```

## Protectors

```typescript
// actions/Protectors.ts
import { actionsProtect } from 'vuex-router-actions'
import { setter } from '../mutations/Setters'

export const protect = {
  HOME: 'protectHome',
  GROUP: 'protectGroup',
  CHANNEL: 'protectChannel'
}

export const protects = actionsProtect({
  [protect.HOME] ({state}) {
    return state.user_id && state.user
  },
  [protect.GROUP] ({state}, group: Group) {
    return group.user_ids.indexOf(state.user_id) !== -1
  },
  [protect.CHANNEL] ({state}, channel: Channel) {
    return channel.user_ids.indexOf(state.user_id) !== -1
  }
})
```

## Loaders

```typescript
// actions/Loaders.ts
import { actionsCached } from 'vuex-router-actions'
import { getter } from './Getters'

export const loader = {
  USER: 'loadUser',
  USER_GROUPS: 'loadUserGroups',
  GROUP: 'loadGroup',
  GROUP_USERS: 'loadGroupUser',
  GROUP_CHANNELS: 'loadGroupChannels',
  CHANNEL: 'loadChannel',
  CHANNEL_USERS: 'loadChannelUsers',
  CHANNEL_MESSAGES: 'loadChannelMessages',
  MESSAGES_USERS: 'loadMessagesUsers'
}

export const loaders = actionsCached({
  [loader.USER]: {
    getKey: (context, user_id) => user_id,
    handler: ({dispatch}, user_id) => dispatch(getter.USER, user_id)
  },
  [loader.USER_GROUPS]: {
    getKey: (context, user) => user.group_ids,
    handler: ({dispatch}, user) => Promise.all(user.group_ids.map(
      (id, index) => dispatch(getter.GROUP, id).then(group => user.groups[index] = group)
    ))
  },
  [loader.GROUP]: {
    getKey: (context, group_id) => group_id,
    handler: ({dispatch}, group_id) => dispatch(getter.GROUP, group_id)
  },
  [loader.GROUP_USERS]: {
    getKey: (context, group) => group.user_ids,
    handler: ({dispatch}, user) => Promise.all(group.user_ids.map(
      (id, index) => dispatch(getter.USER, id).then(user => group.users[index] = user)
    ))
  },
  [loader.GROUP_CHANNELS]: {
    getKey: (context, group) => group.channel_ids,
    handler: ({dispatch}, group) => Promise.all(group.channel_ids.map(
      (id, index) => dispatch(getter.CHANNEL, id).then(channel => user.channels[index] = channel)
    ))
  },
  [loader.CHANNEL]: {
    getKey: (context, channel_id) => channel_id,
    handler: ({dispatch}, channel_id) => dispatch(getter.CHANNEL, channel_id)
  },
  [loader.CHANNEL_USERS]: {
    getKey: (context, channel) => channel.user_ids,
    handler: ({dispatch}, channel) => Promise.all(channel.user_ids.map(
      (id, index) => dispatch(getter.USER, id).then(user => channel.users[index] = user)
    ))
  },
  [loader.CHANNEL_MESSAGES]: {
    getKey: (context, channel) => channel.id,
    handler: ({dispatch}, channel) => dispatch(getter.MESSAGES, channel)
  },
  [loader.MESSAGES_USERS]: {
    getKey: (context, messages) => Math.random(),
    handler: ({dispatch}, messages) => Promise.all(messages.map(
      m => dispatch(getter.USER, m.user_id).then(user => m.user = user)
    ))
  }
})
```

## Getters

```typescript
// actions/Getters.ts
import { actionsCacheResults } from 'vuex-router-actions'

export const getter = {
  USER: 'getUser',
  GROUP: 'getGroup',
  CHANNEL: 'getChannel',
  MESSAGES: 'getMessages'
}

export const getters = actionsCacheResults({
  [getter.USER]: {
    getKey: (context, id) => id,
    handler: ({dispatch}, id) => {
      // TODO return Promise which resolves a User instance with the given ID
    }
  },
  [getter.GROUP]: {
    getKey: (context, id) => id,
    handler: ({dispatch}, id) => {
      // TODO return Promise which resolves a Group instance with the given ID
    }
  },
  [getter.CHANNEL]: {
    getKey: (context, id) => id,
    handler: ({dispatch}, id) => {
      // TODO return Promise which resolves a Channel instance with the given ID
    }
  },
  [getter.MESSAGES]: {
    getKey: (context, channel) => channel.id,
    handler: ({dispatch}, channel) => {
      // TODO return Promise which resolves a Message[] array with the last N messages in the given channel
    }
  }
})
```

## Setters

```typescript
// mutations/Setters.ts
import { SlackState } from '../State'

export const setter = {
  USER: 'setUser',
  GROUP: 'setGroup',
  CHANNEL: 'setChannel',
  MESSAGES: 'setMessages',
  LOADING: 'setLoading'
}

export const setters = {
  [setter.USER] (state: SlackState, user: User) {
    state.user = user
  },
  [setter.GROUP] (state: SlackState, group: Group) {
    state.group = group
  },
  [setter.USER] (state: SlackState, channel: Channel) {
    state.channel = channel
  },
  [setter.MESSAGES] (state: SlackState, messages: Message[]) {
    state.messages = messages
  },
  [setter.LOADING] (state: SlackState, loading: boolean) {
    state.loading = loading
  }
}
```

## Auth

```typescript
// mutations/Auth.ts
import { SlackState, getDefaultState } from '../State'
import { store } from '../Store'

export const auth = {
  SIGN_OUT: 'signOut',
  SIGN_IN: 'signIn'
}

export const auths = {
  [auth.SIGN_OUT] (state: SlackState) {
    store.replaceState(getDefaultState())
  },
  [auth.SIGN_IN] (state: SlackState, {username, password}) {
    // TODO takes username and password and does something with it. this might be better as an action
  }
}
```
