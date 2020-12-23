const express = require('express')
const bodyParser = require('body-parser')
const Enmap = require('enmap')

const app = express()

app.use(bodyParser.json())

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
  if (cache.files.get(path).includes(filename)) {
    res.send({ exists: true })
  }
  res.send({ exists: false })
})

app.put('/file', (req, res) => {
  const { path, filename } = req.body
  cache.files.ensure(path, [])
  cache.files.push(path, filename, null, false)
  res.send('ok')
})

// starting the server
app.listen(3003, () => {
  console.log('listening on port 3003')
})
