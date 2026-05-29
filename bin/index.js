#!/usr/bin/env node

const path = require("path");
const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");

const createProject = require("../generators/createProject");
const installDependencies = require("../generators/installDependencies");
const openVSCode = require("../generators/openVSCode");
const { sanitizeProjectName } = require("../utils/pathUtils");

const prompts = [
  {
    type: "input",
    name: "projectName",
    message: "Project name",
    default: "my-backend-app",
    validate: (value) => (value.trim() ? true : "Project name is required."),
  },
  {
    type: "list",
    name: "databaseChoice",
    message: "Select database",
    choices: ["MongoDB", "None"],
    default: "MongoDB",
  },
  {
    type: "list",
    name: "authenticationType",
    message: "Select authentication",
    choices: ["JWT", "None"],
    default: "JWT",
  },
  {
    type: "list",
    name: "templateEngine",
    message: "Select template engine",
    choices: ["EJS", "HTML"],
    default: "EJS",
  },
  {
    type: "list",
    name: "cssFramework",
    message: "Select CSS framework",
    choices: ["Vanilla CSS", "Bootstrap"],
    default: "Vanilla CSS",
  },
];

const run = async () => {
  console.log(chalk.green("\n✔ Welcome to BoilerBase\n"));

  const answers = await inquirer.prompt(prompts);
  const projectName = sanitizeProjectName(answers.projectName);
  const projectPath = path.join(process.cwd(), projectName);

  const generationSpinner = ora("Generating folders and files...").start();

  try {
    await createProject({
      projectName: answers.projectName,
      displayProjectName: answers.projectName.trim(),
      databaseChoice: answers.databaseChoice,
      authenticationType: answers.authenticationType,
      templateEngine: answers.templateEngine,
      cssFramework: answers.cssFramework,
      includeMVCStructure: true,
      includeAuthSystem: answers.authenticationType === "JWT",
      includeREADME: true,
      targetDirectory: process.cwd(),
    });

    generationSpinner.succeed("Generating folders and files...");

    const installSpinner = ora("Installing dependencies...").start();
    await installDependencies(projectPath);
    installSpinner.succeed("Installing dependencies...");

    const openSpinner = ora("Opening VS Code...").start();

    try {
      await openVSCode(projectPath);
      openSpinner.succeed("Opening VS Code...");
    } catch (error) {
      openSpinner.warn("Opening VS Code skipped");
      console.log(chalk.yellow(`\n! ${error.message}`));
    }

    console.log(chalk.green("\n✔ Project ready successfully"));
    console.log(chalk.cyan("\nNext steps:"));
    console.log(chalk.white(`cd ${projectName}`));
    console.log(chalk.white("npm run dev\n"));
  } catch (error) {
    generationSpinner.fail("Generation failed");
    console.error(chalk.red(`\n✖ ${error.message}`));
    process.exit(1);
  }
};

run();
