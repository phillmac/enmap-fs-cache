module.exports = function (app, cache) {
  app.get('/hash', (req, res) => {
    const { hash } = req.body
    res.json(cache.hashedFiles.ensure(hash, {}))
  })
}
