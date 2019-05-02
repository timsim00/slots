Feedback welcome.  

This is currently being used in an experimental, framework-less, build-less, lazily-loaded micro-frontend-y, web component and module-only app.


# API

- constructor({actions, mutators, subscribers, initState, notify, namespace, debug})
- dispatch(action, payload)
- mutate(action, payload)
- subscribe(listener)
- notify(namespace)
- import({namespace, actions,
- initState, mutators, notify})


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
    MY_ACTION: ({mutate, dispatch}, data) => {
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
    orgName: 'mystuff.com'
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
    OTHER_ACTION: ({mutate}, term) => {
      let data = {...}
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