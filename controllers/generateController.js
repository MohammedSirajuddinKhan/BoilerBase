const path = require("path");
const fs = require("fs-extra");
const createProject = require("../generators/createProject");
const zipProject = require("../generators/zipProject");
const { normalizeOptions, validateOptions } = require("../utils/helper");
const { sanitizeProjectName } = require("../utils/pathUtils");
const {
  savePreview,
  readPreview,
  removePreview,
} = require("../utils/previewStore");

const createNode = (name, type, children = []) => ({
  name,
  type,
  children,
});

const buildPreviewTree = (options, displayName) => {
  const viewExtension = options.templateEngine === "EJS" ? "ejs" : "html";
  const includeMVC = options.includeMVCStructure;
  const includeAuth = options.includeAuthSystem;
  const includeMongo = options.databaseChoice === "MongoDB";

  return createNode(displayName, "folder", [
    createNode("config", "folder", [
      createNode("db.js", "file"),
    ]),
    createNode(
      "controllers",
      "folder",
      [
        ...(includeMVC ? [createNode("homeController.js", "file")] : []),
        ...(includeAuth ? [createNode("authController.js", "file")] : []),
      ],
    ),
    createNode(
      "middleware",
      "folder",
      includeAuth ? [createNode("authMiddleware.js", "file")] : [],
    ),
    createNode(
      "models",
      "folder",
      includeAuth && includeMongo ? [createNode("User.js", "file")] : [],
    ),
    createNode(
      "routes",
      "folder",
      [
        ...(includeMVC ? [createNode("index.js", "file")] : []),
        ...(includeAuth ? [createNode("authRoutes.js", "file")] : []),
      ],
    ),
    createNode(
      "views",
      "folder",
      [
        createNode(`index.${viewExtension}`, "file"),
        ...(includeAuth ? [
          createNode(`login.${viewExtension}`, "file"),
          createNode(`register.${viewExtension}`, "file"),
        ] : []),
      ],
    ),
    createNode(
      "public",
      "folder",
      [
        createNode("css", "folder", [createNode("style.css", "file")]),
        createNode("js", "folder", [createNode("main.js", "file")]),
      ],
    ),
    createNode(".env", "file"),
    createNode("package.json", "file"),
    createNode("server.js", "file"),
    ...(options.includeREADME ? [createNode("README.md", "file")] : []),
  ]);
};

const buildPreviewData = (options, zipPath) => {
  const displayName = (options.displayProjectName || options.projectName || "").trim();
  const techStack = [
    options.databaseChoice,
    options.authenticationType,
    options.templateEngine,
    options.cssFramework,
  ];

  const features = [];

  if (options.includeMVCStructure) features.push("MVC structure");
  if (options.includeAuthSystem) features.push("Auth system");
  if (options.includeREADME) features.push("README");
  if (options.databaseChoice === "MongoDB") features.push("MongoDB config");
  if (options.authenticationType === "JWT") features.push("JWT flow");

  const folders = [
    "config",
    "controllers",
    "middleware",
    "models",
    "routes",
    "views",
    "public/css",
    "public/js",
  ];

  if (!options.includeMVCStructure) {
    folders.splice(1, 1);
    folders.splice(3, 1);
  }

  return {
    projectName: displayName,
    safeName: sanitizeProjectName(displayName),
    techStack,
    features,
    folders,
    summary: {
      database: options.databaseChoice,
      auth: options.authenticationType,
      template: options.templateEngine,
      css: options.cssFramework,
    },
    stats: [
      { label: "Folders", value: folders.length },
      { label: "Features", value: features.length },
      { label: "Output", value: "ZIP" },
    ],
    tree: buildPreviewTree(options, displayName),
    projectPath: options.projectPath,
    zipPath,
  };
};

const waitForFile = async (filePath, timeoutMs = 15000, intervalMs = 250) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await fs.pathExists(filePath)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
};

const showHome = (req, res) => {
  res.render("index", {
    title: "BoilerBase",
  });
};

const showPreview = async (req, res, next) => {
  try {
    const preview = await readPreview(req.params.id);

    if (!preview) {
      return res.status(404).render("error", {
        title: "Preview Not Found",
        message: "The generated project preview is no longer available.",
      });
    }

    return res.render("preview", {
      title: "Project Preview",
      previewId: req.params.id,
      preview,
    });
  } catch (error) {
    return next(error);
  }
};

const generateProject = async (req, res, next) => {
  try {
    const options = normalizeOptions(req.body);
    const validationError = validateOptions(options);

    if (validationError) {
      return res.status(400).render("error", {
        title: "Invalid Input",
        message: validationError,
      });
    }
    const projectPath = await createProject(options);
    const zipPath = path.join(
      __dirname,
      "..",
      "generated-projects",
      `${sanitizeProjectName(options.projectName)}.zip`,
    );

    const previewId = await savePreview(
      buildPreviewData({
        ...options,
        projectPath,
      }, zipPath),
    );

    return res.redirect(303, `/preview/${previewId}`);
  } catch (error) {
    return next(error);
  }
};

const downloadProject = async (req, res, next) => {
  try {
    const preview = await readPreview(req.params.id);

    if (!preview) {
      return res.status(404).render("error", {
        title: "Download Not Available",
        message: "We could not find the generated ZIP file.",
      });
    }

    if (!(await fs.pathExists(preview.zipPath))) {
      if (!preview.projectPath) {
        return res.status(404).render("error", {
          title: "Download Not Available",
          message: "The source project is no longer available.",
        });
      }

      await zipProject(preview.projectPath, preview.safeName);
    }

    const isReady = await waitForFile(preview.zipPath);

    if (!isReady) {
      return res.status(503).render("error", {
        title: "Preparing Download",
        message: "The ZIP file is still being prepared. Please try again in a moment.",
      });
    }

    return res.download(preview.zipPath, `${preview.safeName}.zip`, async (error) => {
      if (error) {
        return next(error);
      }

      await Promise.all([
        fs.remove(preview.zipPath),
        preview.projectPath ? fs.remove(preview.projectPath) : Promise.resolve(),
        removePreview(req.params.id),
      ]);
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  showHome,
  showPreview,
  downloadProject,
  generateProject,
};
