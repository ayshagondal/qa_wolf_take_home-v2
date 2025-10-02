const { chromium } = require("playwright");
const path = require("path");
const { HackerNewsPage } = require(path.resolve(__dirname, "./page-objects/hackerNewsPage.js"));
const { validateArticleSorting } = require(path.resolve(__dirname, "./validation/articleValidation.js"));


async function sortHackerNewsArticles() {
  const browser = await chromium.launch({ headless: false });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const hackerNewsPage = new HackerNewsPage(page);

    await hackerNewsPage.navigateToNewestPage();
    const posts = await hackerNewsPage.getHackerNewsPosts(100);
    const firstPost = posts[0];
    console.log(`First Post Title: ${firstPost.title}; Submission Date: ${firstPost.submissionDate}`);
    console.log(`Points: ${firstPost.points}; Posted by: ${firstPost.submitter}; Comments: ${firstPost.commentsCount}`);

    const validationResult = validateArticleSorting(posts);
    console.log(`\n${validationResult.message}`);
  } catch (error) {
      console.error("Error during sorting validation:", error);
  } finally {
      await browser.close();
  }
}

(async () => {
  await sortHackerNewsArticles();
})();
