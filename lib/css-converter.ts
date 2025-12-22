import {createParser} from 'css-selector-parser';
import type {
  AstAttribute,
  AstClassName,
  AstId,
  AstPseudoClass,
  AstRule,
  AstSelector,
  AstTagName,
} from 'css-selector-parser';
import _ from 'lodash';
import {errors} from 'appium/driver';
import {log} from './logger';

const parseCssSelector = createParser({
  syntax: {
    pseudoClasses: {
      unknown: 'accept',
      definitions: {
        Selector: ['has'],
      },
    },
    combinators: ['>', '+', '~'],
    attributes: {
      operators: ['^=', '$=', '*=', '~=', '='],
    },
    ids: true,
    classNames: true,
    tag: {
      wildcard: true,
    },
  },
  substitutes: true,
});

const RESOURCE_ID = 'resource-id';
const ID_LOCATOR_PATTERN = /^[a-zA-Z_][a-zA-Z0-9._]*:id\/[\S]+$/;

const BOOLEAN_ATTRS = [
  'checkable',
  'checked',
  'clickable',
  'enabled',
  'focusable',
  'focused',
  'long-clickable',
  'scrollable',
  'selected',
] as const;

const NUMERIC_ATTRS = ['index', 'instance'] as const;

const STR_ATTRS = ['description', RESOURCE_ID, 'text', 'class-name', 'package-name'] as const;

const ALL_ATTRS = [...BOOLEAN_ATTRS, ...NUMERIC_ATTRS, ...STR_ATTRS] as readonly string[];

const ATTRIBUTE_ALIASES: Array<[string, string[]]> = [
  [RESOURCE_ID, ['id']],
  [
    'description',
    ['content-description', 'content-desc', 'desc', 'accessibility-id'],
  ],
  ['index', ['nth-child']],
];

const isAstAttribute = (item: {type?: string}): item is AstAttribute =>
  item.type === 'Attribute';
const isAstPseudoClass = (item: {type?: string}): item is AstPseudoClass =>
  item.type === 'PseudoClass';
const isAstClassName = (item: {type?: string}): item is AstClassName =>
  item.type === 'ClassName';
const isAstTagName = (item: {type?: string}): item is AstTagName => item.type === 'TagName';
const isAstId = (item: {type?: string}): item is AstId => item.type === 'Id';

function toSnakeCase(str?: string | null): string {
  if (!str) {
    return '';
  }
  const tokens = str
    .split('-')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase());
  const out = tokens.join('');
  return out.charAt(0).toLowerCase() + out.slice(1);
}

function requireBoolean(css: AstAttribute | AstPseudoClass): 'true' | 'false' {
  const rawValue = (css as any).value?.value ?? (css as any).argument?.value;
  const value = _.toLower(rawValue ?? 'true');
  if (value === 'true') {
    return 'true';
  }
  if (value === 'false') {
    return 'false';
  }
  throw new Error(
    `'${css.name}' must be true, false or empty. Found '${(css as any).value}'`,
  );
}

function requireEntityName(cssEntity: AstAttribute | AstPseudoClass): string {
  const attrName = cssEntity.name.toLowerCase();

  if (ALL_ATTRS.includes(attrName)) {
    return attrName;
  }

  for (const [officialAttr, aliasAttrs] of ATTRIBUTE_ALIASES) {
    if (aliasAttrs.includes(attrName)) {
      return officialAttr;
    }
  }
  throw new Error(
    `'${attrName}' is not a valid attribute. Supported attributes are '${ALL_ATTRS.join(', ')}'`,
  );
}

function getWordMatcherRegex(word: string): string {
  return `\\b(\\w*${_.escapeRegExp(word)}\\w*)\\b`;
}

export class CssConverter {
  constructor(
    private readonly selector: string,
    private readonly pkg?: string | null,
  ) {}

