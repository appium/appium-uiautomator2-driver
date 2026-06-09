import type {AttributeSchema} from '@appium/css-locator-to-native';

export const ATTRIBUTE_SCHEMA: AttributeSchema = {
  attributes: {
    checkable: {type: 'boolean'},
    checked: {type: 'boolean'},
    clickable: {type: 'boolean'},
    enabled: {type: 'boolean'},
    focusable: {type: 'boolean'},
    focused: {type: 'boolean'},
    'long-clickable': {type: 'boolean'},
    scrollable: {type: 'boolean'},
    selected: {type: 'boolean'},
    index: {type: 'numeric', aliases: ['nth-child']},
    instance: {type: 'numeric'},
    description: {
      type: 'string',
      aliases: ['content-description', 'content-desc', 'desc', 'accessibility-id'],
    },
    'resource-id': {type: 'string', aliases: ['id']},
    text: {type: 'string'},
    'class-name': {type: 'string'},
    'package-name': {type: 'string'},
  },
  booleanFormat: 'true-false',
};
