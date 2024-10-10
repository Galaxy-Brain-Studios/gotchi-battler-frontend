let handlers = []

const registerHandler = function (handler) {
  handlers.push(handler)
}
const unregisterHandler = function (handler) {
  handlers = handlers.filter(h => h !== handler)
}
const notifyUpdate = function (profile) {
  for (const handler of handlers) {
    handler(profile)
  }
}

export {
  registerHandler,
  unregisterHandler,
  notifyUpdate
}
