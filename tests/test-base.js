const base = require('@playwright/test');
const { HackerNewsPage } = require('../page-objects/hackerNewsPage')

exports.test = base.test.extend({
    hackerNewsPage: async ({page}, use) =>{
        const hackerNewsPage = new HackerNewsPage(page);
        await use(hackerNewsPage);
    },
});

exports.expect = base.expect;
