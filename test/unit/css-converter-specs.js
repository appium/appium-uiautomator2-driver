import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import CssConverter from '../../lib/css-converter';

chai.should();
chai.use(chaiAsPromised);

describe('css-converter.js', function () {
  describe('simple cases', function () {
    const simpleCases = [
      ['android.widget.TextView', 'new UiSelector().className("android.widget.TextView")'],
      ['TextView', 'new UiSelector().classNameMatches("TextView")'],
      ['.TextView', 'new UiSelector().classNameMatches("TextView")'],
      ['.widget.TextView', 'new UiSelector().classNameMatches("widget\\.TextView")'],
      ['*[checkable=true]', 'new UiSelector().checkable(true)'],
      ['*[checkable]', 'new UiSelector().checkable(true)'],
      ['*:checked', 'new UiSelector().checked(true)'],
      ['*[checked]', 'new UiSelector().checked(true)'],
      ['TextView[description="Some description"]', 'new UiSelector().classNameMatches("TextView").description("Some description")'],
      ['*[description]', 'new UiSelector().descriptionMatches("")'],
      ['*[description^=blah]', 'new UiSelector().descriptionStartsWith("blah")'],
      ['*[description$=bar]', 'new UiSelector().descriptionMatches("bar$")'],
      ['*[description*=bar]', 'new UiSelector().descriptionContains("bar")'],
      ['#identifier[description=foo]', 'new UiSelector().resourceId("android:id/identifier").description("foo")'],
      ['*[id=foo]', 'new UiSelector().resourceId("android:id/foo")'],
      ['*[description$="hello [ ^ $ . | ? * + ( ) world"]', 'new UiSelector().descriptionMatches("hello \\[ \\^ \\$ \\. \\| \\? \\* \\+ \\( \\) world$")'],
      ['TextView:iNdEx(4)', 'new UiSelector().classNameMatches("TextView").index(4)'],
      ['*:long-clickable', 'new UiSelector().longClickable(true)'],
      ['*[lOnG-cLiCkAbLe]', 'new UiSelector().longClickable(true)'],
      ['*:nth-child(3)', 'new UiSelector().index(3)'],
      ['*:instance(3)', 'new UiSelector().instance(3)'],
      [
        'android.widget.TextView[checkable] android.widget.WidgetView[focusable]:nth-child(1)',
        'new UiSelector().className("android.widget.TextView").checkable(true).childSelector(new UiSelector().className("android.widget.WidgetView").focusable(true).index(1))'
      ],
      ['* *[clickable=true][focused]', 'new UiSelector().childSelector(new UiSelector().clickable(true).focused(true))'],
      [
        '*[clickable=true], *[clickable=false]',
        'new UiSelector().clickable(true); new UiSelector().clickable(false)',
      ],
      ['*[description~="word"]', 'new UiSelector().descriptionMatches("\\b(\\w*word\\w*)\\b")'],
      [
        'android.widget.ListView android.widget.TextView',
        'new UiSelector().className("android.widget.ListView").childSelector(new UiSelector().className("android.widget.TextView"))'
      ],
    ];
    for (const [cssSelector, uiAutomatorSelector] of simpleCases) {
      it(`should convert '${cssSelector}' to '${uiAutomatorSelector}'`, function () {
        CssConverter.toUiAutomatorSelector(cssSelector).should.equal(uiAutomatorSelector);
      });
    }
  });
  describe('unsupported css', function () {
    const testCases = [
      ['*[checked="ItS ChEcKeD"]', /'checked' must be true, false or empty. Found 'ItS ChEcKeD'/],
      ['*[foo="bar"]', /'foo' is not a valid attribute. Supported attributes are */],
      ['*:checked("ischecked")', /'checked' must be true, false or empty. Found 'ischecked'/],
      [`This isn't valid[ css`, /Invalid CSS selector/],
      ['p ~ a', /'~' is not a supported combinator. /],
      ['p > a', /'>' is not a supported combinator. /],
    ];
    for (const [cssSelector, error] of testCases) {
      it(`should reject '${cssSelector}' with '${error}'`, function () {
        (() => CssConverter.toUiAutomatorSelector(cssSelector)).should.throw(error);
      });
    }
  });
});
