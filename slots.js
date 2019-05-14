class Slots { //nickname for a vending machine
  // TODO: make reactive?, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
  constructor({actions, mutators, subscribers, initState, notify, namespace, debug = false, quiet = false}) {
    this.actions = {}
    this.mutators = {}
    this.subscribers = subscribers || []
    this.state = {}
    this.debug = debug
    this.quiet = quiet
    this.import({actions, mutators, initState, notify, namespace})
  }
  dispatch(action, payload) {
    if (this.debug) {console.log(`dispatch ${action}`, payload)}
    if (action.includes(':')) {
      const parts = action.split(':')
      this.actions[parts[0]][parts[1]]({mutate: this.mutate.bind(this), state: this.state, dispatch: this.dispatch.bind(this)}, payload)
    } else {
      this.actions[action]({mutate: this.mutate.bind(this), state: this.state, dispatch: this.dispatch.bind(this)}, payload)
    }
  }
  mutate(action, payload) {
    if (this.debug) {console.log(`mutate ${action}`, payload)}
    let parts = []
    if (action.includes(':')) {
      parts = action.split(':')
      this.state = this.mutators[parts[0]][parts[1]](this.state, payload)
    } else {
      this.state = this.mutators[action](this.state, payload)
    }
    !this.quiet && this.notify(parts[0])
  }
  subscribe(listener) {
    // TODO: subscribe to only a namespace
    this.subscribers.push(listener)
    return () => {
      this.subscribers = this.subscribers.filter(subscriber => subscriber !== listener)
    }
  }
  notify(namespace) {
    if (this.debug) {console.log(`notify ${namespace || ''} ${this.quiet}`)}
    !this.quiet && this.subscribers.forEach(subscriber => subscriber(this.state, namespace))
  }
  import({namespace, actions, initState, mutators, notify}) {
    if (namespace && !this.state.hasOwnProperty(namespace)) {
      this.state[namespace] = {}
      this.actions[namespace] = {}
      this.mutators[namespace] = {}
    }
    let _state, _actions, _mutators
    if (namespace) {
      _state = this.state[namespace]
      _actions = this.actions[namespace]
      _mutators = this.mutators[namespace]
    } else {
      _state = this.state
      _actions = this.actions
      _mutators = this.mutators
    }
    if (actions) {
      _actions = Object.assign(_actions, actions)
    }
    if (mutators) {
      _mutators = Object.assign(_mutators, mutators)
    }
    if (initState) {
      _state = Object.assign(_state, initState)
    }
    if (notify) {
      this.notify(namespace)
    }
    return this
  }
}