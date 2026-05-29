const { sanitizeProjectName, toPackageName } = require("../utils/pathUtils");

const isMongoDB = (options) => options.databaseChoice === "MongoDB";
const isAuthEnabled = (options) =>
  options.includeAuthSystem && options.authenticationType === "JWT";
const isEJS = (options) => options.templateEngine === "EJS";
const isBootstrap = (options) => options.cssFramework === "Bootstrap";
const isMVC = (options) => options.includeMVCStructure;

const getViewExtension = (options) => (isEJS(options) ? "ejs" : "html");

const buildPackageTemplate = (options) => {
  const dependencies = {
    express: "^5.1.0",
    dotenv: "^16.5.0",
  };

  if (isEJS(options)) dependencies.ejs = "^3.1.10";
  if (isMongoDB(options)) dependencies.mongoose = "^8.15.0";
  if (isAuthEnabled(options)) {
    dependencies.jsonwebtoken = "^9.0.2";
    dependencies.bcryptjs = "^3.0.2";
  }

  return JSON.stringify(
    {
      name: toPackageName(options.projectName),
      version: "1.0.0",
      description: `Starter project generated for ${options.displayProjectName || options.projectName}`,
      main: "server.js",
      scripts: {
        start: "node server.js",
        dev: "nodemon server.js",
      },
      dependencies,
      devDependencies: {
        nodemon: "^3.1.10",
      },
    },
    null,
    2,
  );
};

const buildEnvTemplate = (options) => {
  const lines = ["PORT=3000", "NODE_ENV=development"];

  if (isMongoDB(options)) {
    lines.push(
      `MONGO_URI=mongodb://127.0.0.1:27017/${toPackageName(options.projectName)}`,
    );
  }

  if (isAuthEnabled(options)) {
    lines.push("JWT_SECRET=replace-with-a-strong-secret");
    lines.push("JWT_EXPIRES_IN=7d");
  }

  return `${lines.join("\n")}\n`;
};

const buildDbTemplate = (options) => {
  if (!isMongoDB(options)) {
    return `module.exports = async function connectDB() {\n  console.log('Database not configured. Set up your own data layer when ready.');\n};\n`;
  }

  return `const mongoose = require('mongoose');\n\nconst connectDB = async () => {\n  try {\n    await mongoose.connect(process.env.MONGO_URI);\n    console.log('MongoDB connected successfully');\n  } catch (error) {\n    console.error('MongoDB connection error:', error.message);\n    process.exit(1);\n  }\n};\n\nmodule.exports = connectDB;\n`;
};

const buildHomeControllerTemplate = (options) => {
  if (isEJS(options)) {
    return `const renderHome = (req, res) => {\n  res.render('index', {\n    pageTitle: 'BoilerBase',\n    featureLabel: 'Developer-ready starter project',\n  });\n};\n\nmodule.exports = {\n  renderHome,\n};\n`;
  }

  return `const path = require('path');\n\nconst renderHome = (req, res) => {\n  res.sendFile(path.join(__dirname, '../views/index.html'));\n};\n\nmodule.exports = {\n  renderHome,\n};\n`;
};

const buildIndexRouteTemplate = () => {
  return `const express = require('express');\nconst { renderHome } = require('../controllers/homeController');\n\nconst router = express.Router();\n\nrouter.get('/', renderHome);\n\nmodule.exports = router;\n`;
};

const buildServerTemplate = (options) => {
  const lines = [
    "require('dotenv').config();",
    "const path = require('path');",
    "const express = require('express');",
  ];

  if (isMongoDB(options)) {
    lines.push("const connectDB = require('./config/db');");
  }

  if (isMVC(options)) {
    lines.push("const homeRoutes = require('./routes/index');");
  }

  if (isAuthEnabled(options)) {
    lines.push("const authRoutes = require('./routes/authRoutes');");
  }

  lines.push(
    "",
    "const app = express();",
    "const PORT = process.env.PORT || 3000;",
    "",
    "app.use(express.urlencoded({ extended: true }));",
    "app.use(express.json());",
    "app.use(express.static(path.join(__dirname, 'public')));",
  );

  if (isEJS(options)) {
    lines.push(
      "app.set('view engine', 'ejs');",
      "app.set('views', path.join(__dirname, 'views'));",
    );
  }

  if (isMongoDB(options)) {
    lines.push("", "connectDB();");
  }

  if (isMVC(options)) {
    lines.push("", "app.use('/', homeRoutes);");
  } else if (isEJS(options)) {
    lines.push(
      "",
      "app.get('/', (req, res) => {",
      "  res.render('index', {",
      "    pageTitle: 'BoilerBase',",
      "    featureLabel: 'Developer-ready starter project',",
      "  });",
      "});",
    );
  } else {
    lines.push(
      "",
      "app.get('/', (req, res) => {",
      "  res.sendFile(path.join(__dirname, 'views', 'index.html'));",
      "});",
    );
  }

  if (isAuthEnabled(options)) {
    lines.push("app.use('/auth', authRoutes);");
  }

  lines.push(
    "",
    "app.get('/health', (req, res) => {",
    "  res.json({",
    "    status: 'ok',",
    `    project: '${sanitizeProjectName(options.projectName)}',`,
    "  });",
    "});",
    "",
    "app.listen(PORT, () => {",
    "  console.log('Server running on port ' + PORT);",
    "});",
  );

  return `${lines.join("\n")}\n`;
};

