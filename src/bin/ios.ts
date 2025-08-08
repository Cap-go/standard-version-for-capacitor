import { versionBetaToCode, versionCodeToCodeBeta, versionPureToCode } from './utils'

const regexM = /MARKETING_VERSION = (.*);\n/g
const regexC = /CURRENT_PROJECT_VERSION = (.*);\n/g
export function readVersion(contents) {
  const vString = contents.match(regexM)
  const version = vString && vString[0] ? vString[0].replace(regexM, '$1') : null
  return version
}

export function writeVersion(contents, version) {
  const [versionPure, versionBeta] = version.split('-')
  const newContent = contents.replace(regexM, `MARKETING_VERSION = ${versionPure};\n`)
  const versionCode = versionPureToCode(versionPure)
  const versionCodeBeta = versionBetaToCode(versionBeta)
  const versionCodeFinal = versionCodeToCodeBeta(versionCode, versionCodeBeta)
  const finalContent = newContent.replace(
    regexC,
    `CURRENT_PROJECT_VERSION = ${versionCodeFinal};\n`,
  )
  return finalContent
}
