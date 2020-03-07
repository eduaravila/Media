const chokidar = require("chokidar");
const path = require("path");
const util = require("util");
const dotenv = require("dotenv");
const exec = util.promisify(require("child_process").exec);

dotenv.config({ path: ".env.prod" });

const watcher = chokidar.watch(path.join("..", "ecolote"), {
  ignored: ["dist", ".git", "package-lock.json", "node_modules"], // ignore dotfiles
  persistent: true
});

const log = console.log.bind(console);
const restart_server = () => {
  return exec(`fuser -k ${process.env.PORT}/tcp`, () =>
    exec(`cd ../ecolote && rm -f package-lock.json`, () =>
      exec(`cd ../ecolote && rm -fr node_modules/`, () =>
        exec(`cd ../ecolote && npm i`, () =>
          exec(`cd ../ecolote && npm rebuild`, () =>
            exec(`cd ../ecolote && tsc`, () => {
              return exec(`cd ../ecolote && npm start`, { shell: true }).stdout;
            })
          )
        )
      )
    )
  );
};

let ready = false;
// Something to use when events are received.
// Add event listeners.
watcher
  .on("add", async (path, stats) => {
    if (ready) {
      await restart_server();
    }
    log(`File ${path} has been added`, ready);
  })
  .on("change", async path => {
    if (ready) {
      await restart_server();
    }
    log(`File ${path} has been changed`);
  })
  .on("unlink", async path => {
    if (ready) {
      await restart_server();
    }
    log(`File ${path} has been removed`);
  })
  .on("ready", async () => {
    ready = true;
    log(await restart_server());
  });
