// content of context: https://developer.github.com/v3/activity/events/types/
const github = require('@actions/github');

const getIssueNumber = () => {
    const issue = github.context.payload.issue;
    if (!issue) {
        throw new Error("No issue provided");
    }
    return issue.number;
};
module.exports.getIssueNumber = getIssueNumber;

const getIssueFromContext = async (token) => {
    let octocat = new github.GitHub(token);
    const issueNum = getIssueNumber();

    const repo = github.context.repo;
    const issue = await octocat.issues.get({
        owner: repo.owner,
        repo: repo.repo,
        issue_number: issueNum,
    });
    
    return issue;
};
module.exports.getIssueFromContext = getIssueFromContext;

const getIssueCommentFromContext = () => {
    const comment = github.context.payload.comment;
    if (!comment) {
        throw new Error("No issue provided");
    }
    return comment;
} 
module.exports.getIssueCommentFromContext = getIssueCommentFromContext;

const checkKeywords = (keywords, body) => {
    const lowerBody = body.toLowerCase();
    for(let k of keywords) {
        if (lowerBody.toLowerCase().includes(k.toLowerCase())){
            return true;
        }
    }
    return false;
};
module.exports.checkKeywords = checkKeywords;

const parseKeywordCommand = (keywords, body) => {
    const lowerBody = body.toLowerCase();
    for(let k of keywords) {
        const keywordIndex = lowerBody.indexOf(k.toLowerCase());
        if (keywordIndex !== -1) {
            // Extract the part after the keyword
            const afterKeyword = body.substring(keywordIndex + k.length).trim();
            
            let assignee = null;
            let additionalContent = '';
            
            // Check if there's an @ mention after the keyword
            const atIndex = afterKeyword.indexOf('@');
            if (atIndex !== -1) {
                // Extract everything after @
                const afterAt = afterKeyword.substring(atIndex + 1);
                
                // Split by whitespace to get the username (first part after @)
                const parts = afterAt.trim().split(/\s+/);
                if (parts.length > 0 && parts[0] && parts[0].trim() !== '') {
                    assignee = parts[0];
                    // Everything after the username is additional content
                    if (parts.length > 1) {
                        additionalContent = parts.slice(1).join(' ');
                    }
                } else {
                    // If @ is followed by empty space or nothing, treat everything as additional content
                    additionalContent = afterAt.trim();
                }
            } else {
                // If no @ mention, everything after keyword is additional content
                additionalContent = afterKeyword;
            }
            
            return {
                found: true,
                assignee: assignee,
                additionalContent: additionalContent.trim()
            };
        }
    }
    return {
        found: false,
        assignee: null,
        additionalContent: ''
    };
};
module.exports.parseKeywordCommand = parseKeywordCommand;

const createNewIssue = async (token, owner, repoName, title, body, assignees, labels, fromIssue, additionalContent) => {
    const octokit = new github.GitHub(token);
    if (!fromIssue) {
        throw new Error('fromIssue is not provided')
    }
    
    // Combine original body, additional content, and source reference
    let finalBody = '';
    if (typeof body === 'string' && body !== '') {
        finalBody = body;
    }
    
    if (additionalContent && additionalContent.trim() !== '') {
        if (finalBody !== '') {
            finalBody += '\n\n' + additionalContent;
        } else {
            finalBody = additionalContent;
        }
    }
    
    // Add source reference
    if (finalBody !== '') {
        finalBody += `\n\ncopiedFrom: ${fromIssue}`;
    } else {
        finalBody = `copiedFrom: ${fromIssue}`;
    }

    const res = await octokit.issues.create(
        {
            owner: owner,
            repo: repoName,
            title: title,
            body: finalBody,
            assignees: assignees,
            labels: labels,
        }
    );
    return [res.id, res.number].join(':');
};
module.exports.createNewIssue = createNewIssue;