const { spawn } = require("child_process");

const installDependencies = (projectPath) =>
  new Promise((resolve, reject) => {
    const child = spawn("npm", ["install"], {
      cwd: projectPath,
      stdio: "inherit",
      shell: true,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`npm install failed with exit code ${code}`));
    });
  });

module.exports = installDependencies;
