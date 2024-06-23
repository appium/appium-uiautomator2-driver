import CssConverter from '../../lib/css-converter';

describe('css-converter.js', function () {
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
  });

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
        'new UiSelector().clickable(true)',
      ],
      ['*[description~="word"]', 'new UiSelector().descriptionMatches("\\b(\\w*word\\w*)\\b")'],
      [
        'android.widget.ListView android.widget.TextView',
        'new UiSelector().className("android.widget.ListView").childSelector(new UiSelector().className("android.widget.TextView"))'
      ],
    ];
    for (const [cssSelector, uiAutomatorSelector] of simpleCases) {
      it(`should convert '${cssSelector}' to '${uiAutomatorSelector}'`, function () {
        new CssConverter(cssSelector).toUiAutomatorSelector().should.equal(uiAutomatorSelector);
      });
    }
  });
  describe('unsupported css', function () {
    const testCases = [
      '*[checked="ItS ChEcKeD"]',
      '*[foo="bar"]',
      '*:checked("ischecked")',
      `This isn't valid[ css`,
      'p ~ a',
    ];
    for (const cssSelector of testCases) {
      it(`should reject '${cssSelector}'`, function () {
        (() => new CssConverter(cssSelector).toUiAutomatorSelector()).should.throw();
      });
    }
  });
});
