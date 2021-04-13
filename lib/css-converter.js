import { CssSelectorParser } from 'css-selector-parser';
import { escapeRegExp } from 'lodash';
import { errors } from 'appium-base-driver';

const CssConverter = {};

const parser = new CssSelectorParser();
parser.registerSelectorPseudos('has');
parser.registerNestingOperators('>', '+', '~');
parser.registerAttrEqualityMods('^', '$', '*', '~');
parser.enableSubstitutes();

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
 * @param {string} str
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
 * @typedef {Object} CssNameValueObject
 * @property {?name} name The name of the CSS object
 * @property {?string} value The value of the CSS object
 */

/**
 * Get the boolean from a CSS object. If empty, return true. If not true/false/empty, throw exception
 *
 * @param {CssNameValueObject} css A CSS object that has 'name' and 'value'
 * @returns {string} Either 'true' or 'false'. If value is empty, return 'true'
 */
function assertGetBool (css) {
  const val = css.value?.toLowerCase() || 'true'; // an omitted boolean attribute means 'true' (e.g.: input[checked] means checked is true)
  if (['true', 'false'].includes(val)) {
    return val;
  }
  throw new Error(`'${css.name}' must be true, false or empty. Found '${css.value}'`);
}

/**
 * Get the canonical form of a CSS attribute name
 *
 * Converts to lowercase and if an attribute name is an alias for something else, return
 * what it is an alias for
 *
 * @param {Object} css CSS object
 * @returns {string} The canonical attribute name
 */
function assertGetAttrName (css) {
  const attrName = css.name.toLowerCase();

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
  return `\\b(\\w*${escapeRegExp(word)}\\w*)\\b`;
}

/**
 * Add android:id/ to beginning of string if it's not there already
 *
 * @param {string} locator The initial locator
 * @returns {string} String with `android:id/` prepended (if it wasn't already)
 */
function formatIdLocator (locator) {
  return ID_LOCATOR_PATTERN.test(locator) ? locator : `android:id/${locator}`;
}

/**
 * @typedef {Object} CssAttr
 * @property {?string} valueType Type of attribute (must be string or empty)
 * @property {?string} value Value of the attribute
 * @property {?string} operator The operator between value and value type (=, *=, , ^=, $=)
 */

/**
 * Convert a CSS attribute into a UiSelector method call
 *
 * @param {CssAttr} cssAttr CSS attribute object
 * @returns {string} CSS attribute parsed as UiSelector
 */
function parseAttr (cssAttr) {
  if (cssAttr.valueType && cssAttr.valueType !== 'string') {
    throw new Error(`'${cssAttr.name}=${cssAttr.value}' is an invalid attribute. ` +
      `Only 'string' and empty attribute types are supported. Found '${cssAttr.valueType}'`);
  }
  const attrName = assertGetAttrName(cssAttr);
  const methodName = toSnakeCase(attrName);

  // Validate that it's a supported attribute
  if (!STR_ATTRS.includes(attrName) && !BOOLEAN_ATTRS.includes(attrName)) {
    throw new Error(`'${attrName}' is not supported. Supported attributes are ` +
      `'${[...STR_ATTRS, ...BOOLEAN_ATTRS].join(', ')}'`);
  }

  // Parse boolean, if it's a boolean attribute
  if (BOOLEAN_ATTRS.includes(attrName)) {
    return `.${methodName}(${assertGetBool(cssAttr)})`;
  }

  // Otherwise parse as string
  let value = cssAttr.value || '';
  if (attrName === RESOURCE_ID) {
    value = formatIdLocator(value);
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
      return `.${methodName}Matches("${escapeRegExp(value)}")`;
    case '^=':
      if (['description', 'text'].includes(attrName)) {
        return `.${methodName}StartsWith("${value}")`;
      }
      return `.${methodName}Matches("^${escapeRegExp(value)}")`;
    case '$=':
      return `.${methodName}Matches("${escapeRegExp(value)}$")`;
    case '~=':
      return `.${methodName}Matches("${getWordMatcherRegex(value)}")`;
    default:
      // Unreachable, but adding error in case a new CSS attribute is added.
      throw new Error(`Unsupported CSS attribute operator '${cssAttr.operator}'. ` +
        ` '=', '*=', '^=', '$=' and '~=' are supported.`);
  }
}

/**
 * @typedef {Object} CssPseudo
 * @property {?string} valueType The type of CSS pseudo selector (https://www.npmjs.com/package/css-selector-parser for reference)
 * @property {?string} name The name of the pseudo selector
 * @property {?string} value The value of the pseudo selector
 */

