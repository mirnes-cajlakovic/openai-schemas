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

## Reference
Below is a table of available json schemas. To see a full list, see the `schemas/` directory.  


| Endpoint      | Schema                   |
|---------------|--------------------------|
| assistants    | createAssistantFile      |
| assistants    | createAssistant          |
| assistants    | deleteAssistantFile      |
| assistants    | deleteAssistant          |
| assistants    | fileObject               |
| assistants    | getAssistantFile         |
| assistants    | getAssistant             |
| assistants    | listAssistantFiles       |
| assistants    | listAssistants           |
| assistants    | modifyAssistant          |
| assistants    | object                   |
| audio         | createSpeech             |
| audio         | createTranscription      |
| audio         | createTranslation        |
| chat          | create                   |
| chat          | object                   |
| chat          | streaming                |
| embeddings    | create                   |
| embeddings    | object                   |
| files         | create                   |
| files         | delete                   |
| files         | list                     |
| files         | object                   |
| files         | retrieveContents         |
| files         | retrieve                 |
| fineTuning    | cancel                   |
| fineTuning    | create                   |
| fineTuning    | eventObject              |
| fineTuning    | listEvents               |
| fineTuning    | list                     |
| fineTuning    | object                   |
| fineTuning    | retrieve                 |
| images        | createEdit               |
| images        | create                   |
| images        | createVariation          |
| images        | object                   |
| messages      | createMessage            |
| messages      | fileObject               |
| messages      | getMessageFile           |
| messages      | getMessage               |
| messages      | listMessageFiles         |
| messages      | listMessages             |
| messages      | modifyMessage            |
| messages      | object                   |
| models        | delete                   |
| models        | list                     |
| models        | object                   |
| models        | retrieve                 |
| moderations   | create                   |
| moderations   | object                   |
| runs          | cancelRun                |
| runs          | createRun                |
| runs          | createThreadAndRun       |
| runs          | getRun                   |
| runs          | getRunStep               |
| runs          | listRuns                 |
| runs          | listRunSteps             |
| runs          | modifyRun                |
| runs          | object                   |
| runs          | stepObject               |
| runs          | submitToolOutputs        |
| threads       | createThread             |
| threads       | deleteThread             |
| threads       | getThread                |
| threads       | modifyThread             |
| threads       | object                   |

