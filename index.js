const express = require('express')
const Enmap = require('enmap')

const app = express()

app.use(express.json())

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
    res.send({ exists: true })
  }
  res.send({ exists: false })
})

app.post('/file', (req, res) => {
  const { path, filename } = req.body
  cache.files.ensure(path, [])
  cache.files.push(path, filename, null, false)
  res.send('ok')
})

app.get('/files', (req, res) => {
  const { path } = req.body
  cache.files.ensure(path, [])
  cache.files.get(path)
  res.send(cache.files.get(path))
})

app.post('/files', async (req, res) => {
  const { path, filenames } = req.body
  cache.files.ensure(path, [])
  const contents = await cache.files.get(path)
  const updated = Array.from(new Set([...filenames, ...contents]))
  count = updated.length - contents.length
  if (count > 0) {
    cache.files.set(path, updated)
    console.log(`Added ${count} items to ${path}`)
  }
  res.send('ok')
})

// starting the server
app.listen(3003, () => {
  console.log('listening on port 3003')
})
