const chokidar = require("chokidar");
const path = require("path");

const watcher = chokidar.watch(path.join("."), {
  ignored: ["node_modules", "dist", ".git"], // ignore dotfiles
  persistent: true
});

const restart_server = async () => {
  try {
    await exec(`fuser -k ${process.env.PORT}/tcp`);
    await exec(`rm -rf node_modules`);
    await exec(`rm -f package-lock.json`);
    await exec(`npm i`);
    await exec(`tsc`);
    await exec(`npm start`);
    return Promise.resolve(true);
  } catch (error) {
    return error;
  }
};

let ready = false;
// Something to use when events are received.
const log = console.log.bind(console);
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
    try {
      await restart_server();
      ready = true;
    } catch (error) {
      log(error);
      throw error;
    }
  });
