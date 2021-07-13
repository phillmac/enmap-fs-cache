fileRoutes = require('./file.js')

module.exports = function (app, cache) {
  fileRoutes(app, cache)
}
