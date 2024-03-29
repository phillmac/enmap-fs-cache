
module.exports = function (app, cache) {
  app.get('/file', (req, res) => {
    const { path, filename } = req.body
    cache.files.ensure(path, [])
    if (cache.files.includes(path, filename)) {
      res.json({ exists: true })
    } else {
      res.json({ exists: false })
    }
  })

  app.post('/file', (req, res) => {
    const { path, filename, hash } = req.body
    cache.files.ensure(path, [])
    cache.folders.ensure(filename, [])
    cache.files.push(path, filename, null, false)
    cache.folders.push(filename, path, null, false)
    if (hash) {
      cache.hashedFiles.ensure(hash, [], filename)
      cache.fileHashes.ensure(filename, [], hash)

      cache.hashedFiles.push(hash, path, filename, false)
      cache.fileHashes.push(filename, path, hash, false)
    }
    res.json('ok')
  })

  app.get('/files', (req, res) => {
    const { path } = req.body
    cache.files.ensure(path, [])
    cache.files.get(path)
    res.json(cache.files.get(path))
  })

  app.post('/files', async (req, res) => {
    const { path, filenames } = req.body
    cache.files.ensure(path, [])
    const contents = await cache.files.get(path)
    const updated = Array.from(new Set([...filenames, ...contents]))
    const count = updated.length - contents.length
    if (count > 0) {
      cache.files.set(path, updated)
      console.info(`Added ${count} items to ${path}`)
    }
    res.json('ok')
  })
}
