const core = require('@actions/core');
const lib = require('./lib');

async function run() {
  try {
    const keyword = core.getInput('keyword', {required: true});
    const repo = core.getInput('targetRepository', {required: true}); // format: $OWNER/$REPO_NAME
    const contentOfNewIssue = core.getInput('contentOfNewIssue', {require: true});

    const splitted = repo.split('/');
    const owner = splitted[0];
    const repoName = splitted[1];

    const token = core.getInput('githubToken');
    const issue = await lib.getIssueFromContext(token);
    const comment = lib.getIssueCommentFromContext();

    // Parse the comment for keyword, assignee, and additional content
    const parseResult = lib.parseKeywordCommand([keyword], comment.body);
    
    if (!parseResult.found) {
      console.log(`Keyword not included. keyword: ${keyword}, comment: ${comment.body}`);
      return;
    }

    // Determine assignees
    let assignees = ['soichisumi']; // default assignee
    if (parseResult.assignee) {
      assignees = [parseResult.assignee];
    }

    const created = await lib.createNewIssue(
      token, 
      owner, 
      repoName, 
      issue.data.title, 
      contentOfNewIssue, 
      assignees, 
      [], 
      issue.data.html_url,
      parseResult.additionalContent
    );

    core.setOutput('created', created);
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run();