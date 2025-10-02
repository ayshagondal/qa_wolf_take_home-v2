const fs = require('fs');
const path = require('path');

class HackerNewsReporter {
    constructor() {
        this.results = [];
        this.customLogs = '';
    }

    onBegin(config, suite) {
        console.log(`Starting the run with ${suite.allTests().length} tests`);
    }

    onStdOut(chunk){
        this.customLogs += chunk.toString();
    }

    onTestEnd(test, result) {
        const getProjectName = (test) => {
            let suite = test.parent;
            while (suite.parent && suite.parent.title !== '') {
                suite = suite.parent;
            }
            return suite.title;
        };

        this.results.push({
            title: test.title,
            status: result.status,
            duration: result.duration,
            browser: getProjectName(test),
            errors: (result.errors || []).map(err => err.message),
        });
    }

    onEnd(result){
        console.log(`Finished the run: ${result.status}`);

        let newPostsHtml = '<p>Data file "temp-posts-data.json" was not found.</p>';
        const dataFilePath = path.resolve(__dirname, './temp-posts-data.json');

        if (fs.existsSync(dataFilePath)) {
            try {
                const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
                const newPosts = JSON.parse(fileContent);

                newPostsHtml = newPosts.map(post => `
                    <div class="post-card">
                        <h4><a href="${post.url}" target="_blank">${post.title}</a></h4>
                        <ul>
                            <li><strong>Submitter:</strong> ${post.submitter}</li>
                            <li><strong>Points:</strong> ${post.points}</li>
                            <li><strong>Comments:</strong> ${post.commentsCount}</li>
                            <li><strong>Posted:</strong> ${new Date(post.submissionDate).toLocaleString()}</li>
                        </ul>
                    </div>
                `).join('');
                
                fs.unlinkSync(dataFilePath); 

            } catch (e) {
                console.error('Reporter Error: Failed to read/parse temp-posts-data.json.', e);
                newPostsHtml = '<p>Error processing posts data file. See terminal for details.</p>';
            }
        }
        
        const testResultsHtml = this.results.map(res => {
            const browserName = res.browser || 'unknown';
            return `
                <tr>
                    <td class="browser-name">${browserName}</td>
                    <td class="status-${res.status}">${res.status}</td>
                    <td>${res.title}</td>
                    <td>${(res.duration / 1000).toFixed(2)}s</td>
                    <td class="errors">${res.errors.join('<br>')}</td>
                </tr>
            `;
        }).join('');

        const finalHTML = ` 
            <!DOCTYPE html> 
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Test Dashboard</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 2em; background-color: #f4f7f9; }
                  h1, h2, h3, h4 { color: #333; }
                  .summary, .logs, .results { background: white; border: 1px solid #e1e4e8; border-radius: 8px; padding: 1.5em; margin-bottom: 2em; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                  .links a { display: inline-block; background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-right: 10px; transition: background-color 0.2s ease; }
                  .links a:hover { background-color: #0056b3; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e1e4e8; }
                  th { background-color: #f4f7f9; }
                  .status-passed { color: #28a745; font-weight: bold; }
                  .status-failed { color: #dc3545; font-weight: bold; }
                  .errors { color: #dc3545; font-size: 0.9em; white-space: pre-wrap; }
                  .browser-name { text-transform: capitalize; font-family: monospace; }
                  pre { background: #2d2d2d; color: #f1f1f1; padding: 1em; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; }
                  .top-posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1em; }
                  .post-card { background: #fafafa; border: 1px solid #e1e4e8; border-radius: 6px; padding: 1em; }
                  .post-card h4 { margin-top: 0; margin-bottom: 0.5em; }
                  .post-card h4 a { text-decoration: none; color: #007bff; }
                  .post-card h4 a:hover { text-decoration: underline; }
                  .post-card ul { list-style-type: none; padding: 0; margin: 0; font-size: 0.9em; color: #555; }
                  .post-card li { margin-bottom: 0.25em; }
                </style>
            </head>
            <body>
                <h1>Test Summary Dashboard</h1>
                <div class="summary links">
                  <h2>External Reports</h2>
                  <a href="/playwright-report/index.html" target="_blank">View Full Playwright Report</a>
                  <a href="/allure-report/index.html" target="_blank">View Full Allure Report</a>
                </div>
                <div class="results">
                  <h2>10 Newest Posts</h2>
                  <div class="top-posts-grid">
                    ${newPostsHtml}
                  </div>
                </div>
                <div class="logs">
                  <h2>Console Output</h2>
                  <pre>${this.customLogs}</pre>
                </div>
                <div class="results">
                  <h2>Test Suite Results</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Browser</th>
                        <th>Status</th>
                        <th>Test Title</th>
                        <th>Duration</th>
                        <th>Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${testResultsHtml}
                    </tbody>
                  </table>
                </div>
            </body>
            </html>
        `;
        
        fs.writeFileSync('test-dashboard.html', finalHTML);
        console.log('Test dashboard generated: test-dashboard.html');
    }
}

module.exports = HackerNewsReporter;