# Example

The following example is to illustrate how all of these functions are used to create an app. 

# App

This App will be a clone of Slack. Slack is a communication App with groups, channels, and messages. 
This example will utilize Typescript but should easily be converted to plain Babel, JS, etc.
The app will utilize `Vue`, `Vuex`, `VueRouter`, and `VuexRouterActions`

**Contents**:
- [Models](#models)
- [State](#state)
- [Routes](#routes)
- [Router](#router)
- [Store](#store)

## Models

Lets get the models out of the way so we all understand the structure of this app:

```typescript
// Models.ts
class User {
  id: string
  name: string
  picture: string
  group_ids: string[]
  // loaded through actions
  groups: Group[]
}
class Group {
  id: string
  name: string
  user_ids: string[]
  channel_ids: string[]
  // loaded through actions
  users: User[]
  channels: Channel[]
}
class Channel {
  id: string
  name: string
  user_ids: string[]
  // loaded through actions
  users: User[]
}
class Message[] {
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
  user_id: string
  user: User
  group: Group // currently viewed group
  channel: Channel // currently viewed channel
  messages: Message // current viewed messages in channel
}
export function getDefaultState(): SlackState {
  return {
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

export default new Router({
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
import { SlackState, getDefaultState } from './SlackState
import { setters } from './mutations/Setters
import { loaders } from './actions/Loaders'
import { protectors } from './actions/Protectors'
import { pages } from './actions/Pages'

export const plugin = VuexRouterActions( DEBUG_OPTIONS )

export const store = new VuexStore<SlackState>({
  plugins: [plugin],
  state: getDefaultState(),
  mutations: {
    ...setters
  },
  actions: actionsWatch({
    ...loaders,
    ...protectors,
    ...pages
  })
})
```
