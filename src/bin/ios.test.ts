import { describe, expect, it } from 'bun:test'
import { readVersion, writeVersion } from './ios'

describe('ios.ts', () => {
  describe('readVersion', () => {
    it('should read MARKETING_VERSION from pbxproj content', () => {
      const contents = `
/* Begin XCBuildConfiguration section */
    MARKETING_VERSION = 1.2.3;
    CURRENT_PROJECT_VERSION = 10203999;
/* End XCBuildConfiguration section */
`
      expect(readVersion(contents)).toBe('1.2.3')
    })

    it('should read version with different formatting', () => {
      const contents = `
buildSettings = {
    MARKETING_VERSION = 6.0.1;
    CURRENT_PROJECT_VERSION = 60001999;
};
`
      expect(readVersion(contents)).toBe('6.0.1')
    })

    it('should return null if no version found', () => {
      const contents = `
/* Begin XCBuildConfiguration section */
    PRODUCT_NAME = "$(TARGET_NAME)";
/* End XCBuildConfiguration section */
`
      expect(readVersion(contents)).toBeNull()
    })

    it('should handle multiple MARKETING_VERSION entries (returns first)', () => {
      const contents = `
/* Debug */
    MARKETING_VERSION = 1.0.0;
/* Release */
    MARKETING_VERSION = 1.0.0;
`
      expect(readVersion(contents)).toBe('1.0.0')
    })
  })

  describe('writeVersion', () => {
    it('should update MARKETING_VERSION and CURRENT_PROJECT_VERSION', () => {
      const contents = `
buildSettings = {
    MARKETING_VERSION = 1.0.0;
    CURRENT_PROJECT_VERSION = 10000999;
};
`
      const result = writeVersion(contents, '2.0.0')
      expect(result).toContain('MARKETING_VERSION = 2.0.0;')
      // 2.0.0 → 020000 * 1000 + 999 = 20000999
      expect(result).toContain('CURRENT_PROJECT_VERSION = 20000999;')
    })

    it('should handle beta versions', () => {
      const contents = `
buildSettings = {
    MARKETING_VERSION = 1.0.0;
    CURRENT_PROJECT_VERSION = 10000999;
};
`
      const result = writeVersion(contents, '1.0.1-beta.1')
      expect(result).toContain('MARKETING_VERSION = 1.0.1;')
      // 1.0.1-beta.1 → 010001 * 1000 + 701 = 10001701
      expect(result).toContain('CURRENT_PROJECT_VERSION = 10001701;')
    })

    it('should handle alpha versions', () => {
      const contents = `
buildSettings = {
    MARKETING_VERSION = 1.0.0;
    CURRENT_PROJECT_VERSION = 10000999;
};
`
      const result = writeVersion(contents, '1.0.1-alpha.5')
      expect(result).toContain('MARKETING_VERSION = 1.0.1;')
      // 1.0.1-alpha.5 → 010001 * 1000 + 605 = 10001605
      expect(result).toContain('CURRENT_PROJECT_VERSION = 10001605;')
    })

    it('should handle rc versions', () => {
      const contents = `
buildSettings = {
    MARKETING_VERSION = 1.0.0;
    CURRENT_PROJECT_VERSION = 10000999;
};
`
      const result = writeVersion(contents, '1.0.1-rc.2')
      expect(result).toContain('MARKETING_VERSION = 1.0.1;')
      // 1.0.1-rc.2 → 010001 * 1000 + 802 = 10001802
      expect(result).toContain('CURRENT_PROJECT_VERSION = 10001802;')
    })

    it('should update multiple occurrences', () => {
      const contents = `
/* Debug */
buildSettings = {
    MARKETING_VERSION = 1.0.0;
    CURRENT_PROJECT_VERSION = 10000999;
};
/* Release */
buildSettings = {
    MARKETING_VERSION = 1.0.0;
    CURRENT_PROJECT_VERSION = 10000999;
};
`
      const result = writeVersion(contents, '1.0.1')
      // Should replace all occurrences
      expect(result.match(/MARKETING_VERSION = 1\.0\.1;/g)?.length).toBe(2)
      expect(result.match(/CURRENT_PROJECT_VERSION = 10001999;/g)?.length).toBe(2)
    })

    /* eslint-disable style/no-tabs */
    it('should handle real-world pbxproj content', () => {
      const contents = `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 54;
	objects = {
/* Begin XCBuildConfiguration section */
		1234567890ABCDEF /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 60001999;
				INFOPLIST_FILE = App/Info.plist;
				IPHONEOS_DEPLOYMENT_TARGET = 13.0;
				LD_RUNPATH_SEARCH_PATHS = "$(inherited)";
				MARKETING_VERSION = 6.0.1;
				PRODUCT_BUNDLE_IDENTIFIER = com.example.app;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
/* End XCBuildConfiguration section */
	};
}
`
      const result = writeVersion(contents, '6.0.2')
      // 6.0.2 → 060002 * 1000 + 999 = 60002999
      expect(result).toContain('CURRENT_PROJECT_VERSION = 60002999;')
      expect(result).toContain('MARKETING_VERSION = 6.0.2;')
      // Ensure other content is preserved
      expect(result).toContain('PRODUCT_BUNDLE_IDENTIFIER = com.example.app;')
      expect(result).toContain('SWIFT_VERSION = 5.0;')
    })
    /* eslint-enable style/no-tabs */
  })
})
