import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import CssConverter from '../../lib/css-converter';

chai.should();
chai.use(chaiAsPromised);

describe('css-converter.js', function () {
  describe('simple cases', function () {
    const simpleCases = [
      ['android.widget.TextView', 'new UiSelector().className("android.widget.TextView")'],
      ['.TextView', 'new UiSelector().classNameMatches("\\.TextView")'],
      ['.widget.TextView', 'new UiSelector().classNameMatches("\\.widget\\.TextView")'],
      ['*[checkable=true]', 'new UiSelector().checkable(true)'],
      ['*[checkable]', 'new UiSelector().checkable()'],
      ['*:checked', 'new UiSelector().checked()'],
      ['*[checked]', 'new UiSelector().checked()'],
      ['TextView[description="Some description"]', 'new UiSelector().className("TextView").description("Some description")'],
      ['*[description]', 'new UiSelector().descriptionMatches("")'],
      ['*[description^=blah]', 'new UiSelector().descriptionStartsWith("blah")'],
      ['*[description$=bar]', 'new UiSelector().descriptionMatches("bar$")'],
      ['*[description*=bar]', 'new UiSelector().descriptionContains("bar")'],
      ['#identifier[description=foo]', 'new UiSelector().resourceId("android:id/identifier").description("foo")'],
      ['*[id=foo]', 'new UiSelector().resourceId("android:id/foo")'],
      ['*[description$="hello [ ^ $ . | ? * + ( ) world"]', 'new UiSelector().descriptionMatches("hello \\[ \\^ \\$ \\. \\| \\? \\* \\+ \\( \\) world$")'],
      ['TextView:iNdEx(4)', 'new UiSelector().className("TextView").index(4)'],
      ['*:long-clickable', 'new UiSelector().longClickable()'],
      ['*[lOnG-cLiCkAbLe]', 'new UiSelector().longClickable()'],
      ['*:nth-child(3)', 'new UiSelector().index(3)'],
      ['*:instance(3)', 'new UiSelector().instance(3)'],
      [
        'android.widget.TextView[checkable] android.widget.WidgetView[focusable]:nth-child(1)',
        'new UiSelector().className("android.widget.TextView").checkable().childSelector(new UiSelector().className("android.widget.WidgetView").focusable().index(1))'
      ],
      ['* *[clickable=true][focused]', 'new UiSelector().childSelector(new UiSelector().clickable(true).focused())']
    ];
    for (const [cssSelector, uiAutomatorSelector] of simpleCases) {
      it(`should convert '${cssSelector}' to '${uiAutomatorSelector}'`, function () {
        CssConverter.toUiAutomatorSelector(cssSelector).should.equal(uiAutomatorSelector);
      });
    }
  });
  describe('attributes', function () {

  });
  describe('pseudo-classes', function () {

  });
});