  toUiAutomatorSelector(): string {
    let cssObj: AstSelector;
    try {
      cssObj = parseCssSelector(this.selector) as AstSelector;
    } catch (e: any) {
      log.debug(e.stack);
      throw new errors.InvalidSelectorError(
        `Invalid CSS selector '${this.selector}'. Reason: '${e.message}'`,
      );
    }
    try {
      return this.parseCssObject(cssObj);
    } catch (e: any) {
      log.debug(e.stack);
      throw new errors.InvalidSelectorError(
        `Unsupported CSS selector '${this.selector}'. Reason: '${e.message}'`,
      );
    }
  }

  private formatIdLocator(locator: string): string {
    return ID_LOCATOR_PATTERN.test(locator) ? locator : `${this.pkg || 'android'}:id/${locator}`;
  }

  private parseAttr(cssAttr: AstAttribute): string {
    const attrValueNode = cssAttr.value as {value?: string} | undefined;
    const attrValue = attrValueNode?.value;
    if (!_.isString(attrValue) && !_.isEmpty(attrValue)) {
      throw new Error(
        `'${cssAttr.name}=${attrValue}' is an invalid attribute. Only 'string' and empty attribute types are supported. Found '${attrValue}'`,
      );
    }
    const attrName = requireEntityName(cssAttr);
    const methodName = toSnakeCase(attrName);

    if (!STR_ATTRS.includes(attrName as (typeof STR_ATTRS)[number]) && !BOOLEAN_ATTRS.includes(attrName as (typeof BOOLEAN_ATTRS)[number])) {
      throw new Error(
        `'${attrName}' is not supported. Supported attributes are '${[...STR_ATTRS, ...BOOLEAN_ATTRS].join(', ')}'`,
      );
    }

    if (BOOLEAN_ATTRS.includes(attrName as (typeof BOOLEAN_ATTRS)[number])) {
      return `.${methodName}(${requireBoolean(cssAttr)})`;
    }

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
        throw new Error(
          `Unsupported CSS attribute operator '${cssAttr.operator}'.  '=', '*=', '^=', '$=' and '~=' are supported.`,
        );
    }
  }

  private parsePseudo(cssPseudo: AstPseudoClass): string | undefined {
    const argValue = (cssPseudo.argument as {value?: string} | undefined)?.value;
    if (!_.isString(argValue) && !_.isEmpty(argValue)) {
      throw new Error(
        `'${cssPseudo.name}=${argValue}'. Unsupported css pseudo class value: '${argValue}'. Only 'string' type or empty is supported.`,
      );
    }

    const pseudoName = requireEntityName(cssPseudo);

    if (BOOLEAN_ATTRS.includes(pseudoName as (typeof BOOLEAN_ATTRS)[number])) {
      return `.${toSnakeCase(pseudoName)}(${requireBoolean(cssPseudo)})`;
    }

    if (NUMERIC_ATTRS.includes(pseudoName as (typeof NUMERIC_ATTRS)[number])) {
      return `.${pseudoName}(${argValue})`;
    }
  }

  private parseCssRule(cssRule: AstRule): string {
    if (cssRule.combinator && ![' ', '>'].includes(cssRule.combinator)) {
      throw new Error(
        `'${cssRule.combinator}' is not a supported combinator. Only child combinator (>) and descendant combinator are supported.`,
      );
    }

    const uiAutomatorSelector: string[] = ['new UiSelector()'];
    const items = cssRule.items ?? [];

    const astClassNames = items.filter(isAstClassName);
    const classNames = astClassNames.map(({name}) => name);

    const astTag = items.find(isAstTagName);
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

    const astIds = items.filter(isAstId);
    const ids = astIds.map(({name}) => name);
    if (ids.length) {
      uiAutomatorSelector.push(`.resourceId("${this.formatIdLocator(ids[0])}")`);
    }

    const attributes = items.filter(isAstAttribute);
    for (const attr of attributes) {
      uiAutomatorSelector.push(this.parseAttr(attr));
    }

    const pseudoClasses = items.filter(isAstPseudoClass);
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

  private parseCssObject(css: AstSelector): string {
    if (!_.isEmpty(css.rules)) {
      return this.parseCssRule(css.rules[0] as AstRule);
    }

    throw new Error('No rules could be parsed out of the current selector');
  }
}
