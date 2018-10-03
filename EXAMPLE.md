# Example

The following example is to illustrate how all of these functions are used to create an app.

# App

This App will be a clone of Slack. Slack is a communication App with groups, channels, and messages.
This example will utilize Typescript but should easily be converted to plain Babel, JS, etc.
The app will utilize `Vue`, `Vuex`, `VueRouter`, and `VuexRouterActions`

## Concepts

- **Get**: An action which fetches data from an API. The result of the action is Promise which resolves the fetched data.
- **Set**: A mutation which is given a gotten value and applies it to the store state.
- **Load**: An action which calls get many times and returns an array of values
- **Relate**: An action which calls one or more gets or loads and populates references and relationships.
- **Protect**: An action which analyzes the state and a desired route to determine if the user can proceed to that route.
- **Page**: An action which does everything that needs to be done for a page:
  - Load parent page if one exists
  - Load data identified in route
  - Do preliminary checks to see if user can go to route
  - Load the remaining data for the page
  - Do a final check based on the loaded data
  - Apply the loaded data to the state
  - *The page loads!*
- **Session**: Mutations used to modify the user's session/store state

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
  - [Gets.ts](#gets)
  - [Loads.ts](#loads)
  - [Relates.ts](#relates)
  - [Protects.ts](#protects)
  - [Pages.ts](#pages)
- **mutations/**
  - [Sets.ts](#sets)
  - [Session.ts](#session)

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
import { sets } from './mutations/Sets'
import { sessions } from './mutations/Session'
import { gets } from './actions/Gets'
import { relates } from './actions/Relates'
import { loads } from './actions/Loads'
import { protects } from './actions/Protects'
import { pages } from './actions/Pages'

export const plugin = VuexRouterActions( DEBUG_OPTIONS )

export const store = new Vuex.Store<SlackState>({
  plugins: [plugin],
  state: getDefaultState(),
  mutations: {
    ...sets,
    ...sessions
  },
  actions: actionsWatch({
    ...gets,
    ...loads,
    ...relates,
    ...protects,
    ...pages
  })
})
```

## Debug

This file offers some simple logging

```typescript
// Debug.ts
import { ActionsPluginOptions } from 'vuex-router-actions'

export const DEBUG = process.env.NODE_ENV !== 'production'

export const DEBUG_FUNCTION = (name: string) => {
  return function() {
    console.debug(name, arguments)
  }
}

export const DEBUG_OPTIONS: Partial<ActionsPluginOptions> | undefined = !DEBUG
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
import { session } from './mutations/Session'

export default {
  data: vm => ({
    username: '',
    password: ''
  }),
  methods: {
    ...mapMutations([session.SIGN_IN])
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
import { session } from './mutations/session'

export default {
  ...actionBeforeRoute(page.HOME,
    () => '/sign-in' // if we don't have a user, go to sign-in
  ),
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapMutations([session.SIGN_OUT]),
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
  ...actionBeforeRoute(page.GROUP,
    () => '/' // if we can't see this group, go to home page
  ),
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
  ...actionBeforeRoute(page.CHANNEL,
    (to) => '/' + to.params.group // if we can't see this channel, go to group page
  ),
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
import { set } from '../mutations/Sets'
import { relate } from './Relates'
import { protect } from './Protects'

export const page = {
  HOME: 'pageHome',
  GROUP: 'pageGroup',
  CHANNEL: 'pageChannel'
}

export const pages = actionsLoading(set.LOADING, {
  // load the user based on ID, check they are valid, then set the user to the store and load its groups from group_ids
  [page.HOME] ({dispatch, state}, {to}) {
    return dispatch(get.USER, state.user_id)
      .then(user => dispatch(protect.HOME)
        .then(() => dispatch(relate.USER_GROUPS, user))
        .then(() => commit(set.USER, user))
      )
  },
  // load the home, then based on the route load the group, check for access, and if it passes set the group to the store and load the groups users and channels
  [page.GROUP] ({dispatch}, {to}) {
    return dispatch(page.HOME)
      .then(() => dispatch(get.GROUP, to.params.group))
      .then(group => dispatch(protect.GROUP, group)
        .then(() => dispatch(relate.GROUP_USERS, group))
        .then(() => dispatch(relate.GROUP_CHANNELS, group))
        .then(() => commit(set.GROUP, group))
      )
  },
  // load the group, then based on the route load the channel, check for access, and if it passes set the channel to the store and load the channel users and messages
  [page.CHANNEL] ({dispatch}, {to}) {
    return dispatch(page.GROUP)
      .then(() => dispatch(get.CHANNEL, to.params.channel))
      .then(channel => dispatch(protect.CHANNEL, channel)
        .then(() => dispatch(relate.CHANNEL_USERS, channel))
        .then(() => dispatch(get.MESSAGES, channel))
        .then(messages => dispatch(relate.MESSAGES_USERS, messages)
          .then(() => commit(set.MESSAGES, messages))
          .then(() => commit(set.CHANNEL, channel))
        )
      )
  }
})
```

## Protects

```typescript
// actions/Protects.ts
import { actionsProtect } from 'vuex-router-actions'

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

## Relates

```typescript
// actions/Relates.ts
import { actionsCached } from 'vuex-router-actions'
import { get } from './Gets'
import { load } from './Loads'

export const relate = {
  USER_GROUPS: 'relateUserGroups',
  GROUP_USERS: 'relateGroupUser',
  GROUP_CHANNELS: 'relateGroupChannels',
  CHANNEL_USERS: 'relateChannelUsers',
  MESSAGES_USERS: 'relateMessagesUsers'
}

export const relates = {
  [relate.USER_GROUPS] ({dispatch}, user) {
    return dispatch(load.GROUPS, user.group_ids).then(groups => user.group = groups)
  },
  [relate.GROUP_USERS] ({dispatch}, group) {
    return dispatch(load.USERS, group.user_ids).then(users => group.users = users)
  },
  [relate.GROUP_CHANNELS] ({dispatch}, group) {
    return dispatch(load.CHANNELS, group.channel_ids).then(channels => group.channels = channels)
  },
  [relate.CHANNEL_USERS] ({dispatch}, channel) {
    return dispatch(load.USERS, channel.user_ids).then(users => channel.users = users)
  },
  [relate.MESSAGES_USERS] ({dispatch}, messages) {
    return Promise.all(messages.map(
      m => dispatch(get.USER, m.user_id).then(user => m.user = user)
    ))
  }
}
```

## Loads

```typescript
// actions/Loads.ts
import { actionsCached } from 'vuex-router-actions'
import { get } from './Gets'

export const load = {
  USERS: 'loadUsers',
  GROUPS: 'loadGroups',
  CHANNELS: 'loadChannels'
}

export const loads = actionsCached({
  [load.GROUPS]: {
    getKey: (context, group_ids) => group_ids,
    action: ({dispatch}, group_ids) => Promise.all(group_ids.map(id => dispatch(get.GROUP, id)))
  },
  [load.USERS]: {
    getKey: (context, user_ids) => user_ids,
    action: ({dispatch}, user_ids) => Promise.all(user_ids.map(id => dispatch(get.USER, id)))
  },
  [load.CHANNELS]: {
    getKey: (context, channel_ids) => channel_ids,
    action: ({dispatch}, channel_ids) => Promise.all(channel_ids.map(id => dispatch(get.CHANNEL, id)))
  }
})
```

## Gets

```typescript
// actions/Gets.ts
import { actionsCachedResults } from 'vuex-router-actions'

export const get = {
  USER: 'getUser',
  GROUP: 'getGroup',
  CHANNEL: 'getChannel',
  MESSAGES: 'getMessages'
}

export const gets = actionsCachedResults({
  [get.USER]: {
    getResultKey: (context, id) => id,
    action: ({dispatch}, id): Promise<User> => {
      // TODO return Promise which resolves a User instance with the given ID
    }
  },
  [get.GROUP]: {
    getKey: ({state}) => state.user_id, // when user changes, clear group cache
    getResultKey: (context, id) => id,
    action: ({dispatch}, id): Promise<Group> => {
      // TODO return Promise which resolves a Group instance with the given ID
    }
  },
  [get.CHANNEL]: {
    getResultKey: (context, id) => id,
    action: ({dispatch}, id): Promise<Channel> => {
      // TODO return Promise which resolves a Channel instance with the given ID
    }
  },
  [get.MESSAGES]: {
    getResultKey: (context, channel) => channel.id,
    action: ({dispatch}, channel): Promise<Message[]> => {
      // TODO return Promise which resolves a Message[] array with the last N messages in the given channel
    }
  }
})
```

## Sets

```typescript
// mutations/Sets.ts
import { SlackState } from '../State'

export const set = {
  USER: 'setUser',
  GROUP: 'setGroup',
  CHANNEL: 'setChannel',
  MESSAGES: 'setMessages',
  LOADING: 'setLoading'
}

export const sets = {
  [set.USER] (state: SlackState, user: User) {
    state.user = user
  },
  [set.GROUP] (state: SlackState, group: Group) {
    state.group = group
  },
  [set.USER] (state: SlackState, channel: Channel) {
    state.channel = channel
  },
  [set.MESSAGES] (state: SlackState, messages: Message[]) {
    state.messages = messages
  },
  [set.LOADING] (state: SlackState, loading: boolean) {
    state.loading = loading
  }
}
```

## Session

```typescript
// mutations/Session.ts
import { actionsDestroyCache } from 'vuex-router-actions'
import { SlackState, getDefaultState } from '../State'
import { store } from '../Store'

export const session = {
  SIGN_OUT: 'signOut',
  SIGN_IN: 'signIn'
}

export const sessions = {
  [session.SIGN_OUT] (state: SlackState) {
    store.replaceState(getDefaultState())
    actionsDestroyCache()
    // router.$replace('/sign-in')
  },
  [session.SIGN_IN] (state: SlackState, {username, password}) {
    // TODO takes username and password and does something with it. this might be better as an action
  }
}
```
