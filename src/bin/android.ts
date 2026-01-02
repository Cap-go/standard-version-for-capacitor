import { versionBetaToCode, versionCodeToCodeBeta, versionPureToCode } from './utils'

// Regex patterns that match both legacy (space) and modern (equals) Gradle syntax
// Also handles both Unix (LF) and Windows (CRLF) line endings
// Captures the full separator (spaces, optional equals, spaces) to preserve formatting
const regexM = /versionName( *= *| +)"([^"]*)"\r?\n/g
const regexC = /versionCode( *= *| +)(\d+)\r?\n/g

export function readVersion(contents: string): string | null {
  const match = regexM.exec(contents)
  regexM.lastIndex = 0 // Reset regex state for future use
  return match ? match[2] : null
}

export function writeVersion(contents: string, version: string): string {
  const [versionPure, versionBeta] = version.split('-')

  // Preserve the original assignment style (space vs equals)
  const newContent = contents.replace(regexM, (match, separator) => {
    const lineEnding = match.endsWith('\r\n') ? '\r\n' : '\n'
    return `versionName${separator}"${versionPure}"${lineEnding}`
  })

  const versionCode = versionPureToCode(versionPure)
  const versionCodeBeta = versionBetaToCode(versionBeta)
  const versionCodeFinal = versionCodeToCodeBeta(versionCode, versionCodeBeta)

  const finalContent = newContent.replace(regexC, (match, separator) => {
    const lineEnding = match.endsWith('\r\n') ? '\r\n' : '\n'
    return `versionCode${separator}${versionCodeFinal}${lineEnding}`
  })

  return finalContent
}
