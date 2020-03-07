const chokidar = require("chokidar");
const path = require("path");
const util = require("util");
const dotenv = require("dotenv");
const exec = util.promisify(require("child_process").exec);
const _ = require("lodash");

dotenv.config({ path: ".env.prod" });

const watcher = chokidar.watch(path.join("..", "ecolote"), {
  ignored: [
    "../ecolote/dist",
    "../ecolote/.git",
    "../ecolote/package-lock.json",
    "../ecolote/node_modules"
  ], // ignore dotfiles
  persistent: true
});

const log = console.log.bind(console);
const restart_server = () => {
  exec(`fuser -k ${process.env.PORT}/tcp`, () => {
    exec(`cd ../ecolote && rm -f package-lock.json`, () => {
      exec(`cd ../ecolote && rm -fr node_modules/`, () => {
        exec(`cd ../ecolote && npm i`, () => {
          exec(`cd ../ecolote && npm rebuild`, () => {
            exec(`cd ../ecolote && tsc`, () => {
              exec(`cd ../ecolote && npm start`);
              return `Commands executed`;
            });
          });
        });
      });
    });
  });
};

const try_restart = () => {
  return _.debounce(restart_server, 500);
};
// Something to use when events are received.
// Add event listeners.
watcher
  .on("add", (path, stats) => {
    log(try_restart());
  })
  .on("change", path => {
    log(try_restart());
  })
  .on("unlink", path => {
    log(try_restart());
  })
  .on("ready", () => {
    log(try_restart());
  });
