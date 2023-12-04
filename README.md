# openai-schemas
[![npm version](https://badge.fury.io/js/openai-schemas.svg)](https://badge.fury.io/js/openai-schemas)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

This is a collection json schema objects for validating openai endpoints requests and responses. This library also contains tools for scraping new schemas from the official api docs on openai.com when they are updated.

## Installation
To install the package, use the following command:
```
npm install openai-schemas
```

## Usage
This package can be used in several ways to access the `create` function within the `chat` schema. Below are the methods to require or import this function:

##### Method 1
Using destructuring at the top level:
```javascript
const { create } = require('openai-schemas').schemas.chat;
console.log(create);
```

##### Method 2
Destructuring one level deeper:
```javascript
const { chat: { create } } = require('openai-schemas').schemas;
console.log(create);
```

##### Method 3
Destructuring with full path:
```javascript
const { schemas: { chat: { create } } } = require('openai-schemas');
console.log(create);
```
