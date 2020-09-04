import { CssSelectorParser } from 'css-selector-parser';

const CssConverter = {};

const parser = new CssSelectorParser();
parser.registerSelectorPseudos('has');
parser.registerNestingOperators('>', '+', '~');
parser.registerAttrEqualityMods('^', '$', '*', '~');
parser.enableSubstitutes();

CssConverter.toUiAutomatorSelector = function (cssSelector) {
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

  function toSnakeCase (str) {
    const tokens = str.split('-').map((str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
    let out = tokens.join('');
    return out.charAt(0).toLowerCase() + out.slice(1);
  }

  function getAttrName (attrName) {
    attrName = attrName.toLowerCase();

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
    throw new Error(`Unsupported attribute: '${attrName}'`);
  }

  function escapeRegexLiterals (str) {
    return str.replace(/[\[\^\$\.\|\?\*\+\(\)\\]/g, (tok) => `\\${tok}`);
  }

  function prependAndroidId (str) {
    if (!str.startsWith("android:id/")) {
      return `android:id/${str}`;
    }
    return str;
  }

  function parseAttr (cssAttr) {
    const attrName = getAttrName(cssAttr.name);
    const methodName = toSnakeCase(attrName);
    if (booleanAttrs.includes(attrName)) {
      const value = cssAttr.value?.toLowerCase() || '';
      if (['', 'true', 'false'].includes(value)) {
        return `.${methodName}(${value})`;
      }
      throw new Error();
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
            return `.${methodName}Matches()`;
          default:
            throw new Error(`Unsupported CSS attribute operator '${cssAttr.operator}'`);
        }
      }
    }
  }

  function parsePseudo (cssPseudo) {
    const pseudoName = getAttrName(cssPseudo.name);
    if (booleanAttrs.includes(pseudoName)) {
      return `.${toSnakeCase(pseudoName)}()`;
    }

    if (numericAttrs.includes(pseudoName)) {
      return `.${pseudoName}(${cssPseudo.value})`;
    }
  }

  function parseRule (rule) {
    let uiAutomatorSelector = "new UiSelector()";
    if (rule.tagName && rule.tagName != '*') {
      let androidClass = [rule.tagName];
      for (const cssClassNames of (rule.classNames || [])) {
        androidClass.push(cssClassNames);
      }
      uiAutomatorSelector += `.className("${androidClass.join('.')}")`;
    } else if (rule.classNames) {
      uiAutomatorSelector += `.classNameMatches("\\.${rule.classNames.join('\\.')}")`;
    }
    if (rule.id) {
      uiAutomatorSelector += `.resourceId("${prependAndroidId(rule.id)}")`;
    }
    if (rule.attrs) {
      for (const attr of rule.attrs) {
        uiAutomatorSelector += parseAttr(attr);
      }
    }
    if (rule.pseudos) {
      for (const pseudo of rule.pseudos) {
        uiAutomatorSelector += parsePseudo(pseudo);
      }
    }
    if (rule.rule) {
      uiAutomatorSelector += `.childSelector(${parseRule(rule.rule)})`;
    }
    return uiAutomatorSelector;
  }

  const css = parser.parse(cssSelector);

  switch (css.type) {
    case 'ruleSet':
      return parseRule(css.rule);
    case 'selectors':
      console.log(css); process.exit();
    default:
      throw new Error(`UiAutomator does not support '${css.type}' css`);
  }

  if (css.type === 'ruleSet') {
  } else if (css.type === 'selectors') {
    throw new Error('TODO: Add multiple selectors');
  }
  return uiAutomatorSelector;
};



export default CssConverter;