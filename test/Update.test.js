const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const expect = chai.expect

describe('Update', () => {
  let Update
  let scrapeMock
  let fsMock
  let pathMock

  beforeEach(() => {
    scrapeMock = {
      scrapeSchemas: sinon.stub()
    }

    fsMock = {
      existsSync: sinon.stub(),
      mkdirSync: sinon.stub(),
      writeFileSync: sinon.stub()
    }

    pathMock = {
      join: sinon.stub(),
      dirname: sinon.stub()
    }

    Update = proxyquire('../src/Update.js', {
      './Scrape': scrapeMock,
      fs: fsMock,
      path: pathMock
    })
    process.env.API_DOC_URL = 'http://example.com/api'
    process.env.SCHEMA_PATH = 'schemas'
  })

  afterEach(() => {
    sinon.restore()
    delete process.env.API_DOC_URL
    delete process.env.SCHEMA_PATH
  })

  describe('updateSchemas', function () {
    it('should call scrapeSchemas with API_DOC_URL', async () => {
      scrapeMock.scrapeSchemas.resolves([])
      await Update.updateSchemas()
      expect(scrapeMock.scrapeSchemas.calledWith(process.env.API_DOC_URL)).to.equal(true)
    })
    it('should call scrapeSchemas with API_DOC_URL', async () => {
      scrapeMock.scrapeSchemas.resolves([])
      await Update.updateSchemas()
      expect(scrapeMock.scrapeSchemas.calledWith(process.env.API_DOC_URL)).to.equal(true)
    })

    it('should create directory if it does not exist', async () => {
      const schemas = [{ title: 'testSchema' }]
      scrapeMock.scrapeSchemas.resolves(schemas)
      fsMock.existsSync.returns(false)

      await Update.updateSchemas()

      expect(fsMock.mkdirSync.calledOnce).to.equal(true)
    })

    it('should write schema files correctly', async () => {
      const schemas = [{ title: 'testSchema', data: 'schemaData' }]
      scrapeMock.scrapeSchemas.resolves(schemas)
      fsMock.existsSync.returns(true)

      await Update.updateSchemas()

      expect(fsMock.writeFileSync.calledOnce).to.equal(true)
      expect(fsMock.writeFileSync.getCall(0).args[1]).to.equal(JSON.stringify(schemas[0], null, 2))
    })

    it('should return the correct schema directory', async () => {
      scrapeMock.scrapeSchemas.resolves([])
      pathMock.join.returns('path/to/schemas')

      const result = await Update.updateSchemas()

      expect(result).to.equal('path/to/schemas')
    })

    it('should handle errors in scrapeSchemas', async () => {
      scrapeMock.scrapeSchemas.rejects(new Error('Scrape failed'))

      try {
        await Update.updateSchemas()
        throw new Error('Test should have thrown an error')
      } catch (e) {
        expect(e.message).to.equal('Scrape failed')
      }
    })
  })
})
