'use strict';

const cp          = require('child_process'),
      cpOpts      = { env: process.env, cwd: process.cwd(), stdio: 'inherit' },
      os          = require('os'),
      npmCmd      = os.platform().startsWith('win') ? 'npm.cmd' : 'npm', // npm binary based on OS
      path        = require('path'),
      packageJson = require(path.resolve(process.cwd(), 'package.json')),
      startDate   = new Date();

// npm install
cp.spawnSync(npmCmd, ['i'], cpOpts);

// docs
cp.spawnSync(npmCmd, ['run', 'generate-docs-json'], cpOpts);

// themes dev & prod
cp.spawnSync('node', ['./buildScripts/webpack/buildThreads.js'], cpOpts);

// neo dist versions => examples, docs app
// not included in all sub-repos, e.g.:
// https://github.com/neomjs/covid-dashboard
if (packageJson.scripts['build-development']) {
    cp.spawnSync(npmCmd, ['run', 'build-development'], cpOpts);
}

if (packageJson.scripts['build-production']) {
    cp.spawnSync(npmCmd, ['run', 'build-production'], cpOpts);
}

// default apps (covid, rw1 & rw2)
cp.spawnSync(npmCmd, ['run', 'dev-build-all-my-apps'],  cpOpts);
cp.spawnSync(npmCmd, ['run', 'prod-build-all-my-apps'], cpOpts);

// build threads: data, main, vdom => dev & prod
cp.spawnSync('node', ['./buildScripts/webpack/buildThreads.js'], cpOpts);

const processTime = (Math.round((new Date - startDate) * 100) / 100000).toFixed(2);
console.log(`Total time: ${processTime}s`);

process.exit();