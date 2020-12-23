const express = require('express')
const Enmap = require('enmap')

const app = express()

app.use(express.json({ limit: '50mb' }))

const cache = {
  files: new Enmap({
    name: 'FilesCache',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
  })//,
  // folders: new Enmap({
  //   name: 'FoldersCache',
  //   fetchAll: false,
  //   autoFetch: true,
  //   cloneLevel: 'deep'
  // })
}

app.get('/file', (req, res) => {
  const { path, filename } = req.body
  cache.files.ensure(path, [])
  if (cache.files.includes(path, filename)) {
    res.json({ exists: true })
  }
  res.json({ exists: false })
})

app.post('/file', (req, res) => {
  const { path, filename } = req.body
  cache.files.ensure(path, [])
  cache.files.push(path, filename, null, false)
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
    console.log(`Added ${count} items to ${path}`)
  }
  res.json('ok')
})

// starting the server
app.listen(3003, () => {
  console.log('listening on port 3003')
})
