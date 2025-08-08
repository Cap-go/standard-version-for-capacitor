import standardVersion from '@capgo/standard-version'
import command from '@capgo/standard-version/command'

import merge from 'merge-deep'
import * as android from './android'
import * as ios from './ios'

const baseConfig = {
  noVerify: true,
  tagPrefix: '',
  packageFiles: [
    {
      filename: './package.json',
      type: 'json',
    },
  ],
  bumpFiles: [
    {
      filename: './android/app/build.gradle',
      updater: android,
    },
    {
      filename: './package.json',
      type: 'json',
    },
    {
      filename: './package-lock.json',
      type: 'json',
    },
    {
      filename: './ios/App/App.xcodeproj/project.pbxproj',
      updater: ios,
    },
  ],
}

async function run() {
  try {
    // merge base config with user config
    const finalConfig = merge(command.argv, baseConfig)
    await standardVersion(finalConfig)
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

run()
