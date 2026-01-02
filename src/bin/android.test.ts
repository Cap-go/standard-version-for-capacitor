import { describe, expect, it } from 'bun:test'
import { readVersion, writeVersion } from './android'

describe('android.ts', () => {
  describe('readVersion', () => {
    it('should read version with space syntax', () => {
      const contents = `
android {
    defaultConfig {
        versionName "1.2.3"
        versionCode 1002003
    }
}
`
      expect(readVersion(contents)).toBe('1.2.3')
    })

    it('should read version with equals syntax', () => {
      const contents = `
android {
    defaultConfig {
        versionName = "6.0.1"
        versionCode = 60001999
    }
}
`
      expect(readVersion(contents)).toBe('6.0.1')
    })

    it('should read version with equals and extra spaces', () => {
      const contents = `
android {
    defaultConfig {
        versionName  =  "2.0.0"
        versionCode  =  2000000
    }
}
`
      expect(readVersion(contents)).toBe('2.0.0')
    })

    it('should return null if no version found', () => {
      const contents = `
android {
    defaultConfig {
        applicationId "com.example.app"
    }
}
`
      expect(readVersion(contents)).toBeNull()
    })

    it('should handle CRLF line endings', () => {
      const contents = 'android {\r\n    defaultConfig {\r\n        versionName = "1.0.0"\r\n        versionCode = 1000000\r\n    }\r\n}\r\n'
      expect(readVersion(contents)).toBe('1.0.0')
    })
  })

  describe('writeVersion', () => {
    it('should preserve space syntax for versionName and versionCode', () => {
      const contents = `android {
    defaultConfig {
        versionName "1.0.0"
        versionCode 10000999
    }
}
`
      const result = writeVersion(contents, '2.0.0')
      expect(result).toContain('versionName "2.0.0"')
      // 2.0.0 → 020000 * 1000 + 999 = 20000999
      expect(result).toContain('versionCode 20000999')
      expect(result).not.toContain('versionName =')
      expect(result).not.toContain('versionCode =')
    })

    it('should preserve equals syntax for versionName and versionCode', () => {
      const contents = `android {
    defaultConfig {
        versionName = "6.0.1"
        versionCode = 60001999
    }
}
`
      const result = writeVersion(contents, '6.0.2')
      expect(result).toContain('versionName = "6.0.2"')
      // 6.0.2 → 060002 * 1000 + 999 = 60002999
      expect(result).toContain('versionCode = 60002999')
    })

    it('should preserve equals with spaces syntax', () => {
      const contents = `android {
    defaultConfig {
        versionName  =  "1.0.0"
        versionCode  =  10000999
    }
}
`
      const result = writeVersion(contents, '1.0.1')
      expect(result).toContain('versionName  =  "1.0.1"')
      // 1.0.1 → 010001 * 1000 + 999 = 10001999
      expect(result).toContain('versionCode  =  10001999')
    })

    it('should handle beta versions', () => {
      const contents = `android {
    defaultConfig {
        versionName = "1.0.0"
        versionCode = 10000999
    }
}
`
      const result = writeVersion(contents, '1.0.1-beta.1')
      expect(result).toContain('versionName = "1.0.1"')
      // 1.0.1-beta.1 → 010001 * 1000 + 701 = 10001701
      expect(result).toContain('versionCode = 10001701')
    })

    it('should preserve CRLF line endings', () => {
      const contents = 'android {\r\n    defaultConfig {\r\n        versionName = "1.0.0"\r\n        versionCode = 10000999\r\n    }\r\n}\r\n'
      const result = writeVersion(contents, '1.0.1')
      expect(result).toContain('versionName = "1.0.1"\r\n')
      expect(result).toContain('versionCode = 10001999\r\n')
    })

    it('should preserve LF line endings', () => {
      const contents = 'android {\n    defaultConfig {\n        versionName = "1.0.0"\n        versionCode = 10000999\n    }\n}\n'
      const result = writeVersion(contents, '1.0.1')
      expect(result).toContain('versionName = "1.0.1"\n')
      expect(result).toContain('versionCode = 10001999\n')
      expect(result).not.toContain('\r\n')
    })

    it('should handle real-world build.gradle content', () => {
      const contents = `plugins {
    id 'com.android.application'
}

android {
    compileSdkVersion 33

    defaultConfig {
        applicationId "com.example.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode = 60001999
        versionName = "6.0.1"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
        }
    }
}
`
      const result = writeVersion(contents, '6.0.2')
      // 6.0.2 → 060002 * 1000 + 999 = 60002999
      expect(result).toContain('versionCode = 60002999')
      expect(result).toContain('versionName = "6.0.2"')
      // Ensure other content is preserved
      expect(result).toContain('applicationId "com.example.app"')
      expect(result).toContain('compileSdkVersion 33')
    })
  })
})
