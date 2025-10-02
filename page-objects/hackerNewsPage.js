const {test, expect} = require('@playwright/test');
const { time } = require('console');
/**
 * @typedef {object} Post
 * @property {string} title
 * @property {string} url  
 * @property {string} submitter
 * @property {string} points
 * @property {string} commentsCount      
 * @property {string} timestamp 
 * @property {Date} submissionDate 
 */

class HackerNewsPage {
    constructor(page) {
        this.page = page;
        this.postRows = page.locator('tr.athing');
        this.moreLink = page.locator('.morelink').filter({hasText: 'More'});
    }

    async navigateToNewestPage(){
        await this.page.goto('https://news.ycombinator.com/newest');
    }

    async getHackerNewsPosts(requiredCount) {
        const allPosts = []; 
        while (allPosts.length < requiredCount) {
        await this.postRows.first().waitFor({ state: 'visible', timeout: 10000 });

        const postsFromPage = await this.postRows.evaluateAll(rows => {
            return rows.map(row => {
            const metadataRow = row.nextElementSibling;
            if(!metadataRow) return null;

            const titleElement = row.querySelector('.titleline > a');
            const pointsElement = metadataRow.querySelector('.score');
            const submitterElement = metadataRow.querySelector('.hnuser');
            const commentsElement = metadataRow.querySelector('td.subtext > a:last-child');
            const timestampElement = metadataRow.querySelector('.age');
            const rawTimestamp = timestampElement?.getAttribute('title') || '';

            const cleanTimestamp = rawTimestamp.split(' ')[0];

            const extractNumber = (text) => {
                if (!text) return 0;
                const match = text?.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            }
                const points = extractNumber(pointsElement?.textContent);

                const commentsText = commentsElement?.textContent || '';
                const commentsCount = commentsText.includes('discuss') ? 0 : extractNumber(commentsText);

            return {
                title: titleElement?.textContent || 'No Title',
                url: titleElement?.href || '',
                points: pointsElement?.textContent || '0 points',
                submitter: submitterElement?.textContent || 'N/A',
                commentsCount: commentsElement?.textContent || '0 comments',
                submissionDate: new Date(cleanTimestamp),
            };
            });
        });

        allPosts.push(...postsFromPage.filter(Boolean));

        if (allPosts.length < requiredCount) {
            if (await this.moreLink.isVisible()){
                await this.moreLink.click();
            } else{
                console.warn("No more articles available to load.");
                break;
            }
        }
    }
        return allPosts.slice(0, requiredCount);
    }
}

module.exports = { HackerNewsPage };

