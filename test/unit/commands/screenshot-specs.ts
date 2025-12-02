// @ts-check

import {expect} from 'chai';
import {parseSurfaceFlingerDisplays} from '../../../build/lib/commands/screenshot';

describe('Screenshot - parseSurfaceFlingerDisplays', function () {
  describe('physical displays', function () {
    it('should parse physical display with HWC display ID 0 (default)', function () {
      const output = 'Display 4619827259835644672 (HWC display 0): port=0 pnpId=GGL displayName="EMU_display_0"';
      const result = parseSurfaceFlingerDisplays(output);

      expect(result).to.have.property('4619827259835644672');
      expect(result['4619827259835644672']).to.deep.include({
        id: '4619827259835644672',
        isDefault: true,
        name: 'EMU_display_0',
      });
    });

    it('should parse physical display with non-default HWC display ID', function () {
      const output = 'Display 4619827259835644672 (HWC display 1): port=0 pnpId=GGL displayName="External Display"';
      const result = parseSurfaceFlingerDisplays(output);

      expect(result).to.have.property('4619827259835644672');
      expect(result['4619827259835644672']).to.deep.include({
        id: '4619827259835644672',
        isDefault: false,
        name: 'External Display',
      });
    });

    it('should parse physical display with HWC display ID 2', function () {
      const output = 'Display 4619827259835644672 (HWC display 2): port=1 pnpId=HDMI displayName="HDMI Display"';
      const result = parseSurfaceFlingerDisplays(output);

      expect(result).to.have.property('4619827259835644672');
      expect(result['4619827259835644672']).to.deep.include({
        id: '4619827259835644672',
        isDefault: false,
        name: 'HDMI Display',
      });
    });
  });

  describe('virtual displays', function () {
    it('should parse virtual display with displayName', function () {
      const output = 'Display 11529215049243506835 (Virtual display): displayName="Emulator 2D Display" uniqueId="virtual:com.android.emulator.multidisplay:1234562"';
      const result = parseSurfaceFlingerDisplays(output);

      expect(result).to.have.property('11529215049243506835');
      expect(result['11529215049243506835']).to.deep.include({
        id: '11529215049243506835',
        isDefault: false, // Virtual displays are never default
        name: 'Emulator 2D Display',
      });
    });

    it('should parse virtual display with different uniqueId format', function () {
      const output = 'Display 11529215049243506835 (Virtual display): displayName="Virtual Screen" uniqueId="virtual:test:789"';
      const result = parseSurfaceFlingerDisplays(output);

      expect(result).to.have.property('11529215049243506835');
      expect(result['11529215049243506835']).to.deep.include({
        id: '11529215049243506835',
        isDefault: false,
        name: 'Virtual Screen',
      });
    });
  });

  describe('multiple displays', function () {
    it('should parse multiple physical displays with correct default detection', function () {
      const output = `Display 4619827259835644672 (HWC display 0): port=0 pnpId=GGL displayName="First Display"
Display 4619827259835644673 (HWC display 1): port=1 pnpId=HDMI displayName="Second Display"`;
      const result = parseSurfaceFlingerDisplays(output);

      expect(result).to.have.property('4619827259835644672');
      expect(result).to.have.property('4619827259835644673');
      expect(result['4619827259835644672'].isDefault).to.be.true;
      expect(result['4619827259835644673'].isDefault).to.be.false;
    });

    it('should parse mixed physical and virtual displays', function () {
      const output = `Display 4619827259835644672 (HWC display 0): port=0 pnpId=GGL displayName="Physical Display"
Display 11529215049243506835 (Virtual display): displayName="Emulator 2D Display" uniqueId="virtual:com.android.emulator.multidisplay:1234562"`;
      const result = parseSurfaceFlingerDisplays(output);

      expect(result).to.have.property('4619827259835644672');
      expect(result).to.have.property('11529215049243506835');
      expect(result['4619827259835644672']).to.deep.include({
        id: '4619827259835644672',
        isDefault: true,
        name: 'Physical Display',
      });
      expect(result['11529215049243506835']).to.deep.include({
        id: '11529215049243506835',
        isDefault: false,
        name: 'Emulator 2D Display',
      });
    });

    it('should handle multiple virtual displays', function () {
      const output = `Display 11529215049243506835 (Virtual display): displayName="Virtual 1" uniqueId="virtual:test:1"
Display 11529215049243506836 (Virtual display): displayName="Virtual 2" uniqueId="virtual:test:2"`;
      const result = parseSurfaceFlingerDisplays(output);

      expect(result).to.have.property('11529215049243506835');
      expect(result).to.have.property('11529215049243506836');
      expect(result['11529215049243506835'].isDefault).to.be.false;
      expect(result['11529215049243506836'].isDefault).to.be.false;
    });
  });

  describe('edge cases', function () {
    it('should handle empty input', function () {
      const result = parseSurfaceFlingerDisplays('');
      expect(result).to.be.empty;
    });

    it('should handle input with no displays', function () {
      const result = parseSurfaceFlingerDisplays('Some other text\nMore text');
      expect(result).to.be.empty;
    });

    it('should handle displayName with special characters', function () {
      const output = 'Display 4619827259835644672 (HWC display 0): port=0 pnpId=GGL displayName="Display with spaces & symbols!@#"';
      const result = parseSurfaceFlingerDisplays(output);

      expect(result['4619827259835644672'].name).to.equal('Display with spaces & symbols!@#');
    });

    it('should handle displayName at different positions in the line', function () {
      const output = 'Display 4619827259835644672 (HWC display 0): displayName="Early Name" port=0 pnpId=GGL';
      const result = parseSurfaceFlingerDisplays(output);

      expect(result['4619827259835644672'].name).to.equal('Early Name');
    });

    it('should handle multiple properties after displayName', function () {
      const output = 'Display 4619827259835644672 (HWC display 0): port=0 pnpId=GGL displayName="My Display" extraProp="value" anotherProp=123';
      const result = parseSurfaceFlingerDisplays(output);

      expect(result['4619827259835644672'].name).to.equal('My Display');
    });
  });
});
