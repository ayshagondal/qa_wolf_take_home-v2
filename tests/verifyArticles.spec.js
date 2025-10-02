const path = require('path');
const fs = require('fs');
const { test, expect } = require(path.resolve(__dirname, './test-base.js'));
const { validateArticleSorting } = require(path.resolve(__dirname, '../validation/articleValidation.js'));

test.describe('Sorted HackerNews Articles', () => {
  test('verify that the first 100 articles are sorted correctly', async ({ hackerNewsPage }) => {
    await hackerNewsPage.navigateToNewestPage();
    //console.log("Starting Positive Test for Sorting Validation");

    const posts = await hackerNewsPage.getHackerNewsPosts(100);
    expect(posts.length).toBe(100);

    if (posts.length > 0) {
        const serializedPosts = posts.slice(0,10).map(post => ({
            ...post,
            submissionDate: post.submissionDate.toISOString()
        }));

        test.info().annotations.push({
            type: '10-newest-posts',
            description: JSON.stringify(serializedPosts)
        });
        const dataFilePath = path.resolve(__dirname, '../temp-posts-data.json');
      
        fs.writeFileSync(dataFilePath, JSON.stringify(serializedPosts, null, 2));
    }
    const validationResult = validateArticleSorting(posts);
    expect(validationResult.isSorted, validationResult.message).toBe(true);
  });

  test('should fail when posts are not sorted correctly', async ({ hackerNewsPage }) => {
    await hackerNewsPage.navigateToNewestPage();
    
    const posts = await hackerNewsPage.getHackerNewsPosts(100);
    expect(posts.length).toBe(100);
    // Intentionally tamper with posts to create a failure scenario
    if(posts.length >= 10){
        const temp = posts[5];
        posts[5] = posts[10];
        posts[10] = temp;
    }
    const validationResult = validateArticleSorting(posts);
    console.log("Starting Negative Test for Sorting Validation");
    //console.log("Expecting validation to fail...");
    expect(validationResult.isSorted, `Test should have failed, but it passed. Error: "${validationResult.message}"`).not.toBe(true);
    expect(validationResult.message).toContain("Article at index 5 is older than");
    console.log("Failure message:", validationResult.message);
    console.log("Validation failed as expected");
});
});