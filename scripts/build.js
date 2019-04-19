const {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  writeFileSync,
  unlinkSync
} = require("fs");

// create bin dir & gitignore file
if (!existsSync("./bin")) {
  mkdirSync("./bin");
  writeFileSync("./bin/.gitignore", "");
}

// copy binary to bin folder
if (existsSync("./native/index.node"))
  createReadStream("./native/index.node").pipe(
    createWriteStream("./bin/index.node")
  );

// delete annoying index.js file
if (existsSync("./bin/index.js")) unlinkSync("./bin/index.js");

// create index.node if not exist
if (!existsSync("./bin/index.node")) writeFileSync("./bin/index.node", "");

// download binaries
const https = require("https");
const url = require("url");
const { sep: pathSeperator } = require("path");
const { getAbi } = require("node-abi");
const Octokit = require("@octokit/rest");
const { x: extractTarGz } = require("tar");

const AUTH_TOKEN = process.env.NODE_PRE_GYP_GITHUB_TOKEN;
const PREBUILT_REPO_OWNER = process.env.PREBUILT_REPO_OWNER || "packem";
const PREBUILT_REPO_NAME = process.env.PREBUILT_REPO_NAME || "packem";
const PREBUILT_REPO_URL = `https://github.com/${PREBUILT_REPO_OWNER}/${PREBUILT_REPO_NAME}`;
const CWD = process.cwd();
const NODE_ABI = getAbi(process.version.replace(/^v/, ""), "node");
const PLATFORM = process.platform;
const ARCH = process.arch;

const octokit = new Octokit({ auth: AUTH_TOKEN });

octokit.repos
  .getLatestRelease({
    owner: PREBUILT_REPO_OWNER,
    repo: PREBUILT_REPO_NAME
  })
  .then(({ data: { tag_name: VERSION }, status, headers }) => {
    // handle data
    const TARBALL_URL = `${PREBUILT_REPO_URL}/releases/download/${VERSION}/node-v${NODE_ABI}-${PLATFORM}-${ARCH}.tar.gz`;
    https.get(TARBALL_URL, response => {
      if (
        response.statusCode > 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        if (url.parse(response.headers.location).hostname) {
          https.get(response.headers.location, updateBinary);
        } else {
          https.get(
            url.resolve(
              url.parse(TARBALL_URL).hostname,
              response.headers.location
            ),
            updateBinary
          );
        }
      } else {
        updateBinary(response);
      }
    });
  })
  .catch(e => console.error(e));

// extract then update downloaded src
function updateBinary(response) {
  response.pipe(
    extractTarGz({
      cwd: CWD,
      filter: (path, stat) => (path === "bin/index.node" ? true : false)
    })
  );
}
