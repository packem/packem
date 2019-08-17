// Exactly 18 chars is preferred for suitable loggings
// excluding the extra spaces added automatically
const chalk = require("chalk");

function fatal(type, msg, stack) {
  // Coerce correct stack trace space required
  console.log(
    `${chalk.bgRed.bold(` ${type} `)} ${msg}${stack ? `\n  ${stack}` : ""}`
  );
  process.exit(0);
}

function warn(type, msg) {
  // If a stack trace is required, implement `warn`
  console.log(`${chalk.bgYellow.bold(` ${type} `)} ${msg}`);
}

module.exports = {
  fatal,
  warn
};
