import { CssSelectorParser } from 'css-selector-parser';
import log from './logger';

const CssConverter = {};

const parser = new CssSelectorParser();
parser.registerSelectorPseudos('has');
parser.registerNestingOperators('>', '+', '~');
parser.registerAttrEqualityMods('^', '$', '*', '~');
parser.enableSubstitutes();


const booleanAttrs = [
  'checkable', 'checked', 'clickable', 'enabled', 'focusable',
  'focused', 'long-clickable', 'scrollable', 'selected',
];

const numericAttrs = [
  'index', 'instance',
];

const strAttrs = [
  'description', 'resource-id', 'text', 'class-name', 'package-name'
];

const allAttrs = [
  ...booleanAttrs,
  ...numericAttrs,
  ...strAttrs,
];

const attributeAliases = [
  ['resource-id', ['id']],
  ['description', [
    'content-description', 'content-desc',
    'desc', 'accessibility-id',
  ]],
  ['index', ['nth-child']],
];

/**
 * Convert hyphen separated word to snake case
 * @param {String} str
 */
function toSnakeCase (str) {
  const tokens = str.split('-').map((str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
  let out = tokens.join('');
  return out.charAt(0).toLowerCase() + out.slice(1);
}

function assertGetBool (css) {
  const val = css.value?.toLowerCase() || 'true';
  if (['true', 'false'].includes(val)) {
    return val;
  }
  log.errorAndThrow(`Could not parse '${css.name}=${css.value}'. '${css.name}' must be true, false or empty`);
}

/**
 * Get the canonical form of a CSS attribute name
 *
 * Converts to lowercase and if an attribute name is an alias for something else, return
 * what it is an alias for
 *
 * @param {*} css CSS object
 */
function assertGetAttrName (css) {
  const attrName = css.name.toLowerCase();

  // Check if it's supported and if it is, return it
  if (allAttrs.includes(attrName)) {
    return attrName.toLowerCase();
  }

  // If attrName is an alias for something else, return that
  for (let [officialAttr, aliasAttrs] of attributeAliases) {
    if (aliasAttrs.includes(attrName)) {
      return officialAttr;
    }
  }
  log.errorAndThrow(`'${attrName}' is not a valid attribute. ` +
    `Supported attributes are '${allAttrs.join(', ')}'`);
}

function getWordMatcherRegex (word) {
  return `\\b(\\w*${escapeRegexLiterals(word)}\\w*)\\b`;
}

function escapeRegexLiterals (str) {
  // The no-useless-escape regex rule is wrong when it's in a Regex. These escapes are intentional.
  // eslint-disable-next-line no-useless-escape
  return str.replace(/[\[\^\$\.\|\?\*\+\(\)\\]/g, (tok) => `\\${tok}`);
}

function prependAndroidId (str) {
  if (!str.startsWith('android:id/')) {
    return `android:id/${str}`;
  }
  return str;
}

/**
 * Convert a CSS attribute into a UiSelector method call
 * @param {*} cssAttr CSS attribute object
 */
function parseAttr (cssAttr) {
  if (cssAttr.valueType && cssAttr.valueType !== 'string') {
    log.errorAndThrow(`Could not parse '${cssAttr.name}=${cssAttr.value}'.` +
      `Unsupported attribute type '${cssAttr.valueType}'`);
  }
  const attrName = assertGetAttrName(cssAttr);
  const methodName = toSnakeCase(attrName);
  if (booleanAttrs.includes(attrName)) {
    return `.${methodName}(${assertGetBool(cssAttr)})`;
  }

  if (strAttrs.includes(attrName)) {
    let value = cssAttr.value || '';
    if (attrName === 'resource-id') {
      value = prependAndroidId(value);
    }
    if (value === '') {
      return `.${methodName}Matches("")`;
    } else {
      switch (cssAttr.operator) {
        case '=':
          return `.${methodName}("${value}")`;
        case '*=':
          if (['description', 'text'].includes(attrName)) {
            return `.${methodName}Contains("${value}")`;
          }
          return `.${methodName}Matches("${escapeRegexLiterals(value)}")`;
        case '^=':
          if (['description', 'text'].includes(attrName)) {
            return `.${methodName}StartsWith("${value}")`;
          }
          return `.${methodName}Matches("^${escapeRegexLiterals(value)}")`;
        case '$=':
          return `.${methodName}Matches("${escapeRegexLiterals(value)}$")`;
        case '~=':
          return `.${methodName}Matches("${getWordMatcherRegex(value)}")`;
        default:
          log.errorAndThrow(`Unsupported CSS attribute operator '${cssAttr.operator}'`);
      }
    }
  }
}

/**
 * Convert a CSS pseudo class to a UiSelector
 * @param {*} cssPseudo CSS Pseudo class
 */
function parsePseudo (cssPseudo) {
  if (cssPseudo.valueType && cssPseudo.valueType !== 'string') {
    log.errorAndThrow(`Could not parse '${cssPseudo.name}=${cssPseudo.value}'. ` +
      `Unsupported css pseudo class value type: '${cssPseudo.valueType}'`);
  }

  const pseudoName = assertGetAttrName(cssPseudo);

  if (booleanAttrs.includes(pseudoName)) {
    return `.${toSnakeCase(pseudoName)}(${assertGetBool(cssPseudo)})`;
  }

  if (numericAttrs.includes(pseudoName)) {
    return `.${pseudoName}(${cssPseudo.value})`;
  }
}

/**
 * Convert a CSS rule to a UiSelector
 * @param {*} cssRule CSS rule definition
 */
function parseCssRule (cssRule) {
  let uiAutomatorSelector = 'new UiSelector()';
  if (cssRule.tagName && cssRule.tagName !== '*') {
    let androidClass = [cssRule.tagName];
    for (const cssClassNames of (cssRule.classNames || [])) {
      androidClass.push(cssClassNames);
    }
    uiAutomatorSelector += `.className("${androidClass.join('.')}")`;
  } else if (cssRule.classNames) {
    uiAutomatorSelector += `.classNameMatches("\\.${cssRule.classNames.join('\\.')}")`;
  }
  if (cssRule.id) {
    uiAutomatorSelector += `.resourceId("${prependAndroidId(cssRule.id)}")`;
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
 * Convert CSS object to UiAutomator2 selector
 * @param {*} css CSS object
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
      throw new Error(`UiAutomator does not support '${css.type}' css`);
  }
}

/**
 * Convert a CSS selector to a UiAutomator2 selector
 * @param {string} cssSelector CSS Selector
 */
CssConverter.toUiAutomatorSelector = function toUiAutomatorSelector (cssSelector) {
  let cssObj;
  try {
    cssObj = parser.parse(cssSelector);
  } catch (e) {
    log.errorAndThrow(`Could not parse CSS. Reason: '${e}'`);
  }
  return parseCssObject(cssObj);
};



export default CssConverter;