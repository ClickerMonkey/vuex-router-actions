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
interface SlackState {
  user_id: string
  user: User
  group: Group // currently viewed group
  channel: Channel // currently viewed channel
  messages: Message // current viewed messages in channel
}
```

## Routes
