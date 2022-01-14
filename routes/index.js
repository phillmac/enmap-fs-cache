const fileRoutes = require('./file.js')
const hashRoutes = require('./hash.js')

module.exports = function (app, cache) {
  fileRoutes(app, cache)
  hashRoutes(app, cache)
}