const buildAuthMiddlewareTemplate = () => {
  return `const jwt = require('jsonwebtoken');\n\nconst protectRoute = (req, res, next) => {\n  const authHeader = req.headers.authorization || '';\n  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;\n\n  if (!token) {\n    return res.status(401).json({ message: 'Authentication required.' });\n  }\n\n  try {\n    req.user = jwt.verify(token, process.env.JWT_SECRET);\n    return next();\n  } catch (error) {\n    return res.status(401).json({ message: 'Invalid or expired token.' });\n  }\n};\n\nmodule.exports = {\n  protectRoute,\n};\n`;
};

const buildUserModelTemplate = () => {
  return `const mongoose = require('mongoose');\n\nconst userSchema = new mongoose.Schema(\n  {\n    name: { type: String, required: true },\n    email: { type: String, required: true, unique: true },\n    password: { type: String, required: true },\n  },\n  { timestamps: true }\n);\n\nmodule.exports = mongoose.model('User', userSchema);\n`;
};

const buildAuthControllerTemplate = (options) => {
  if (isMongoDB(options)) {
    return `const bcrypt = require('bcryptjs');\nconst jwt = require('jsonwebtoken');\nconst User = require('../models/User');\n\nconst registerUser = async (req, res) => {\n  try {\n    const { name, email, password } = req.body;\n    const existingUser = await User.findOne({ email });\n\n    if (existingUser) {\n      return res.status(400).json({ message: 'User already exists.' });\n    }\n\n    const hashedPassword = await bcrypt.hash(password, 10);\n    const user = await User.create({ name, email, password: hashedPassword });\n\n    return res.status(201).json({\n      message: 'User registered successfully.',\n      user: {\n        id: user._id,\n        name: user.name,\n        email: user.email,\n      },\n    });\n  } catch (error) {\n    return res.status(500).json({ message: error.message });\n  }\n};\n\nconst loginUser = async (req, res) => {\n  try {\n    const { email, password } = req.body;\n    const user = await User.findOne({ email });\n\n    if (!user) {\n      return res.status(404).json({ message: 'User not found.' });\n    }\n\n    const passwordMatches = await bcrypt.compare(password, user.password);\n\n    if (!passwordMatches) {\n      return res.status(401).json({ message: 'Invalid credentials.' });\n    }\n\n    const token = jwt.sign(\n      { id: user._id, email: user.email },\n      process.env.JWT_SECRET,\n      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }\n    );\n\n    return res.json({ token });\n  } catch (error) {\n    return res.status(500).json({ message: error.message });\n  }\n};\n\nmodule.exports = {\n  registerUser,\n  loginUser,\n};\n`;
  }

  return `const bcrypt = require('bcryptjs');\nconst jwt = require('jsonwebtoken');\n\nconst demoUsers = [];\n\nconst registerUser = async (req, res) => {\n  try {\n    const { name, email, password } = req.body;\n    const existingUser = demoUsers.find((user) => user.email === email);\n\n    if (existingUser) {\n      return res.status(400).json({ message: 'User already exists.' });\n    }\n\n    const hashedPassword = await bcrypt.hash(password, 10);\n    const user = {\n      id: Date.now().toString(),\n      name,\n      email,\n      password: hashedPassword,\n    };\n\n    demoUsers.push(user);\n\n    return res.status(201).json({\n      message: 'User registered successfully.',\n      user: {\n        id: user.id,\n        name: user.name,\n        email: user.email,\n      },\n    });\n  } catch (error) {\n    return res.status(500).json({ message: error.message });\n  }\n};\n\nconst loginUser = async (req, res) => {\n  try {\n    const { email, password } = req.body;\n    const user = demoUsers.find((entry) => entry.email === email);\n\n    if (!user) {\n      return res.status(404).json({ message: 'User not found.' });\n    }\n\n    const passwordMatches = await bcrypt.compare(password, user.password);\n\n    if (!passwordMatches) {\n      return res.status(401).json({ message: 'Invalid credentials.' });\n    }\n\n    const token = jwt.sign(\n      { id: user.id, email: user.email },\n      process.env.JWT_SECRET,\n      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }\n    );\n\n    return res.json({ token });\n  } catch (error) {\n    return res.status(500).json({ message: error.message });\n  }\n};\n\nmodule.exports = {\n  registerUser,\n  loginUser,\n};\n`;
};

