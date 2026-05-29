const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

const generateRoutes = require("./routes/generateRoutes");
const { notFoundHandler, errorHandler } = require("./middlewares/errorMiddleware");

dotenv.config();

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("SIGTERM", () => {
  console.error("Received SIGTERM");
});

process.on("SIGINT", () => {
  console.error("Received SIGINT");
});

process.on("exit", (code) => {
  console.error(`Process exiting with code ${code}`);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "BoilerBase",
  });
});

app.use("/", generateRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`BoilerBase running on port http://localhost:${PORT}`);
});
