function validateArticleSorting(articles){
    for(let i = 0; i < articles.length-1; i++){
        if(articles[i].submissionDate.getTime() < articles[i+1].submissionDate.getTime()){
            const failureMessage = `Article sorting failed: Article at index ${i} is older than article at index ${i+1}`;
            return {isSorted: false, message: failureMessage};
        }
    }
    return {isSorted: true, message: "Articles are sorted correctly."};
}
module.exports = { validateArticleSorting };