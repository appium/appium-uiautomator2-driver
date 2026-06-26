import {escapeRegExp} from '../utils/index.js';
import type {
  ParsedAttribute,
  ParsedRule,
  ParsedSelector,
  StrategyEmitter,
} from '@appium/css-locator-to-native';

const BOOLEAN_ATTRS = new Set([
  'checkable',
  'checked',
  'clickable',
  'enabled',
  'focusable',
  'focused',
  'long-clickable',
  'scrollable',
  'selected',
]);

const NUMERIC_ATTRS = new Set(['index', 'instance']);

const STRING_ATTRS = new Set(['description', 'resource-id', 'text', 'class-name', 'package-name']);

const ID_LOCATOR_PATTERN = /^[a-zA-Z_][a-zA-Z0-9._]*:id\/[\S]+$/;

export interface UiAutomatorEmitterContext {
  appPackage?: string | null;
}

/** Converts parsed CSS selectors into UiAutomator selector strings. */
export class UiAutomatorEmitter implements StrategyEmitter<UiAutomatorEmitterContext> {
  readonly strategy: string;

  constructor(strategy: string) {
    this.strategy = strategy;
  }

  emit(parsed: ParsedSelector, ctx?: UiAutomatorEmitterContext): string {
    return this.emitRule(parsed.rule, ctx);
  }

  private emitRule(rule: ParsedRule, ctx?: UiAutomatorEmitterContext): string {
    const parts: string[] = ['new UiSelector()'];

    const tagName = rule.tag;
    const classNames = [...rule.classes];

    if (tagName && tagName !== '*') {
      if (classNames.length) {
        parts.push(`.className("${[tagName, ...classNames].join('.')}")`);
      } else {
        parts.push(`.classNameMatches("${tagName}")`);
      }
    } else if (classNames.length) {
      parts.push(`.classNameMatches("${classNames.join('\\.')}")`);
    }

    if (rule.id) {
      parts.push(`.resourceId("${this.formatIdLocator(rule.id, ctx?.appPackage)}")`);
    }

    for (const attr of rule.attributes) {
      parts.push(this.formatEntity(attr, ctx));
    }

    for (const pseudo of rule.pseudos) {
      const formatted = this.formatEntity(pseudo, ctx);
      if (formatted) {
        parts.push(formatted);
      }
    }

    if (rule.nested) {
      parts.push(`.childSelector(${this.emitRule(rule.nested, ctx)})`);
    }

    return parts.join('');
  }

  private formatEntity(attr: ParsedAttribute, ctx?: UiAutomatorEmitterContext): string {
    if (BOOLEAN_ATTRS.has(attr.name)) {
      return this.formatBoolean(attr);
    }
    if (NUMERIC_ATTRS.has(attr.name)) {
      return `.${attr.name}(${attr.value})`;
    }
    if (STRING_ATTRS.has(attr.name)) {
      return this.formatStringAttr(attr, ctx);
    }
    return '';
  }

  private formatBoolean(attr: ParsedAttribute): string {
    const value = attr.value ?? 'true';
    return `.${toSnakeCase(attr.name)}(${value})`;
  }

  private formatStringAttr(attr: ParsedAttribute, ctx?: UiAutomatorEmitterContext): string {
    const methodName = toSnakeCase(attr.name);
    let value = attr.value ?? '';

    if (attr.name === 'resource-id') {
      value = this.formatIdLocator(value, ctx?.appPackage);
    }

    if (value === '') {
      return `.${methodName}Matches("")`;
    }

    switch (attr.operator) {
      case '=':
        return `.${methodName}("${value}")`;
      case '*=':
        if (['description', 'text'].includes(attr.name)) {
          return `.${methodName}Contains("${value}")`;
        }
        return `.${methodName}Matches("${escapeRegExp(value)}")`;
      case '^=':
        if (['description', 'text'].includes(attr.name)) {
          return `.${methodName}StartsWith("${value}")`;
        }
        return `.${methodName}Matches("^${escapeRegExp(value)}")`;
      case '$=':
        return `.${methodName}Matches("${escapeRegExp(value)}$")`;
      case '~=':
        return `.${methodName}Matches("${getWordMatcherRegex(value)}")`;
      default:
        return `.${methodName}("${value}")`;
    }
  }

  private formatIdLocator(locator: string, appPackage?: string | null): string {
    return ID_LOCATOR_PATTERN.test(locator) ? locator : `${appPackage || 'android'}:id/${locator}`;
  }
}

function toSnakeCase(str: string): string {
  const tokens = str
    .split('-')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase());
  const out = tokens.join('');
  return out.charAt(0).toLowerCase() + out.slice(1);
}

function getWordMatcherRegex(word: string): string {
  return `\\b(\\w*${escapeRegExp(word)}\\w*)\\b`;
}
