Feedback and questions welcome.  

Tiny, uni-directional, central state management in 70 lines of code.

This is currently being used in an experimental, framework-less, build-less, lazily-loaded micro-frontend-y, [single file](https://github.com/TheLarkInn/unity-component-specification) web component and module-only app.  It's working well.

Reason for being: https://bundlephobia.com/result?p=vuex@3.1.0
Why download (and parse) 3k when you only need 800b?


# API

- constructor({actions, mutators, subscribers, initState, notify, namespace, debug})
- dispatch(action, payload)
- mutate(action, payload)
- subscribe(listener)
- notify(namespace)
- import({namespace, actions, initState, mutators, notify})


# Usage

```javascript
// instantiate Slots somehow:
module.default.prototype.createStore = (actions, mutators, subscribers, initialState = {}, notify, namespace, debug) => {
  return new Slots(actions, mutators, subscribers, initialState, notify, namespace, debug)
}
```

```javascript
/* app-root component */
connectedCallback() {
  ...
  const {actions, mutators, initState} = this
  this.store = this.createStore({debug: true, namespace: 'app', actions, mutators, initState,
    subscribers: [
      this.persistState
    ]
  })  
}

get actions() {
  return {
    MY_ACTION: ({mutate}, data) => {
      mutate('app:MY_ACTION', data) // just passing through
    }
  }
}

get mutators() {
  // every mutator better return state or there's gonna be trouble
  return {
    MY_ACTION: (state, res) => {
      state.app.stuff = res
      return state
    }
  }
}

get initState() {
  return {
    orgName: 'mystuff.com',
    stuff: {}
  }
}
```



```javascript
/* some other module */

constructor() {
  this.app = document.querySelector('app-root')
  this.store = this.app.store.import(this)

  // if this module has a UI, subscribe to state changes:
  this.store.subscribe((state, namespace) => this.render(state, namespace))
}

render(state, namespace) {
  if (namespace === 'other') {
    // UI is just a function of state
  }
}

get namespace() {
  return 'other'
}

get actions() {
  return {
    OTHER_ACTION: ({mutate, dispatch}, term) => {
      const data = {...}
      const someData = {...}
      dispatch('someNamespace:SOME_ACTION', someData)
      this.app.apiRequest(data)
      .then( res => {
        mutate('other:OTHER_ACTION', res)
      })
    }
  }
}

get mutators() {
  return {
    OTHER_ACTION: (state, res) => {
      const modifiedStuff = res.filter(...)
      state.other.otherStuff = modifiedStuff
      return state
    }
  }
}

get initState() {
  return JSON.parse(localStorage.getItem(this.namespace)) ||
  {
    otherStuff: []
  }
}
```

```javascript
// dispatch actions from some module, usually actions defined w/in the same module or related component:
this.store = document.querySelector('app-root').store
...
this.store.dispatch('other:OTHER_ACTION')
```