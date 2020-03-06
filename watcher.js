const chokidar = require("chokidar");
const path = require("path");
const util = require("util");
const dotenv = require("dotenv");
const exec = util.promisify(require("child_process").exec);

dotenv.config({ path: ".env.prod" });

const watcher = chokidar.watch(path.join("."), {
  ignored: ["node_modules", "dist", ".git"], // ignore dotfiles
  persistent: true
});

const log = console.log.bind(console);
const restart_server = () => {
  return exec(`fuser -k ${process.env.PORT}/tcp`, () => {
    exec(`rm -rf node_modules`, () => {
      exec(`rm -f package-lock.json`, () => {
        exec(`npm i`, () => {
          exec(`tsc`, () => {
            exec(`npm start`, (err, out) => {
              console.log(out);

              return out;
            });
          });
        });
      });
    });
  });
};

const start_server = async () => {
  const { stdout, stderr } = await exec(`npm i`, { shell: true });
  log(stdout);

  return exec(`tsc`, { shell: true }, async () => {
    const logServer = await (await exec(`npm start`, { shell: true })).stdout;
    log("All good", logServer);
    return Promise.resolve(logServer);
  });
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
    log(await start_server());
    ready = true;
  });
