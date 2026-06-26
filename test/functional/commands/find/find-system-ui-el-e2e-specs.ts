import {describe, it, before, after, beforeEach} from 'node:test';
import type {Browser} from 'webdriverio';
import {initSession, deleteSession} from '../../helpers/session.js';
import {SETTINGS_CAPS} from '../../desired.js';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

// statusBarBackground is not exposed on recent Android releases; use displayed=false instead.
const INVISIBLE_ELEMENTS_XPATH = `//*[@displayed='false']`;
const XPATH_FIND_TIMEOUT_MS = 500;

describe('Find - android ui elements', function () {
  let driver: Browser | undefined;

  before(async function () {
    driver = await initSession(SETTINGS_CAPS);
  });
  after(async function () {
    if (driver) {
      await deleteSession();
    }
  });
  beforeEach(async function () {
    await driver!.setTimeout({implicit: XPATH_FIND_TIMEOUT_MS});
  });

  it('should not find invisible elements via xpath when allowInvisibleElements is false', async function () {
    await driver!.updateSettings({allowInvisibleElements: false});
    const invisibleEls = await driver!.$$(INVISIBLE_ELEMENTS_XPATH);
    expect(invisibleEls.length).to.be.equal(0);
  });
  it('should find invisible elements via xpath when allowInvisibleElements is true', async function () {
    await driver!.updateSettings({allowInvisibleElements: true});
    const invisibleEls = await driver!.$$(INVISIBLE_ELEMENTS_XPATH);
    expect(invisibleEls.length).to.be.at.least(1);
  });
});
