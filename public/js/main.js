document.addEventListener("DOMContentLoaded", () => {
  const projectName = document.getElementById("projectName");
  const databaseChoice = document.getElementById("databaseChoice");
  const authenticationType = document.getElementById("authenticationType");
  const templateEngine = document.getElementById("templateEngine");
  const cssFramework = document.getElementById("cssFramework");
  const summaryName = document.getElementById("summaryName");
  const summaryStack = document.getElementById("summaryStack");
  const summaryDatabase = document.getElementById("summaryDatabase");
  const summaryTemplate = document.getElementById("summaryTemplate");
  const featureBadges = document.getElementById("featureBadges");

  if (!projectName || !databaseChoice || !authenticationType || !templateEngine || !cssFramework) {
    return;
  }

  const buildFeatureList = () => {
    const features = [];

    if (databaseChoice.value === "MongoDB") features.push("MongoDB config");
    if (authenticationType.value === "JWT") features.push("JWT auth");
    if (templateEngine.value === "EJS") features.push("EJS views");
    if (cssFramework.value === "Bootstrap") features.push("Bootstrap");
    features.push("README");

    return features;
  };

  const updateSummary = () => {
    const name = projectName.value.trim() || "MyApp";
    const stack = [
      databaseChoice.value,
      authenticationType.value,
      templateEngine.value,
      cssFramework.value,
    ].join(" · ");

    summaryName.textContent = name;
    summaryStack.textContent = stack;
    summaryDatabase.textContent = databaseChoice.value;
    summaryTemplate.textContent = templateEngine.value;

    if (featureBadges) {
      featureBadges.innerHTML = buildFeatureList()
        .filter(Boolean)
        .map((item) => `<span class="badge">${item}</span>`)
        .join("");
    }
  };

  [projectName, databaseChoice, authenticationType, templateEngine, cssFramework].forEach((field) => {
    field.addEventListener("input", updateSummary);
    field.addEventListener("change", updateSummary);
  });

  updateSummary();
});
