const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const { Parse } = require('../index')
const fs = require('fs')
const path = require('path')

describe('Parse', function () {
  afterEach(() => {
    delete global.document
  })

  describe('click', function () {
    it('should resolve when the clicked element has correct attribute change', async function () {
      const dom = new JSDOM('<div id="test-element" aria-expanded="false"></div>')
      global.document = dom.window.document
      global.MutationObserver = {}
      global.MutationObserver = class {
        constructor (funcs) {
          funcs([{ type: 'attributes', attributeName: 'aria-notTheExpandedOne' }], this)
          funcs([{ type: 'attributes', attributeName: 'aria-expanded' }], this)
        }

        disconnect () {}
        observe (element, initObject) {}
      }

      const element = document.getElementById('test-element')
      sinon.stub(element, 'click').callsFake(() => {
        element.setAttribute('aria-expanded', 'true')
      })

      await Parse.click(element)
      expect(element.getAttribute('aria-expanded')).to.equal('true')
    })
  })

  describe('transform', function () {
    it('should transform the dataset into a structured schema', function () {
      const dataset = [{ name: 'test', type: 'string', markdown: 'description' }]
      const properties = { title: 'Test' }

      const result = Parse.transform(dataset, properties)
      expect(result).to.be.an('object')
      expect(result.properties).to.have.property('test')
    })
    it('should transform without array or instance var', function () {
      const dataset = [
        { name: 'test', type: ['string', 'array'], params: [{}] },
        { name: 'test', type: ['string', 'object'], params: [{}] }
      ]
      const properties = { title: 'Test' }

      Parse.transform(dataset, properties)
    })
  })

  describe('parseHeading', function () {
    it('should parse the heading from an element', function () {
      const dom = new JSDOM('<div data-name="fine-tuning/event-object"></div>')
      const element = dom.window.document.querySelector('div')

      const result = Parse.parseHeading(element)
      expect(result).to.equal('fineTuning/eventObject')
    })
  })

  describe('parseType', function () {
    it('should parse the types from an element', function () {
      const element = { innerText: 'string or number' }

      const result = Parse.parseType(element)
      expect(result).to.deep.equal(['string', 'number'])
    })
  })

  describe('parseMarkdown', function () {
    it('should parse markdown content from an element', function () {
      const element = { innerText: 'Some markdown content' }

      const result = Parse.parseMarkdown(element)
      expect(result).to.equal('Some markdown content')
    })
  })

  describe('parseDefaults', function () {
    it('should parse the default value from an element', function () {
      const element = { innerText: 'Defaults to 42' }

      const result = Parse.parseDefaults(element)
      expect(result).to.equal('42')
    })
  })

  describe('parseString', function () {
    it('should parse a string from an element', function () {
      const element = { innerText: 'Hello World' }

      const result = Parse.parseString(element)
      expect(result).to.equal('Hello World')
    })
  })

  describe('parseBoolean', function () {
    it('should parse a boolean value from an element', function () {
      const element = { innerText: 'true' }

      const result = Parse.parseBoolean(element)
      expect(result).to.equal(true)
    })
  })

  describe('parseTable', function () {
    it('should parse a table class div', async function () {
      const dom = new JSDOM('<!DOCTYPE html><div class="param-table"><div class="param-row"></div></div>')
      const document = dom.window.document
      const table = document.querySelector('.param-table')

      const result = await Parse.parseTable(table)
      expect(result).to.eql([])
    })
  })

  describe('parseSection', function () {
    it('should parse a section class div', async function () {
      const dom = new JSDOM('<!DOCTYPE html><div class="section endpoint"><div class="css-pms1cx">Deprecated</div></div>')
      const document = dom.window.document
      const section = document.querySelector('.section.endpoint')
      Object.defineProperty(dom.window.Element.prototype, 'innerText', {
        get () {
          return this.textContent.replace(/\n/g, '').replace(/ +/g, ' ')
        },
        set (value) {
          this.textContent = value
        }
      })

      const result = await Parse.parseSection(section)
      expect(result).to.eql(undefined)
    })
  })

  describe('parse', function () {
    it('should apply a parsing method to an element', function () {
      const element = { innerText: 'Test' }

      const result = Parse.parse(element, Parse.parseString, 'default')
      expect(result).to.equal('Test')
    })

    it('should return default value if element is null', function () {
      const result = Parse.parse(null, Parse.parseString, 'default')
      expect(result).to.equal('default')
    })

    it('should return the first default value if element is undefined and method returns undefined', () => {
      const element = {}
      const method = () => {}
      const defaults = 'abc123'

      const result = Parse.parse(element, method, defaults)
      expect(result).to.equal(defaults)
    })
  })

  it('should parse the page correctly', async function () {
    const html = fs.readFileSync(path.join(__dirname, './resources/index.html'), 'utf8')
    const dom = new JSDOM(html)
    global.document = dom.window.document
    global.MutationObserver = {}
    global.MutationObserver = class {
      constructor (funcs) {
        funcs([{ type: 'attributes', attributeName: 'aria-expanded' }], this)
      }

      disconnect () {}
      observe (element, initObject) {}
    }
    global.document = dom.window.document
    Object.defineProperty(dom.window.Element.prototype, 'innerText', {
      get () {
        return this.textContent.replace(/\n/g, '').replace(/ +/g, ' ')
      },
      set (value) {
        this.textContent = value
      }
    })

    await Parse.parsePage()
  })
})
