// ==UserScript==
// @name         Gitea Extras
// @version      0.1.0
// @description  Adds buttons to Gitea to quickly checkout and create branches
// @author       brabli
// @match        https://*.co.uk/*
// @icon         https://about.gitea.com/images/gitea.svg
// @website      https://github.com/brabli/tampermonkey-scripts
// ==/UserScript==

(function() {
    'use strict';
    run();
})();

function run() {
    if (isIssuePage()) {
        const checkoutBranch = createButton('Checkout Branch', () => {

            copyToClipboard(`git checkout ${generateBranchName(getIssueTitle(), getIssueNumber())}`);
        });

        const createBranch = createButton('Create Branch', () => {
            copyToClipboard(`git checkout -b ${generateBranchName(getIssueTitle(), getIssueNumber())}`);
        });

        insertNextToEditButton(checkoutBranch);
        insertNextToEditButton(createBranch);

        return;
    }

    if (isIssueList()) {
        for (issue of document.querySelectorAll('div.issue.list > li')) {
            const issueName = issue.querySelector('a.title');
            const issueNumber = issue.querySelector('a.index').textContent.replaceAll(/[^0-9]/g, '');
            const branch = generateBranchName(issueName.textContent, issueNumber);
            const createBranchBtn = createSmallButton('Create', () => {
                copyToClipboard(`git checkout -b ${branch}`);
            })
            createBranchBtn.title = "Create branch";

            issue.querySelector('div').insertAdjacentElement('afterend', createBranchBtn);


            const checkoutBranchBtn = createSmallButton('Checkout', () => {
                copyToClipboard(`git checkout ${branch}`);
            })

            checkoutBranchBtn.title = "Checkout branch";

            issue.querySelector('div').insertAdjacentElement('afterend', checkoutBranchBtn);
        }
    }
}

function isIssueList() {
    return select('#issue-actions') && select('.issue.list');
}

function insertNextToEditButton(elem) {
    getEditButton().insertAdjacentElement('beforebegin', elem);
}

function createButton(text, callback) {
    const btn = document.createElement("button");
    btn.className = 'ui basic button secondary';
    btn.innerText = text;
    btn.addEventListener('click', callback);

    return btn;
}

function createSmallButton(text, callback) {
    const btn = createButton(text, callback);
    const classes = 'ui basic compact gt-mr-4 small button secondary';
    btn.classList.add(...classes.split(' '));

    return btn;
}

function generateBranchName(issueName, issueNumber) {
    let branch = `issue/${issueNumber}`;
    const titleNoSymbols = issueName.replaceAll(/[^\w\s]/g, '');
    const issueTitleKebabCase = titleNoSymbols.toLowerCase().trim().split(/\s+/).join('-');

    return `${branch}-${issueTitleKebabCase}`;
}

function isIssuePage() {
    return select('h1 span#issue-title') && select('h1 span.index');
}

function select(cssSelector) {
    return document.querySelector(cssSelector);
}

function getIssueNumber() {
    return select('h1 span.index').textContent.substr(1);
}

function getIssueTitle() {
    return select('h1 span#issue-title').textContent.trim().replace(/[0-9]+$/, '')
}

function getEditButton() {
    return select('button#edit-title');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}
