const express = require('express')
const Enmap = require('enmap')
const morgan = require('morgan')
const addRoutes = require('./routes')

const app = express()

app.use(express.json({ limit: '50mb' }))

morgan.token('params', (req, _res) => {
  const { path, filename } = req.body
  return JSON.stringify({ path, filename })
})

app.use(morgan(':method :url :status :req[content-length] :params :res[content-length] - :response-time ms'))

const cache = {
  files: new Enmap({
    name: 'FilesCache',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
  }),
  folders: new Enmap({
    name: 'FoldersCache',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
  }),
  hashedFiles: new Enmap({
    name: 'hashedFilesCache',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
  }),
  fileHases: new Enmap({
    name: 'fileHasesCache',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
  })
}

addRoutes(app, cache)

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
