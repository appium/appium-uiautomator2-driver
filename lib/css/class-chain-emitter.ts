import type {ParsedAttribute, ParsedRule, ParsedSelector, StrategyEmitter} from '@appium/css-locator-to-native';
import {errors} from 'appium/driver.js';
import {util} from 'appium/support.js';

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

/** CSS attribute name -> element attribute used in the predicates. */
const STRING_ATTRS: Record<string, string> = {
  description: 'content-desc',
  'resource-id': 'resource-id',
  text: 'text',
  'class-name': 'class',
  'package-name': 'package',
};

/** The old UiSelector methods matched these two attributes without respect to the case. */
const CASE_INSENSITIVE_ATTRS = new Set(['description', 'text']);

const ID_LOCATOR_PATTERN = /^[a-zA-Z_][a-zA-Z0-9._]*:id\/[\S]+$/;

export interface ClassChainEmitterContext {
  appPackage?: string | null;
}

/** Converts parsed CSS selectors into class chain strings. */
export class ClassChainEmitter implements StrategyEmitter<ClassChainEmitterContext> {
  readonly strategy: string;

  constructor(strategy: string) {
    this.strategy = strategy;
  }

  emit(parsed: ParsedSelector, ctx?: ClassChainEmitterContext): string {
    return this.emitRule(parsed.rule, ctx);
  }

  /** Splits a rule into the type of a step, the predicates that restrict it and an optional position. */
  protected buildStep(
    rule: ParsedRule,
    ctx?: ClassChainEmitterContext,
  ): {type: string; predicates: string[]; position?: number} {
    const {type, predicates: classPredicates} = this.formatClass(rule);
    const predicates = [...classPredicates];
    let position: number | undefined;

    if (rule.id) {
      predicates.push(`resource-id == ${quote(this.formatIdLocator(rule.id, ctx?.appPackage))}`);
    }
    for (const attr of [...rule.attributes, ...rule.pseudos]) {
      if (attr.name === 'instance') {
        // instance() is zero-based, positions of a class chain start with 1
        position = Number(attr.value) + 1;
        continue;
      }
      predicates.push(this.formatPredicate(attr, ctx));
    }
    return {type, predicates, position};
  }

  private emitRule(rule: ParsedRule, ctx?: ClassChainEmitterContext): string {
    const {type, predicates, position} = this.buildStep(rule, ctx);

    let step = type;
    if (predicates.length) {
      step += `[\`${predicates.join(' AND ').replaceAll('`', '``')}\`]`;
    }
    if (position !== undefined) {
      step += `[${position}]`;
    }

    // The first rule is searched for anywhere, the nested ones relative to the previous one
    const separator = !rule.combinator ? '**/' : rule.combinator === 'child' ? '/' : '/**/';
    const chain = `${separator}${step}`;
    return rule.nested ? `${chain}${this.emitRule(rule.nested, ctx)}` : chain;
  }

  /** A fully qualified class is the type of a step, a partial one (`TextView`, `.widget.TextView`) is a suffix. */
  private formatClass(rule: ParsedRule): {type: string; predicates: string[]} {
    const tagName = rule.tag && rule.tag !== '*' ? rule.tag : '';
    const classNames = [...rule.classes];
    if (tagName && classNames.length) {
      return {type: [tagName, ...classNames].join('.'), predicates: []};
    }
    const partialName = [tagName, ...classNames].filter(Boolean).join('.');
    if (!partialName) {
      return {type: '*', predicates: []};
    }
    // The name may also be the whole class name, e.g. an unqualified one, which has no leading dot
    const predicate = `(class == ${quote(partialName)} OR class ENDSWITH ${quote(`.${partialName}`)})`;
    return {type: '*', predicates: [predicate]};
  }

  private formatPredicate(attr: ParsedAttribute, ctx?: ClassChainEmitterContext): string {
    if (BOOLEAN_ATTRS.has(attr.name)) {
      return `${attr.name} == ${attr.value ?? 'true'}`;
    }
    if (attr.name === 'index') {
      return `index == ${attr.value}`;
    }
    return this.formatStringPredicate(attr, ctx);
  }

  private formatStringPredicate(attr: ParsedAttribute, ctx?: ClassChainEmitterContext): string {
    const name = STRING_ATTRS[attr.name];
    if (!name) {
      throw new errors.InvalidSelectorError(`Unsupported attribute '${attr.name}'`);
    }
    if (attr.operator === undefined) {
      // A missing value also satisfies `!= ''`, so it has to be excluded explicitly
      return `${name} != nil AND ${name} != ''`;
    }

    let value = attr.value ?? '';
    // Only an exact id is qualified, substring operators get the fragment as is
    if (attr.name === 'resource-id' && (attr.operator === '=' || attr.operator === undefined)) {
      value = this.formatIdLocator(value, ctx?.appPackage);
    }
    const modifier = CASE_INSENSITIVE_ATTRS.has(attr.name) ? '[c]' : '';
    switch (attr.operator) {
      case '*=':
        return `${name} CONTAINS${modifier} ${quote(value)}`;
      case '^=':
        return `${name} BEGINSWITH${modifier} ${quote(value)}`;
      case '$=':
        return `${name} ENDSWITH ${quote(value)}`;
      case '~=':
        // CSS words are whitespace-delimited, so an empty value or one with whitespace never matches
        if (!value || /\s/.test(value)) {
          return 'FALSEPREDICATE';
        }
        return `${name} MATCHES ${quote(getWordMatcherRegex(value))}`;
      default:
        return `${name} == ${quote(value)}`;
    }
  }

  private formatIdLocator(locator: string, appPackage?: string | null): string {
    return ID_LOCATOR_PATTERN.test(locator) ? locator : `${appPackage || 'android'}:id/${locator}`;
  }
}

/**
 * Converts a parsed CSS selector that is a single rule without a position into a predicate string.
 * It is the same as a class chain of a single step with the predicate, but shorter.
 */
export class PredicateStringEmitter extends ClassChainEmitter {
  override emit(parsed: ParsedSelector, ctx?: ClassChainEmitterContext): string {
    const {type, predicates} = this.buildStep(parsed.rule, ctx);
    const all = type === '*' ? predicates : [`class == ${quote(type)}`, ...predicates];
    return all.length ? all.join(' AND ') : 'TRUEPREDICATE';
  }
}

/** Whether the selector needs a class chain: it has more than one rule or selects a position. */
export function needsClassChain(parsed: ParsedSelector): boolean {
  const {rule} = parsed;
  return Boolean(rule.nested) || [...rule.attributes, ...rule.pseudos].some((attr) => attr.name === 'instance');
}

/** Quotes a predicate string literal: the backslash and the quote are the only characters to escape. */
function quote(value: string): string {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function getWordMatcherRegex(word: string): string {
  return `(?s)(.*\\s)?${util.escapeRegExp(word)}(\\s.*)?`;
}
