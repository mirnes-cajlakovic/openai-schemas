const Scrape = require('./Scrape')
const path = require('path')
const fs = require('fs')

/**
 * Provides functionality to update schemas by scraping them from a given URL and saving them locally.
 */
const Update = {

  /**
   * Updates schemas by scraping from the URL specified in the environment variable API_DOC_URL.
   *
   * @returns {Promise<string>} - A promise that resolves to the directory where schemas are saved.
   */
  updateSchemas: async () => {
    const schemas = await Scrape.scrapeSchemas(process.env.API_DOC_URL)
    const schemasDir = path.join(__dirname, '../schemas')

    for (const schema of schemas) {
      const file = path.join(schemasDir, `${schema.title}.json`)
      const fileDir = path.dirname(file)

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true })
      }

      fs.writeFileSync(file, JSON.stringify(schema, null, 2))
    }

    return schemasDir
  }

}

module.exports = Update