const buildAuthRoutesTemplate = () => {
  return `const express = require('express');\nconst { registerUser, loginUser } = require('../controllers/authController');\nconst { protectRoute } = require('../middleware/authMiddleware');\n\nconst router = express.Router();\n\nrouter.post('/register', registerUser);\nrouter.post('/login', loginUser);\nrouter.get('/profile', protectRoute, (req, res) => {\n  res.json({\n    message: 'Protected route reached successfully.',\n    user: req.user,\n  });\n});\n\nmodule.exports = router;\n`;
};

const buildIndexViewTemplate = (options) => {
  const bootstrapLink = isBootstrap(options)
    ? `  <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' rel='stylesheet'>\n`
    : "";
  const actionCopy = isEJS(options)
    ? `<span><%= featureLabel %></span>`
    : `<span>Developer-ready starter project</span>`;

  if (isEJS(options)) {
    return `<!DOCTYPE html>\n<html lang='en'>\n<head>\n  <meta charset='UTF-8'>\n  <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n  <title><%= pageTitle %></title>\n${bootstrapLink}  <link rel='stylesheet' href='/css/style.css'>\n</head>\n<body>\n  <main class='page-shell'>\n    <section class='hero-card'>\n      <div class='hero-badge'>BoilerBase Starter</div>\n      <h1>Project scaffold ready in seconds.</h1>\n      <p>${actionCopy}</p>\n      <div class='hero-grid'>\n        <article>\n          <strong>MongoDB-ready</strong>\n          <span>Config, models, and environment setup included.</span>\n        </article>\n        <article>\n          <strong>Auth-friendly</strong>\n          <span>JWT routes and middleware are scaffolded when enabled.</span>\n        </article>\n        <article>\n          <strong>Responsive UI</strong>\n          <span>Built with a polished, mobile-ready starter layout.</span>\n        </article>\n      </div>\n    </section>\n  </main>\n  <script src='/js/main.js'></script>\n</body>\n</html>\n`;
  }

  return `<!DOCTYPE html>\n<html lang='en'>\n<head>\n  <meta charset='UTF-8'>\n  <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n  <title>BoilerBase</title>\n${bootstrapLink}  <link rel='stylesheet' href='/css/style.css'>\n</head>\n<body>\n  <main class='page-shell'>\n    <section class='hero-card'>\n      <div class='hero-badge'>BoilerBase Starter</div>\n      <h1>Project scaffold ready in seconds.</h1>\n      <p>Developer-ready starter project</p>\n      <div class='hero-grid'>\n        <article>\n          <strong>MongoDB-ready</strong>\n          <span>Config, models, and environment setup included.</span>\n        </article>\n        <article>\n          <strong>Auth-friendly</strong>\n          <span>JWT routes and middleware are scaffolded when enabled.</span>\n        </article>\n        <article>\n          <strong>Responsive UI</strong>\n          <span>Built with a polished, mobile-ready starter layout.</span>\n        </article>\n      </div>\n    </section>\n  </main>\n  <script src='/js/main.js'></script>\n</body>\n</html>\n`;
};

const buildLoginViewTemplate = (options) => {
  if (!isEJS(options)) {
    return `<!DOCTYPE html>\n<html lang='en'>\n<head>\n  <meta charset='UTF-8'>\n  <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n  <title>Login</title>\n  <link rel='stylesheet' href='/css/style.css'>\n</head>\n<body>\n  <section class='auth-card'>\n    <h1>Login</h1>\n    <p>Connect this form to your auth API.</p>\n  </section>\n</body>\n</html>\n`;
  }

  return `<section class='auth-card'>\n  <h1>Login</h1>\n  <p>Connect this form to your auth API.</p>\n</section>\n`;
};

const buildRegisterViewTemplate = (options) => {
  if (!isEJS(options)) {
    return `<!DOCTYPE html>\n<html lang='en'>\n<head>\n  <meta charset='UTF-8'>\n  <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n  <title>Register</title>\n  <link rel='stylesheet' href='/css/style.css'>\n</head>\n<body>\n  <section class='auth-card'>\n    <h1>Register</h1>\n    <p>Connect this form to your auth API.</p>\n  </section>\n</body>\n</html>\n`;
  }

  return `<section class='auth-card'>\n  <h1>Register</h1>\n  <p>Connect this form to your auth API.</p>\n</section>\n`;
};

