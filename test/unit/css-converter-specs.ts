import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {cssToNativeLocator, CLASS_CHAIN_STRATEGY} from '../../lib/css/index.js';

describe('css-converter.js', function () {
  describe('simple cases', function () {
    const simpleCases: Array<[string, string]> = [
      ['android.widget.TextView', '**/android.widget.TextView'],
      ['TextView', "**/*[`class ENDSWITH '.TextView'`]"],
      ['.TextView', "**/*[`class ENDSWITH '.TextView'`]"],
      ['.widget.TextView', "**/*[`class ENDSWITH '.widget.TextView'`]"],
      ['*', '**/*'],
      ['*[checkable=true]', '**/*[`checkable == true`]'],
      ['*[checkable=false]', '**/*[`checkable == false`]'],
      ['*[checkable]', '**/*[`checkable == true`]'],
      ['*:checked', '**/*[`checked == true`]'],
      ['*[checked]', '**/*[`checked == true`]'],
      [
        'TextView[description="Some description"]',
        "**/*[`class ENDSWITH '.TextView' AND content-desc == 'Some description'`]",
      ],
      ['*[description]', "**/*[`content-desc != ''`]"],
      ['*[description=""]', "**/*[`content-desc == ''`]"],
      ['*[description^=blah]', "**/*[`content-desc BEGINSWITH[c] 'blah'`]"],
      ['*[description$=bar]', "**/*[`content-desc ENDSWITH 'bar'`]"],
      ['*[description*=bar]', "**/*[`content-desc CONTAINS[c] 'bar'`]"],
      ['*[text*=bar]', "**/*[`text CONTAINS[c] 'bar'`]"],
      ['*[package-name="com.example"]', "**/*[`package == 'com.example'`]"],
      ['#identifier[description=foo]', "**/*[`resource-id == 'android:id/identifier' AND content-desc == 'foo'`]"],
      ['*[id=foo]', "**/*[`resource-id == 'android:id/foo'`]"],
      ['*[id="com.example:id/foo"]', "**/*[`resource-id == 'com.example:id/foo'`]"],
      [
        '*[description$="hello [ ^ $ . | ? * + ( ) world"]',
        "**/*[`content-desc ENDSWITH 'hello [ ^ $ . | ? * + ( ) world'`]",
      ],
      ['*[text="a\\\\b"]', "**/*[`text == 'a\\\\b'`]"],
      ['*[text="a`b"]', "**/*[`text == 'a``b'`]"],
      ['TextView:iNdEx(4)', "**/*[`class ENDSWITH '.TextView' AND index == 4`]"],
      ['*:long-clickable', '**/*[`long-clickable == true`]'],
      ['*[lOnG-cLiCkAbLe]', '**/*[`long-clickable == true`]'],
      ['*:nth-child(3)', '**/*[`index == 3`]'],
      ['*:instance(3)', '**/*[4]'],
      ['*[clickable=true]:instance(0)', '**/*[`clickable == true`][1]'],
      [
        'android.widget.TextView[checkable] android.widget.WidgetView[focusable]:nth-child(1)',
        '**/android.widget.TextView[`checkable == true`]/**/android.widget.WidgetView[`focusable == true AND index == 1`]',
      ],
      ['* *[clickable=true][focused]', '**/*/**/*[`clickable == true AND focused == true`]'],
      ['*[clickable=true], *[clickable=false]', '**/*[`clickable == true`]'],
      ['*[description~="word"]', "**/*[`content-desc MATCHES '(?s).*\\\\b(\\\\w*word\\\\w*)\\\\b.*'`]"],
      ['android.widget.ListView android.widget.TextView', '**/android.widget.ListView/**/android.widget.TextView'],
      ['android.widget.ListView > android.widget.TextView', '**/android.widget.ListView/android.widget.TextView'],
    ];
    for (const [cssSelector, classChain] of simpleCases) {
      it(`should convert '${cssSelector}' to '${classChain}'`, async function () {
        assert.deepStrictEqual(await cssToNativeLocator(cssSelector), {
          strategy: CLASS_CHAIN_STRATEGY,
          selector: classChain,
        });
      });
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
