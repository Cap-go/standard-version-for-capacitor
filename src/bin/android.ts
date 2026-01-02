import { versionBetaToCode, versionCodeToCodeBeta, versionPureToCode } from './utils'

// Gradle 8.13 deprecated the use of [key] [value] property definitions favoring [key] = [value]
const regexM = /versionName (?:= )?"(.*)"\n/g
const regexC = /versionCode (?:= )?(.*)\n/g
export function readVersion(contents) {
  const vString = contents.match(regexM)
  const version = vString && vString[0] ? vString[0].replace(regexM, '$1') : null
  return version
}

export function writeVersion(contents, version) {
  const [versionPure, versionBeta] = version.split('-')
  const nString = contents.match(regexM)
  const gradleNPropSpacer = nString && nString[0] && nString[0].includes('=') ? ' = ' : ' '

  const newContent = contents.replace(regexM, `versionName${gradleNPropSpacer}"${versionPure}"\n`)
  const versionCode = versionPureToCode(versionPure)
  const versionCodeBeta = versionBetaToCode(versionBeta)
  const versionCodeFinal = versionCodeToCodeBeta(versionCode, versionCodeBeta)

  const cString = contents.match(regexC)
  const gradleCPropSpacer = cString && cString[0] && cString[0].includes('=') ? ' = ' : ' '

  const finalContent = newContent.replace(regexC, `versionCode${gradleCPropSpacer}${versionCodeFinal}\n`)
  return finalContent
}