/**
 * Convert a CSS pseudo class to a UiSelector
 *
 * @param {CssPseudo} cssPseudo CSS Pseudo class
 * @returns {string} Pseudo selector parsed as UiSelector
 */
function parsePseudo (cssPseudo) {
  if (cssPseudo.valueType && cssPseudo.valueType !== 'string') {
    throw new Error(`'${cssPseudo.name}=${cssPseudo.value}'. ` +
      `Unsupported css pseudo class value type: '${cssPseudo.valueType}'. Only 'string' type or empty is supported.`);
  }

  const pseudoName = assertGetAttrName(cssPseudo);

  if (BOOLEAN_ATTRS.includes(pseudoName)) {
    return `.${toSnakeCase(pseudoName)}(${assertGetBool(cssPseudo)})`;
  }

  if (NUMERIC_ATTRS.includes(pseudoName)) {
    return `.${pseudoName}(${cssPseudo.value})`;
  }
}

/**
 * @typedef {Object} CssRule
 * @property {?string} nestingOperator The nesting operator (aka: combinator https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
 * @property {?string} tagName The tag name (aka: type selector https://developer.mozilla.org/en-US/docs/Web/CSS/Type_selectors)
 * @property {?string[]} classNames An array of CSS class names
 * @property {?CssAttr[]} attrs An array of CSS attributes
 * @property {?CssPseudo[]} attrs An array of CSS pseudos
 * @property {?string} id CSS identifier
 * @property {?CssRule} rule A descendant of this CSS rule
 */

/**
 * Convert a CSS rule to a UiSelector
 * @param {CssRule} cssRule CSS rule definition
 */
function parseCssRule (cssRule) {
  const { nestingOperator } = cssRule;
  if (nestingOperator && nestingOperator !== ' ') {
    throw new Error(`'${nestingOperator}' is not a supported combinator. ` +
      `Only child combinator (>) and descendant combinator are supported.`);
  }

  let uiAutomatorSelector = 'new UiSelector()';
  if (cssRule.tagName && cssRule.tagName !== '*') {
    let androidClass = [cssRule.tagName];
    if (cssRule.classNames) {
      for (const cssClassNames of cssRule.classNames) {
        androidClass.push(cssClassNames);
      }
      uiAutomatorSelector += `.className("${androidClass.join('.')}")`;
    } else {
      uiAutomatorSelector += `.classNameMatches("${cssRule.tagName}")`;
    }
  } else if (cssRule.classNames) {
    uiAutomatorSelector += `.classNameMatches("${cssRule.classNames.join('\\.')}")`;
  }
  if (cssRule.id) {
    uiAutomatorSelector += `.resourceId("${formatIdLocator(cssRule.id)}")`;
  }
  if (cssRule.attrs) {
    for (const attr of cssRule.attrs) {
      uiAutomatorSelector += parseAttr(attr);
    }
  }
  if (cssRule.pseudos) {
    for (const pseudo of cssRule.pseudos) {
      uiAutomatorSelector += parsePseudo(pseudo);
    }
  }
  if (cssRule.rule) {
    uiAutomatorSelector += `.childSelector(${parseCssRule(cssRule.rule)})`;
  }
  return uiAutomatorSelector;
}

/**
 * @typedef {Object} CssObject
 * @property {?string} type Type of CSS object. 'rule', 'ruleset' or 'selectors'
 */

/**
 * Convert CSS object to UiAutomator2 selector
 * @param {CssObject} css CSS object
 * @returns {string} The CSS object parsed as a UiSelector
 */
function parseCssObject (css) {
  switch (css.type) {
    case 'rule':
      return parseCssRule(css);
    case 'ruleSet':
      return parseCssObject(css.rule);
    case 'selectors':
      return css.selectors.map((selector) => parseCssObject(selector)).join('; ');

    default:
      // This is never reachable, but if it ever is do this.
      throw new Error(`UiAutomator does not support '${css.type}' css. Only supports 'rule', 'ruleSet', 'selectors' `);
  }
}

/**
 * Convert a CSS selector to a UiAutomator2 selector
 * @param {string} cssSelector CSS Selector
 * @returns {string} The CSS selector converted to a UiSelector
 */
CssConverter.toUiAutomatorSelector = function toUiAutomatorSelector (cssSelector) {
  let cssObj;
  try {
    cssObj = parser.parse(cssSelector);
  } catch (e) {
    throw new errors.InvalidSelectorError(`Invalid CSS selector '${cssSelector}'. Reason: '${e}'`);
  }
  try {
    return parseCssObject(cssObj);
  } catch (e) {
    throw new errors.InvalidSelectorError(`Unsupported CSS selector '${cssSelector}'. Reason: '${e}'`);
  }
};

export default CssConverter;