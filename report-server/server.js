const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8888;

// --- Path Definitions ---
// Define the project's root directory, one level up from this script.
const projectRoot = path.resolve(__dirname, '../');
const dashboardPath = path.join(projectRoot, 'test-dashboard.html');

console.log(`Project root is defined as: ${projectRoot}`);

// --- Route Handlers (Order is Critical) ---

// 1. SPECIFIC ROUTE: Handle the main landing page.
app.get('/', (req, res) => {
  if (fs.existsSync(dashboardPath)) {
    res.sendFile(dashboardPath);
  } else {
    res.status(404).send('<h1>Error: summary-dashboard.html not found.</h1><p>Run `npm run test:report` to generate it.</p>');
  }
});

// 2. GENERAL ROUTE: Serve ALL other files statically from the project root.
// This will handle requests for /playwright-report/index.html, /allure-report/index.html, etc.
app.use(express.static(projectRoot));


// --- Start the Server ---
app.listen(PORT, () => {
  console.log('-----------------------------------------');
  console.log(`Report server is running!`);
  console.log(`✅ Access your dashboard at: http://localhost:${PORT}`);
  console.log('-----------------------------------------');
});