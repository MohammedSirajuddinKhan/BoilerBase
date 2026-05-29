const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

const getPreviewDir = () => path.join(__dirname, "..", "generated-projects", "previews");

const createPreviewId = () => crypto.randomBytes(8).toString("hex");

const previewFilePath = (previewId) => path.join(getPreviewDir(), `${previewId}.json`);

const savePreview = async (data) => {
  const previewId = createPreviewId();
  const filePath = previewFilePath(previewId);

  await fs.ensureDir(getPreviewDir());
  await fs.writeJson(filePath, data, { spaces: 2 });

  return previewId;
};

const readPreview = async (previewId) => {
  const filePath = previewFilePath(previewId);
  if (!(await fs.pathExists(filePath))) {
    return null;
  }

  return fs.readJson(filePath);
};

const removePreview = async (previewId) => {
  const filePath = previewFilePath(previewId);
  await fs.remove(filePath);
};

module.exports = {
  savePreview,
  readPreview,
  removePreview,
  getPreviewDir,
};
