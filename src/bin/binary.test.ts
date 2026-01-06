import { describe, expect, it } from 'bun:test'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('binary executable', () => {
  const distPath = resolve(__dirname, '../../dist/index.js')

  it('should have shebang as first line', () => {
    const content = readFileSync(distPath, 'utf-8')
    const firstLine = content.split('\n')[0]
    expect(firstLine).toBe('#!/usr/bin/env node')
  })

  it('should be executable with node', () => {
    const output = execSync(`node ${distPath} --version`, { encoding: 'utf-8' })
    // Should output the version number without errors
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('should use CommonJS format (require)', () => {
    const content = readFileSync(distPath, 'utf-8')
    // Check that the file uses require() and not import
    expect(content).toContain('require(')
    // Make sure it doesn't use ESM import (after the shebang line)
    const withoutShebang = content.split('\n').slice(1).join('\n')
    expect(withoutShebang).not.toMatch(/^import .* from/)
  })

  it('should execute directly as a script', () => {
    // Execute the binary directly (requires shebang and executable permissions)
    const output = execSync(distPath + ' --version', { encoding: 'utf-8' })
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/)
  })
})
