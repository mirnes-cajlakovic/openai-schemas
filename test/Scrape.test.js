const chai = require('chai')
const sinon = require('sinon')
const puppeteer = require('puppeteer')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const { Scrape } = require('../index')
const expect = chai.expect
const proxyquire = require('proxyquire')

describe('Scrape', function () {
  let browserStub, pageStub, gotoStub, waitForSelectorStub, evaluateStub, closeStub

  beforeEach(async () => {
    const { window } = new JSDOM('')
    global.window = window
    gotoStub = sinon.stub().resolves()
    waitForSelectorStub = sinon.stub().resolves()
    closeStub = sinon.stub().resolves()
    evaluateStub = async (fn, ...args) => {
      if (typeof fn === 'function') {
        return await fn(...args)
      }
    }

    pageStub = {
      goto: gotoStub,
      waitForSelector: waitForSelectorStub,
      evaluate: evaluateStub
    }

    browserStub = {
      newPage: sinon.stub().resolves(pageStub),
      close: closeStub
    }

    sinon.stub(puppeteer, 'launch').resolves(browserStub)
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('initialize', function () {
    it('should initialize a browser and navigate to URL', async function () {
      const url = 'http://example.com'
      const { browser, page } = await Scrape.initialize(url)

      expect(browser).to.equal(browserStub)
      expect(page).to.equal(pageStub)
      sinon.assert.calledOnce(puppeteer.launch)
      sinon.assert.calledWith(gotoStub, url)
    })
  })

  describe('scrapeSchemas', function () {
    let parseMock, ScrapeWithMock
    beforeEach(async () => {
      parseMock = {
        parsePage: async () => ({ data: 'test' })
      }
      ScrapeWithMock = proxyquire('../src/Scrape', { './Parse': parseMock })
    })
    it('should scrape schemas from a page', async function () {
      const url = 'http://example.com'
      const expectedData = { data: 'test' }

      const result = await ScrapeWithMock.scrapeSchemas(url)

      expect(result).to.deep.equal(expectedData)
    })
  })
})
