# BoilerBase

A modern beginner-friendly backend scaffolding CLI for Node.js developers.

## Install

```bash
npm install
npm link
```

## Usage

```bash
npx boilerbase
# or
boilerbase
```

## What it does

- Prompts for project settings in the terminal
- Generates folders and starter files dynamically
- Installs dependencies automatically
- Opens the generated project in VS Code

## Stack

- Node.js
- inquirer
- chalk
- ora
- fs-extra

## Generated project

The generated backend starter includes:

- Express server scaffold
- Optional MongoDB config
- JWT auth routes and middleware
- EJS or HTML views
- CSS starter file and public assets

## Publish

This package is ready for `npm link`, `npm publish`, and `npx boilerbase`.
