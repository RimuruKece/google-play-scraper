import { assert } from 'chai';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import { AuroraDevice } from '../src/index.js';
import {
  parsePropertiesFile,
  resolveDeviceProfile,
} from '../src/utils/aurora-oss.js';

describe('AuroraOSS Fallback', () => {
  let sandbox: sinon.SinonSandbox;

  before(() => {
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Properties file parser', () => {
    const tmpFile = path.resolve('./temp_device.properties');

    before(() => {
      fs.writeFileSync(tmpFile, `
# Mock device profile
Build.BRAND=xiaomi
Build.DEVICE=sweet
Build.MODEL=Redmi Note 10 Pro
Build.MANUFACTURER=Xiaomi
Build.PRODUCT=sweet_eea
Build.HARDWARE=qcom
Build.ID=RKQ1.200826.002
Build.FINGERPRINT=xiaomi/sweet_eea/sweet:11/RKQ1.200826.002/V12.5.3.0.RKSEUXM:user/release-keys
Build.VERSION.SDK_INT=30
Build.VERSION.RELEASE=11
Screen.Density=440
Screen.Width=1080
Screen.Height=2400
Vending.versionString=41.3.22-29
Vending.version=84132210
      `.trim());
    });

    after(() => {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    });

    it('should parse custom device properties file', () => {
      const profile = parsePropertiesFile(tmpFile);
      assert.equal(profile.brand, 'xiaomi');
      assert.equal(profile.device, 'sweet');
      assert.equal(profile.model, 'Redmi Note 10 Pro');
      assert.equal(profile.sdkVersion, 30);
      assert.equal(profile.releaseVersion, '11');
      assert.equal(profile.density, 440);
      assert.equal(profile.width, 1080);
      assert.equal(profile.height, 2400);
      assert.equal(profile.vendingVersion, '41.3.22-29');
      assert.equal(profile.vendingVersionCode, 84132210);
    });

    it('should resolve custom device when option provided', () => {
      const profile = resolveDeviceProfile(AuroraDevice.CUSTOM, tmpFile);
      assert.equal(profile.brand, 'xiaomi');
      assert.equal(profile.model, 'Redmi Note 10 Pro');
    });

    it('should parse extra fields from properties file', () => {
      const profile = parsePropertiesFile(tmpFile);
      assert.equal(profile.radio, undefined); // not in test file
      assert.equal(profile.sdkVersion, 30);
      assert.equal(profile.platforms, undefined); // not in test file
    });
  });

  describe('Device profile resolution', () => {
    it('should return Pixel 7 Pro by default', () => {
      const profile = resolveDeviceProfile(AuroraDevice.PIXEL_7_PRO);
      assert.equal(profile.brand, 'google');
      assert.equal(profile.model, 'Pixel 7 Pro');
      assert.equal(profile.sdkVersion, 34);
    });

    it('should return Galaxy S24 profile', () => {
      const profile = resolveDeviceProfile(AuroraDevice.GALAXY_S24);
      assert.equal(profile.brand, 'samsung');
      assert.equal(profile.model, 'SM-S921U');
    });

    it('should include extra fields for full checkin', () => {
      const profile = resolveDeviceProfile(AuroraDevice.PIXEL_7_PRO);
      assert.isDefined(profile.radio);
      assert.isDefined(profile.features);
      assert.isAbove(profile.features!.length, 10);
      assert.isDefined(profile.locales);
      assert.include(profile.locales!, 'en_US');
    });
  });

  describe('Built-in device profiles', () => {
    it('should have all expected profiles', () => {
      const devices = [
        AuroraDevice.PIXEL_7_PRO,
        AuroraDevice.GALAXY_S23_ULTRA,
        AuroraDevice.ONEPLUS_11,
        AuroraDevice.PIXEL_8_PRO,
        AuroraDevice.GALAXY_S24,
      ];
      for (const device of devices) {
        const profile = resolveDeviceProfile(device);
        assert.isDefined(profile, `Missing profile for ${device}`);
        assert.isString(profile.fingerprint);
        assert.isAbove(profile.sdkVersion, 0);
        assert.isString(profile.vendingVersion);
        assert.isAbove(profile.vendingVersionCode, 0);
      }
    });
  });
});
