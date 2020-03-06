const chokidar = require("chokidar");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const watcher = chokidar.watch(path.join("."), {
  ignored: ["node_modules", "dist", ".git"], // ignore dotfiles
  persistent: true
});

const log = console.log.bind(console);
const restart_server = async () => {
  await exec(`fuser -k ${process.env.PORT}/tcp`);
  await exec(`rm -rf node_modules`);
  await exec(`rm -f package-lock.json`);
  await exec(`npm i`);
  await exec(`tsc`);
  await exec(`npm start`);
  log("All good");
  return Promise.resolve(true);
};

const start_server = async () => {
  const { stdout, stderr } = await exec(`npm i`, { shell: true });
  log(stdout);

  exec(`tsc`, { shell: true }, async () => {
    const logServer = await (await exec(`npm start`, { shell: true })).stdout;
    log("All good", logServer);
  });

  return Promise.resolve(true);
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
    await start_server();
    ready = true;
  });
