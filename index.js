const express = require('express')
const Enmap = require('enmap')
const morgan = require('morgan')

const app = express()

app.use(express.json({ limit: '50mb' }))

morgan.token('params', (req, _res) => {
  const { path, filename} = req.body
  return JSON.stringify({ path, filename})
})

app.use(morgan(':method :url :status :req[content-length] :params :res[content-length] - :response-time ms'))

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
  } else {
    res.json({ exists: false })
  }
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
    console.info(`Added ${count} items to ${path}`)
  }
  res.json('ok')
})

// starting the server
const server = app.listen(3003, () => {
  console.info('listening on port 3003')
})

server.keepAliveTimeout = 120 * 1000

server.on('connection', function (socket) {
  const remoteAddr = socket.remoteAddress
  socket.setTimeout(150 * 1000)
  socket.setKeepAlive(true)
  console.info(`${remoteAddr} Client Connected`)
  socket.on('disconnect', function () {
    console.info(`${remoteAddr} Client Disconnected`)
  })
})
