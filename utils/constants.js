const PROJECT_ROOT_FOLDERS = [
  "config",
  "controllers",
  "middleware",
  "models",
  "routes",
  "views",
  "public",
  "public/css",
  "public/js",
];

const FORM_DEFAULTS = {
  databaseChoice: "MongoDB",
  authenticationType: "JWT",
  templateEngine: "EJS",
  cssFramework: "Vanilla CSS",
};

module.exports = {
  PROJECT_ROOT_FOLDERS,
  FORM_DEFAULTS,
};
