import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'bun:test'

describe('binary executable', () => {
  // Read the binary path from package.json for better maintainability
  const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'))
  const distPath = resolve(__dirname, '../../', packageJson.bin['capacitor-standard-version'])

  it('should have shebang as first line', () => {
    const content = readFileSync(distPath, 'utf-8')
    const firstLine = content.split('\n')[0]
    expect(firstLine).toBe('#!/usr/bin/env node')
  })

  it('should be executable with node', () => {
    // Use execFileSync for safer execution without shell injection
    const output = execFileSync('node', [distPath, '--version'], { encoding: 'utf-8' })
    // Should output the version number without errors
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('should use CommonJS format (require)', () => {
    const content = readFileSync(distPath, 'utf-8')
    // Check that the file uses require() and not import
    expect(content).toContain('require(')
    // Make sure it doesn't use ESM import anywhere in the file
    // Match all forms: import foo from, import * as, import {}, etc.
    expect(content).not.toMatch(/\bimport\b.+\bfrom\b/)
  })

  it('should execute directly as a script', () => {
    // Execute the binary directly (requires shebang and executable permissions)
    // Use execFileSync to avoid shell injection
    const output = execFileSync(distPath, ['--version'], { encoding: 'utf-8' })
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/)
  })
})
