/**
 * A utility object for parsing HTML elements and transforming data.
 */
const Parse = {

  /**
   * Simulates a click event on the given element and resolves when a specific attribute changes.
   * @param {Element} element - The DOM element to be clicked.
   * @returns {Promise<void>} A promise that resolves when the attribute change is observed.
   */
  click: (element) => {
    return new Promise((resolve, reject) => {
      const observerCallback = (mutations, observer) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
            observer.disconnect()
            resolve()
            break
          }
        }
      }
      const observer = new MutationObserver(observerCallback)

      observer.observe(element, { attributes: true })
      element.click()
    })
  },

  /**
   * Transforms a dataset into a structured schema based on specified properties.
   * @param {Array} dataset - The dataset to be transformed.
   * @param {Object} properties - The properties to be included in the schema.
   * @returns {Object} The transformed schema.
   */
  transform: (dataset = [], properties) => {
    const schema = dataset
      .filter((item) => !item.deprecated)
      .reduce((obj, item) => {
        obj.properties[item.name] = {
          type: item.type,
          description: item.markdown
        }

        if (item.params && item.type.includes('array') && item.type.length > 1) {
          const array = item.params.find((param) => param?.type?.includes('array'))
          if (array && array.params) {
            obj.properties[item.name].items = {
              oneOf: array.params.map((param) =>
                Parse.transform(param.params, { title: param.title }))
            }
          }
        } else if (item.params && item.type.includes('array')) {
          const objects = item.params.filter((param) => param.title)
          if (objects.length > 0) {
            obj.properties[item.name].items = {
              oneOf: item.params.map((param) =>
                Parse.transform(param.params, { title: param.title }))
            }
          } else {
            obj.properties[item.name].properties = Parse.transform(item.params)
          }
        } else if (item.params && item.type.includes('object') && item.type.length > 1) {
          const instance = item.params.find((param) => param?.type?.includes('object'))
          if (instance) {
            obj.properties[item.name].properties = Parse.transform(instance.params)
          }
        }

        return obj
      }, { ...properties, type: ['object'], properties: {} })

    return schema
  },

  /**
   * Parses the heading from a given element.
   * @param {Element} element - The element containing the heading.
   * @returns {string} The parsed heading.
   */
  parseHeading: (element) => {
    return element.dataset.name
      .replace(/-([a-z])/gi, (match, group) => group.toUpperCase())
  },

  /**
   * Parses the type from a given element, splitting it by 'or' and '/'.
   * @param {Element} element - The element containing the type information.
   * @returns {string[]} An array of parsed types.
   */
  parseType: (element) => {
    return element.innerText.split(/\s*(?:or|\/)\s*/)
  },

  /**
   * Parses markdown content from a given element.
   * @param {Element} element - The element containing markdown content.
   * @returns {string} The parsed markdown content.
   */
  parseMarkdown: (element) => {
    return element.innerText
  },

  /**
   * Parses the default value from a given element.
   * @param {Element} element - The element containing the default value.
   * @returns {string} The parsed default value.
   */
  parseDefaults: (element) => {
    return element.innerText.replace('Defaults to ', '')
  },

  /**
   * Parses a string from a given element.
   * @param {Element} element - The element containing the string.
   * @returns {string} The parsed string.
   */
  parseString: (element) => {
    return String(element.innerText)
  },

  /**
   * Parses a boolean value from a given element.
   * @param {Element} element - The element containing the boolean value.
   * @returns {boolean} The parsed boolean value.
   */
  parseBoolean: (element) => {
    return Boolean(element.innerText)
  },

  /**
   * Generic parsing function that applies a specific method to an element.
   * @param {Element} element - The element to parse.
   * @param {Function} method - The parsing method to apply.
   * @param {*} defaults - The default value if parsing fails.
   * @returns {*} The parsed value or the default value.
   */
  parse: (element, method, defaults) => {
    return element ? method(element) ?? defaults : defaults
  },

  /**
   * Parses a table element into a structured dataset.
   * @param {Element} table - The table element to parse.
   * @returns {Promise<Array>} A promise that resolves to the parsed dataset.
   */
  parseTable: async (table) => {
    const dataset = []
    const rows = Array.from(table?.querySelectorAll('.param-row'))

    for (const row of rows) {
      const data = {}

      const header = row.querySelector('.param-row-header')
      const description = row.querySelector('.param-desc')
      const button = row.querySelector('.param-expand-button')

      if (header) {
        data.name = Parse.parse(header.querySelector('.param-name'), Parse.parseString)
        data.title = Parse.parse(header.querySelector('.param-title'), Parse.parseString)
        data.type = Parse.parse(header.querySelector('.param-type'), Parse.parseType, [])
        data.required = Parse.parse(header.querySelector('.param-reqd'), Parse.parseBoolean, false)
        data.optional = Parse.parse(header.querySelector('.param-optl'), Parse.parseBoolean, false)
        data.defaults = Parse.parse(header.querySelector('.param-default'), Parse.parseDefaults, null)
        data.deprecated = Parse.parse(header.querySelector('.param-depr'), Parse.parseBoolean, false)
        data.markdown = Parse.parse(description?.querySelector('.markdown-content'), Parse.parseMarkdown, null)

        if (button) {
          await Parse.click(button)
          data.params = await Parse.parseTable(row.querySelector('.param-table'))
        }

        dataset.push(data)
      }
    }

    return dataset
  },

  /**
   * Parses a section element into a structured schema.
   * @param {Element} section - The section element to parse.
   * @returns {Promise<Object>} A promise that resolves to the parsed schema.
   */
  parseSection: async (section) => {
    const heading = Parse.parse(section.querySelector('.anchor-heading'), Parse.parseHeading, null)
    const summary = Parse.parse(section.querySelector('.endpoint-summary'), Parse.parseString)
    const deprecated = Parse.parse(section.querySelector('.css-pms1cx'), Parse.parseBoolean, false)
    const table = section.querySelector('.param-table')

    if (!deprecated) {
      return await Parse.parseTable(table)
        .then((dataset) => Parse.transform(dataset, { title: heading, description: summary }))
    }
  },

  /**
   * Parses an entire page into an array of schemas.
   * @returns {Promise<Array>} A promise that resolves to an array of parsed schemas.
   */
  parsePage: async () => {
    const schemas = []
    const sections = Array.from(document.querySelectorAll('.section.endpoint'))

    for (const section of sections) {
      const schema = await Parse.parseSection(section)
      schemas.push(schema)
    };

    return schemas.filter((schema) => schema !== undefined)
  }

}

module.exports = Parse
