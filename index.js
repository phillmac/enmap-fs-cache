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
  console.log('GET /file', req.body)
  cache.files.ensure(path, [])
  if (cache.files.includes(path, filename)) {
    res.json({ exists: true })
  } else {
    res.json({ exists: false })
  }
})

app.post('/file', (req, res) => {
  const { path, filename } = req.body
  cache.files.ensure(path, [])
  cache.files.push(path, filename, null, false)
  res.json('ok')
  console.log('Request Headers:', JSON.stringify(req.headers))
  console.log('Response Headers:', JSON.stringify(res.getHeaders()))
})

app.get('/files', (req, res) => {
  const { path } = req.body
  console.log('GET /files', req.body)
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
  console.log('Request Headers:', JSON.stringify(req.headers))
  console.log('Response Headers:', JSON.stringify(res.getHeaders()))
})

// starting the server
const server = app.listen(3003, () => {
  console.log('listening on port 3003')
})

server.keepAliveTimeout = 120 * 1000

server.on('connection', function (socket) {
  const remoteAddr = socket.remoteAddress
  socket.setTimeout(150 * 1000)
  socket.setKeepAlive(true)
  console.log(`${remoteAddr} Client Connected`)
  socket.on('disconnect', function () {
    console.log(`${remoteAddr} Client Disconnected`)
  })
})
