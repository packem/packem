const chalk = require("chalk");
const { version } = require("../../package.json");
const versionMatch = version.match(/[0-9]\.[0-9]/);
const shortVersion = versionMatch ? versionMatch[0] : version;
const g = chalk.bold.green;
const y = chalk.yellow;

function compileStepLog() {
  console.log(`${g`Compiling`} static entries Packem-v${shortVersion} (pre-alpha)`);
}

function bundleStepLog(modulesCount, mode) {
  console.log(
    ` ${g`Bundling`} ${y(modulesCount)} modules ${
      mode == "production" ? "[optimized]" : "[unoptimized]"
    }`
  );
}

function linkStepLog(format) {
  console.log(`  ${g`Linking`} <${format}> default format runtime\n`);
}

function targetGeneratedStepLog(s) {
  console.log(`${g`Generated`} ✔ target(s) in ${y(s)}s`);
}

module.exports = {
  compileStepLog,
  bundleStepLog,
  linkStepLog,
  targetGeneratedStepLog
};