const buildReadmeTemplate = (options) => {
  const features = [
    "- Express server scaffold",
    `- ${options.databaseChoice} data layer`,
    `- ${options.authenticationType} authentication scaffold`,
    `- ${options.templateEngine} templating`,
    `- ${options.cssFramework} styling`,
  ];

  return `# ${options.displayProjectName || options.projectName}\n\nGenerated by BoilerBase CLI.\n\n## Included\n${features.join("\n")}\n\n## Run\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`;
};

const buildPublicCssTemplate = (options) => {
  const frameworkAccent = isBootstrap(options) ? "#7dd3fc" : "#8b5cf6";

  return `:root {\n  color-scheme: dark;\n  --bg: #07111f;\n  --panel: rgba(12, 18, 33, 0.88);\n  --panel-border: rgba(148, 163, 184, 0.18);\n  --text: #e2e8f0;\n  --muted: #94a3b8;\n  --accent: ${frameworkAccent};\n  --accent-2: #22d3ee;\n  --shadow: 0 30px 80px rgba(0, 0, 0, 0.35);\n}\n\n* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  min-height: 100vh;\n  font-family: Inter, Segoe UI, Arial, sans-serif;\n  color: var(--text);\n  background:\n    radial-gradient(circle at top left, rgba(34, 211, 238, 0.16), transparent 28%),\n    radial-gradient(circle at top right, rgba(139, 92, 246, 0.18), transparent 24%),\n    linear-gradient(180deg, #040812 0%, #07111f 100%);\n}\n\nbody::before {\n  content: '';\n  position: fixed;\n  inset: 0;\n  background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);\n  background-size: 36px 36px;\n  pointer-events: none;\n  opacity: 0.35;\n}\n\n.page-shell {\n  position: relative;\n  z-index: 1;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  padding: 40px 20px;\n}\n\n.hero-card,\n.auth-card {\n  width: min(1100px, 100%);\n  background: var(--panel);\n  border: 1px solid var(--panel-border);\n  box-shadow: var(--shadow);\n  backdrop-filter: blur(20px);\n  border-radius: 28px;\n  padding: clamp(28px, 5vw, 56px);\n}\n\n.hero-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 14px;\n  border-radius: 999px;\n  background: rgba(34, 211, 238, 0.12);\n  color: #cffafe;\n  border: 1px solid rgba(34, 211, 238, 0.22);\n  font-size: 0.85rem;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\nh1 {\n  margin: 20px 0 12px;\n  font-size: clamp(2.4rem, 5vw, 4.8rem);\n  line-height: 0.95;\n}\n\np {\n  margin: 0;\n  max-width: 60ch;\n  color: var(--muted);\n  font-size: 1.05rem;\n}\n\n.hero-grid {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 18px;\n  margin-top: 32px;\n}\n\n.hero-grid article {\n  padding: 20px;\n  border-radius: 20px;\n  background: rgba(15, 23, 42, 0.66);\n  border: 1px solid rgba(148, 163, 184, 0.14);\n}\n\n.hero-grid strong {\n  display: block;\n  margin-bottom: 8px;\n  color: white;\n}\n\n.hero-grid span {\n  color: var(--muted);\n  line-height: 1.6;\n}\n\n@media (max-width: 900px) {\n  .hero-grid {\n    grid-template-columns: 1fr;\n  }\n}\n`;
};

const buildPublicJsTemplate = () => {
  return `document.addEventListener('DOMContentLoaded', () => {\n  document.body.classList.add('is-ready');\n\n  const cards = document.querySelectorAll('.hero-grid article, .form-card, .stats-card');\n  cards.forEach((card, index) => {\n    card.style.animationDelay = String(index * 90) + 'ms';\n    card.classList.add('reveal');\n  });\n});\n`;
};

module.exports = {
  buildPackageTemplate,
  buildEnvTemplate,
  buildDbTemplate,
  buildHomeControllerTemplate,
  buildIndexRouteTemplate,
  buildServerTemplate,
  buildAuthMiddlewareTemplate,
  buildUserModelTemplate,
  buildAuthControllerTemplate,
  buildAuthRoutesTemplate,
  buildIndexViewTemplate,
  buildLoginViewTemplate,
  buildRegisterViewTemplate,
  buildReadmeTemplate,
  buildPublicCssTemplate,
  buildPublicJsTemplate,
  getViewExtension,
  isMongoDB,
  isAuthEnabled,
  isEJS,
  isBootstrap,
  isMVC,
};
