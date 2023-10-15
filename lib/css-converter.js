import { createParser } from 'css-selector-parser';
import _ from 'lodash';
import { errors } from 'appium/driver';
import log from './logger';

const parseCssSelector = createParser({
  syntax: {
    pseudoClasses: {
      unknown: 'accept',
      definitions: {
        Selector: ['has'],
      }
    },
    combinators: ['>', '+', '~'],
    attributes: {
      operators: ['^=', '$=', '*=', '~=', '=']
    },
    ids: true,
    classNames: true,
    tag: {
      wildcard: true
    },
  },
  substitutes: true
});

const RESOURCE_ID = 'resource-id';
const ID_LOCATOR_PATTERN = /^[a-zA-Z_][a-zA-Z0-9._]*:id\/[\S]+$/;

const BOOLEAN_ATTRS = [
  'checkable', 'checked', 'clickable', 'enabled', 'focusable',
  'focused', 'long-clickable', 'scrollable', 'selected',
];

const NUMERIC_ATTRS = [
  'index', 'instance',
];

const STR_ATTRS = [
  'description', RESOURCE_ID, 'text', 'class-name', 'package-name'
];

const ALL_ATTRS = [
  ...BOOLEAN_ATTRS,
  ...NUMERIC_ATTRS,
  ...STR_ATTRS,
];

/** @type {[string, string[]][]} */
const ATTRIBUTE_ALIASES = [
  [RESOURCE_ID, ['id']],
  ['description', [
    'content-description', 'content-desc',
    'desc', 'accessibility-id',
  ]],
  ['index', ['nth-child']],
];

/**
 * Convert hyphen separated word to snake case
 *
 * @param {string?} str
 * @returns {string} The hyphen separated word translated to snake case
 */
