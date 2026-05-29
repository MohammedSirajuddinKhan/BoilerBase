const notFoundHandler = (req, res, next) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    message: "The requested route does not exist.",
  });
};

const errorHandler = (error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).render("error", {
    title: "Generation Failed",
    message: error.message || "Something went wrong while generating the project.",
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
