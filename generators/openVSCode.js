const { spawn } = require("child_process");

const openVSCode = (projectPath) =>
  new Promise((resolve, reject) => {
    const child = spawn("code", [projectPath], {
      stdio: "ignore",
      shell: true,
      detached: true,
    });

    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });

module.exports = openVSCode;
