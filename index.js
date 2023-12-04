const fs = require('fs')
const path = require('path')

const schemasIndex = []
const schemasPath = path.join(__dirname, 'schemas')
fs.readdirSync(schemasPath)
  .filter((dir) => {
    return fs.statSync(path.join(schemasPath, dir)).isDirectory()
  })
  .map((dir) => {
    const dirPath = path.join(schemasPath, dir)
    fs.readdirSync(dirPath)
      .filter((file) => {
        return path.extname(file) === '.json'
      })
      .map((file) => {
        const name = path.basename(file, path.extname(file))
        schemasIndex.push({ name, dir, src: path.join('./schemas/', dir, name) })
      })
  })

const modules = {
  Parse: require('./src/Parse'),
  Scrape: require('./src/Scrape'),
  Update: require('./src/Update'),
  schemas: {}
}

for (const schema of schemasIndex) {
  if (!modules.schemas[schema.dir]) {
    modules.schemas[schema.dir] = {}
  }
  modules.schemas[schema.dir][schema.name] = require('./' + schema.src)
}

module.exports = modules