function toSnakeCase (str) {
  if (!str) {
    return '';
  }
  const tokens = str.split('-').map((str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
  const out = tokens.join('');
  return out.charAt(0).toLowerCase() + out.slice(1);
}

/**
 * Get the boolean from a CSS object. If empty, return true. If not true/false/empty, throw exception
 *
 * @param {import('css-selector-parser').AstAttribute|import('css-selector-parser').AstPseudoClass} css A
 * CSS object that has 'name' and 'value'
 * @returns {string} Either 'true' or 'false'. If value is empty, return 'true'
 */
function requireBoolean (css) {
  // @ts-ignore Attributes should exist
  const val = _.toLower((css.value ?? css.argument)?.value) || 'true'; // an omitted boolean attribute means 'true' (e.g.: input[checked] means checked is true)
  if (['true', 'false'].includes(val)) {
    return val;
  }
  // @ts-ignore The attribute should exist
  throw new Error(`'${css.name}' must be true, false or empty. Found '${css.value}'`);
}

/**
 * Get the canonical form of a CSS attribute name
 *
 * Converts to lowercase and if an attribute name is an alias for something else, return
 * what it is an alias for
 *
 * @param {import('css-selector-parser').AstAttribute|import('css-selector-parser').AstPseudoClass} cssEntity CSS object
 * @returns {string} The canonical attribute name
 */
function requireEntityName (cssEntity) {
  const attrName = cssEntity.name.toLowerCase();

  // Check if it's supported and if it is, return it
  if (ALL_ATTRS.includes(attrName)) {
    return attrName.toLowerCase();
  }

  // If attrName is an alias for something else, return that
  for (const [officialAttr, aliasAttrs] of ATTRIBUTE_ALIASES) {
    if (aliasAttrs.includes(attrName)) {
      return officialAttr;
    }
  }
  throw new Error(`'${attrName}' is not a valid attribute. ` +
    `Supported attributes are '${ALL_ATTRS.join(', ')}'`);
}

/**
 * Get a regex that matches a whole word. For the ~= CSS attribute selector.
 *
 * @param {string} word
 * @returns {string} A regex "word" matcher
 */
function getWordMatcherRegex (word) {
  return `\\b(\\w*${_.escapeRegExp(word)}\\w*)\\b`;
}


class CssConverter {

  constructor (selector, pkg) {
    this.selector = selector;
    this.pkg = pkg;
  }

  /**
   * Add `<pkgName>:id/` prefix to beginning of string if it's not there already
   *
   * @param {string} locator The initial locator
   * @returns {string} String with `<pkgName>:id/` prepended (if it wasn't already)
   */
  formatIdLocator (locator) {
    return ID_LOCATOR_PATTERN.test(locator)
      ? locator
      : `${this.pkg || 'android'}:id/${locator}`;
  }

  /**
   * Convert a CSS attribute into a UiSelector method call
   *
   * @param {import('css-selector-parser').AstAttribute} cssAttr CSS attribute object
   * @returns {string} CSS attribute parsed as UiSelector
   */
  parseAttr (cssAttr) {
    // @ts-ignore Value should be present
    const attrValue = cssAttr.value?.value;
    if (!_.isString(attrValue) && !_.isEmpty(attrValue)) {
      throw new Error(`'${cssAttr.name}=${attrValue}' is an invalid attribute. ` +
        `Only 'string' and empty attribute types are supported. Found '${attrValue}'`);
    }
    const attrName = requireEntityName(cssAttr);
    const methodName = toSnakeCase(attrName);

    // Validate that it's a supported attribute
    if (!STR_ATTRS.includes(attrName) && !BOOLEAN_ATTRS.includes(attrName)) {
      throw new Error(`'${attrName}' is not supported. Supported attributes are ` +
        `'${[...STR_ATTRS, ...BOOLEAN_ATTRS].join(', ')}'`);
    }

    // Parse boolean, if it's a boolean attribute
    if (BOOLEAN_ATTRS.includes(attrName)) {
      return `.${methodName}(${requireBoolean(cssAttr)})`;
    }

    // Otherwise parse as string
    let value = attrValue || '';
    if (attrName === RESOURCE_ID) {
      value = this.formatIdLocator(value);
    }
    if (value === '') {
      return `.${methodName}Matches("")`;
    }

    switch (cssAttr.operator) {
      case '=':
        return `.${methodName}("${value}")`;
      case '*=':
        if (['description', 'text'].includes(attrName)) {
          return `.${methodName}Contains("${value}")`;
        }
        return `.${methodName}Matches("${_.escapeRegExp(value)}")`;
      case '^=':
        if (['description', 'text'].includes(attrName)) {
          return `.${methodName}StartsWith("${value}")`;
        }
        return `.${methodName}Matches("^${_.escapeRegExp(value)}")`;
      case '$=':
        return `.${methodName}Matches("${_.escapeRegExp(value)}$")`;
      case '~=':
        return `.${methodName}Matches("${getWordMatcherRegex(value)}")`;
      default:
        // Unreachable, but adding error in case a new CSS attribute is added.
        throw new Error(`Unsupported CSS attribute operator '${cssAttr.operator}'. ` +
          ` '=', '*=', '^=', '$=' and '~=' are supported.`);
    }
  }

  /**
   * Convert a CSS pseudo class to a UiSelector
   *
   * @param {import('css-selector-parser').AstPseudoClass} cssPseudo CSS Pseudo class
   * @returns {string|null|undefined} Pseudo selector parsed as UiSelector
   */
  parsePseudo (cssPseudo) {
    // @ts-ignore The attribute should exist
    const argValue = cssPseudo.argument?.value;
    if (!_.isString(argValue) && !_.isEmpty(argValue)) {
      throw new Error(`'${cssPseudo.name}=${argValue}'. ` +
        `Unsupported css pseudo class value: '${argValue}'. Only 'string' type or empty is supported.`);
    }

    const pseudoName = requireEntityName(cssPseudo);

    if (BOOLEAN_ATTRS.includes(pseudoName)) {
      return `.${toSnakeCase(pseudoName)}(${requireBoolean(cssPseudo)})`;
    }

    if (NUMERIC_ATTRS.includes(pseudoName)) {
      return `.${pseudoName}(${argValue})`;
    }
  }

  /**
   * Convert a CSS rule to a UiSelector
   * @param {import('css-selector-parser').AstRule} cssRule CSS rule definition
   */
  parseCssRule (cssRule) {
    if (cssRule.combinator && ![' ', '>'].includes(cssRule.combinator)) {
      throw new Error(`'${cssRule.combinator}' is not a supported combinator. ` +
        `Only child combinator (>) and descendant combinator are supported.`);
    }

    /** @type {string[]} */
    const uiAutomatorSelector = ['new UiSelector()'];
    /** @type {import('css-selector-parser').AstClassName[]} */
    // @ts-ignore This should work
    const astClassNames = cssRule.items.filter(({type}) => type === 'ClassName');
    const classNames = astClassNames.map(({name}) => name);
    /** @type {import('css-selector-parser').AstTagName|undefined} */
    // @ts-ignore This should work
    const astTag = cssRule.items.find(({type}) => type === 'TagName');
    const tagName = astTag?.name;
    if (tagName && tagName !== '*') {
      const androidClass = [tagName];
      if (classNames.length) {
        for (const cssClassNames of classNames) {
          androidClass.push(cssClassNames);
        }
        uiAutomatorSelector.push(`.className("${androidClass.join('.')}")`);
      } else {
        uiAutomatorSelector.push(`.classNameMatches("${tagName}")`);
      }
    } else if (classNames.length) {
      uiAutomatorSelector.push(`.classNameMatches("${classNames.join('\\.')}")`);
    }
    /** @type {import('css-selector-parser').AstId[]} */
    // @ts-ignore This should work
    const astIds = cssRule.items.filter(({type}) => type === 'Id');
    const ids = astIds.map(({name}) => name);
    if (ids.length) {
      uiAutomatorSelector.push(`.resourceId("${this.formatIdLocator(ids[0])}")`);
    }
    /** @type {import('css-selector-parser').AstAttribute[]} */
    // @ts-ignore This should work
    const attributes = cssRule.items.filter(({type}) => type === 'Attribute');
    for (const attr of attributes) {
      uiAutomatorSelector.push(this.parseAttr(attr));
    }
    /** @type {import('css-selector-parser').AstPseudoClass[]} */
    // @ts-ignore This should work
    const pseudoClasses = cssRule.items.filter(({type}) => type === 'PseudoClass');
    for (const pseudo of pseudoClasses) {
      const sel = this.parsePseudo(pseudo);
      if (sel) {
        uiAutomatorSelector.push(sel);
      }
    }
    if (cssRule.nestedRule) {
      uiAutomatorSelector.push(`.childSelector(${this.parseCssRule(cssRule.nestedRule)})`);
    }
    return uiAutomatorSelector.join('');
  }

  /**
   * Convert CSS object to UiAutomator2 selector
   * @param {import('css-selector-parser').AstSelector} css CSS object
   * @returns {string} The CSS object parsed as a UiSelector
   */
  parseCssObject (css) {
    if (!_.isEmpty(css.rules)) {
      return this.parseCssRule(css.rules[0]);
    }

    throw new Error('No rules could be parsed out of the current selector');
  }

  /**
   * Convert a CSS selector to a UiAutomator2 selector
   *
   * @returns {string} The CSS selector converted to a UiSelector
   */
  toUiAutomatorSelector () {
    let cssObj;
    try {
      cssObj = parseCssSelector(this.selector);
    } catch (e) {
      log.debug(e.stack);
      throw new errors.InvalidSelectorError(`Invalid CSS selector '${this.selector}'. Reason: '${e.message}'`);
    }
    try {
      return this.parseCssObject(cssObj);
    } catch (e) {
      log.debug(e.stack);
      throw new errors.InvalidSelectorError(`Unsupported CSS selector '${this.selector}'. Reason: '${e.message}'`);
    }
  }
}

export default CssConverter;
