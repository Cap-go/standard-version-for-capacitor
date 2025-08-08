export function versionPureToCode(versionPure: string): number {
  const versionCode = Number(
    versionPure
      .split('.')
      .map(v => (v.length === 1 ? `0${v}` : v))
      .join(''),
  )
  return versionCode
}

export function versionBetaToCode(versionBeta: string): number {
  // Example: 1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta < 1.0.0-beta.2 < 1.0.0-beta.11 < 1.0.0-rc.1 < 1.0.0
  //  Become  600 < 601 < 602 < 700 < 702 < 711 < 801 < 900
  if (!versionBeta) {
    return 999
  }
  let versionCodeBeta = Number(versionBeta.split('.')[1] || 0)
  if (versionCodeBeta > 100) {
    throw new Error('versionCodeBeta should be less than 100')
  }
  if (versionBeta.startsWith('rc.')) {
    versionCodeBeta = 800 + versionCodeBeta
  }
  else if (versionBeta.startsWith('beta.')) {
    versionCodeBeta = 700 + versionCodeBeta
  }
  else if (versionBeta.startsWith('alpha.')) {
    versionCodeBeta = 600 + versionCodeBeta
  }
  return versionCodeBeta
}

export function versionCodeToCodeBeta(versionCode: number, versionCodeBeta: number): number {
  return versionCode * 1000 + versionCodeBeta
}
