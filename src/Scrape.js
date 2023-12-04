const puppeteer = require('puppeteer')
const Parse = require('./Parse')

/**
 * Provides functions to scrape schemas from a given URL using Puppeteer.
 */
const Scrape = {

  /**
   * Scrapes schemas from the provided URL.
   *
   * @param {string} url - The URL to scrape data from.
   * @returns {Promise<object>} - A promise that resolves to the scraped schemas.
   */
  scrapeSchemas: async (url) => {
    const { browser, page } = await Scrape.initialize(url)

    const serializedParse = Object.entries(Parse).reduce((acc, [key, value]) => {
      acc[key] = value.toString()
      return acc
    }, {})

    const schemas = await page.evaluate(async (serializedParse) => {
      window.Parse = Object.entries(serializedParse).reduce((acc, [key, value]) => {
        acc[key] = new Function(`return ${value}`)() // eslint-disable-line no-new-func
        return acc
      }, {})

      return await window.Parse.parsePage()
    }, serializedParse)

    await browser.close()

    return schemas
  },

  /**
   * Initializes a Puppeteer browser and page instance and navigates to the given URL.
   *
   * @param {string} url - The URL to navigate to.
   * @returns {Promise<{browser: puppeteer.Browser, page: puppeteer.Page}>} - A promise that resolves with the browser and page instances.
   */
  initialize: async (url) => {
    const browser = await puppeteer.launch({ headless: false })

    const page = await browser.newPage()
    await page.goto(url)
    await page.waitForSelector('.section.endpoint')

    return { browser, page }
  }

}

module.exports = Scrape
