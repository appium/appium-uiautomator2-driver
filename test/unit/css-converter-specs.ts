import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {cssToNativeLocator, CLASS_CHAIN_STRATEGY, PREDICATE_STRATEGY} from '../../lib/css/index.js';

describe('css-converter.js', function () {
  describe('simple cases', function () {
    const predicateCases: Array<[string, string]> = [
      ['android.widget.TextView', "class == 'android.widget.TextView'"],
      ['TextView', "(class == 'TextView' OR class ENDSWITH '.TextView')"],
      ['.TextView', "(class == 'TextView' OR class ENDSWITH '.TextView')"],
      ['SpinnerItem', "(class == 'SpinnerItem' OR class ENDSWITH '.SpinnerItem')"],
      ['.widget.TextView', "(class == 'widget.TextView' OR class ENDSWITH '.widget.TextView')"],
      ['.android.widget.TextView', "(class == 'android.widget.TextView' OR class ENDSWITH '.android.widget.TextView')"],
      [
        '.android.widget.TextView[text=foo]',
        "(class == 'android.widget.TextView' OR class ENDSWITH '.android.widget.TextView') AND text == 'foo'",
      ],
      ['*', 'TRUEPREDICATE'],
      ['*[checkable=true]', 'checkable == true'],
      ['*[checkable=false]', 'checkable == false'],
      ['*[checkable]', 'checkable == true'],
      ['*:checked', 'checked == true'],
      ['*[checked]', 'checked == true'],
      [
        'TextView[description="Some description"]',
        "(class == 'TextView' OR class ENDSWITH '.TextView') AND content-desc == 'Some description'",
      ],
      ['*[description]', "content-desc != nil AND content-desc != ''"],
      ['*[resource-id]', "resource-id != nil AND resource-id != ''"],
      ['*[description=""]', "content-desc == ''"],
      ['*[description^=blah]', "content-desc BEGINSWITH[c] 'blah'"],
      ['*[description$=bar]', "content-desc ENDSWITH 'bar'"],
      ['*[description*=bar]', "content-desc CONTAINS[c] 'bar'"],
      ['*[text*=bar]', "text CONTAINS[c] 'bar'"],
      ['*[package-name="com.example"]', "package == 'com.example'"],
      ['#identifier[description=foo]', "resource-id == 'android:id/identifier' AND content-desc == 'foo'"],
      ['*[id=foo]', "resource-id == 'android:id/foo'"],
      ['*[id="com.example:id/foo"]', "resource-id == 'com.example:id/foo'"],
      ['*[resource-id$=submit]', "resource-id ENDSWITH 'submit'"],
      ['*[resource-id^=checkout]', "resource-id BEGINSWITH 'checkout'"],
      ['*[resource-id*=out_sub]', "resource-id CONTAINS 'out_sub'"],
      ['*[description$="hello [ ^ $ . | ? * + ( ) world"]', "content-desc ENDSWITH 'hello [ ^ $ . | ? * + ( ) world'"],
      ['*[text="a\\\\b"]', "text == 'a\\\\b'"],
      ['*[text="a`b"]', "text == 'a`b'"],
      ['TextView:iNdEx(4)', "(class == 'TextView' OR class ENDSWITH '.TextView') AND index == 4"],
      ['*:long-clickable', 'long-clickable == true'],
      ['*[lOnG-cLiCkAbLe]', 'long-clickable == true'],
      ['*:nth-child(3)', 'index == 3'],
      ['*[clickable=true], *[clickable=false]', 'clickable == true'],
      ['*[text~="Save As"]', 'FALSEPREDICATE'],
      ['*[text~=""]', 'FALSEPREDICATE'],
      ['*[description~="word"]', "content-desc MATCHES '(?s)(.*\\\\s)?word(\\\\s.*)?'"],
    ];
    const classChainCases: Array<[string, string]> = [
      ['*:instance(3)', '**/*[4]'],
      ['*[clickable=true]:instance(0)', '**/*[`clickable == true`][1]'],
      [
        'android.widget.TextView[checkable] android.widget.WidgetView[focusable]:nth-child(1)',
        '**/android.widget.TextView[`checkable == true`]/**/android.widget.WidgetView[`focusable == true AND index == 1`]',
      ],
      ['* *[clickable=true][focused]', '**/*/**/*[`clickable == true AND focused == true`]'],
      ['android.widget.ListView android.widget.TextView', '**/android.widget.ListView/**/android.widget.TextView'],
      ['android.widget.ListView > android.widget.TextView', '**/android.widget.ListView/android.widget.TextView'],
    ];
    for (const [strategy, cases] of [
      [PREDICATE_STRATEGY, predicateCases],
      [CLASS_CHAIN_STRATEGY, classChainCases],
    ] as const) {
      for (const [cssSelector, selector] of cases) {
        it(`should convert '${cssSelector}' to '${selector}' (${strategy})`, async function () {
          assert.deepStrictEqual(await cssToNativeLocator(cssSelector), {strategy, selector});
        });
      }
    }
  });
  describe('unsupported css', function () {
    const testCases: string[] = [
      '*[checked="ItS ChEcKeD"]',
      '*[foo="bar"]',
      '*:checked("ischecked")',
      `This isn't valid[ css`,
      'p ~ a',
    ];
    for (const cssSelector of testCases) {
      it(`should reject '${cssSelector}'`, async function () {
        await assert.rejects(cssToNativeLocator(cssSelector));
      });
    }
  });
});
