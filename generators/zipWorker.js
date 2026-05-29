const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");

const [projectPath, zipPath] = process.argv.slice(2);

if (!projectPath || !zipPath) {
  console.error("Missing project path or zip path.");
  process.exit(1);
}

const run = async () => {
  await fs.ensureDir(path.dirname(zipPath));
  await fs.remove(zipPath);

  const tempZipPath = `${zipPath}.part`;
  await fs.remove(tempZipPath);

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(tempZipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(projectPath, path.basename(projectPath));
    archive.finalize();
  });

  await fs.move(tempZipPath, zipPath, { overwrite: true });
};

run()
  .then(async () => {
    if (projectPath) {
      await fs.remove(projectPath);
    }

    process.exit(0);
  })
  .catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
