const express = require("express");

const {
  showHome,
  showPreview,
  downloadProject,
  generateProject,
} = require("../controllers/generateController");

const router = express.Router();

router.get("/", showHome);
router.post("/generate", generateProject);
router.get("/preview/:id", showPreview);
router.get("/download/:id", downloadProject);

module.exports = router;
