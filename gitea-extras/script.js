// ==UserScript==
// @name         Gitea Extras
// @version      0.1.0
// @description  Adds buttons to Gitea to quickly checkout and create branches
// @author       brabli
// @match        https://*.co.uk/*
// @icon         https://about.gitea.com/images/gitea.svg
// @website      https://github.com/brabli/tampermonkey-scripts
// ==/UserScript==

(function () {
    "use strict";

    if (isIssuePage()) {
        const checkoutBranch = createButton("Checkout Branch", () => {
            copyTextToClipboard(
                `git checkout ${generateBranchName(
                    getIssueTitle(),
                    getIssueNumber()
                )}`
            );
        });

        const createBranch = createButton("Create Branch", () => {
            copyTextToClipboard(
                `git checkout -b ${generateBranchName(
                    getIssueTitle(),
                    getIssueNumber()
                )}`
            );
        });

        insertNextToEditButton(checkoutBranch);
        insertNextToEditButton(createBranch);

        return;
    }

    if (isIssueList()) {
        for (const issue of document.querySelectorAll("div.issue.list > li")) {
            const issueName = issue.querySelector("a.title");
            const issueNumber = issue
                .querySelector("a.index")
                .textContent.replaceAll(/[^0-9]/g, "");
            const branch = generateBranchName(
                issueName.textContent,
                issueNumber
            );
            const createBranchBtn = createSmallButton("Create", () => {
                copyTextToClipboard(`git checkout -b ${branch}`);
            });
            createBranchBtn.title = "Create branch";

            issue
                .querySelector("div")
                .insertAdjacentElement("afterend", createBranchBtn);

            const checkoutBranchBtn = createSmallButton("Checkout", () => {
                copyTextToClipboard(`git checkout ${branch}`);
            });

            checkoutBranchBtn.title = "Checkout branch";

            issue
                .querySelector("div")
                .insertAdjacentElement("afterend", checkoutBranchBtn);
        }
    }
})();

/**
 * @returns {boolean} True if current page is the issue list
 */
function isIssueList() {
    return select("#issue-actions") && select(".issue.list");
}

/**
 * @param {HTMLElement} elem An HTML element
 */
function insertNextToEditButton(elem) {
    getEditButton().insertAdjacentElement("beforebegin", elem);
}

/**
 * @param {string} text Button text
 * @param {Function} callback Callback
 * @returns {HTMLButtonElement} Button
 */
function createButton(text, callback) {
    const btn = document.createElement("button");
    btn.className = "ui basic button secondary";
    btn.innerText = text;
    btn.addEventListener("click", callback);

    return btn;
}

/**
 * @param {string} buttonText
 * @param {Function} callback
 * @returns {HTMLButtonElement}
 */
function createSmallButton(buttonText, callback) {
    const btn = createButton(buttonText, callback);
    const classes = "ui basic compact gt-mr-4 small button secondary";
    btn.classList.add(...classes.split(" "));

    return btn;
}

/**
 * @param {string} issueName
 * @param {string} issueNumber
 * @returns {string} Generated branch name
 */
function generateBranchName(issueName, issueNumber) {
    let branch = `issue/${issueNumber}`;
    const titleNoSymbols = issueName.replaceAll(/[^\w\s]/g, "");
    const issueTitleKebabCase = titleNoSymbols
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .join("-");

    return `${branch}-${issueTitleKebabCase}`;
}

/**
 * @returns {boolean} True if current page is the issue page
 */
function isIssuePage() {
    return select("h1 span#issue-title") && select("h1 span.index");
}

/**
 * @returns {string} Issue number
 */
function getIssueNumber() {
    return select("h1 span.index").textContent.substring(1);
}

/**
 * @returns {string}
 */
function getIssueTitle() {
    return select("h1 span#issue-title")
        .textContent.trim()
        .replace(/[0-9]+$/, "");
}

/**
 * @returns {HTMLElement}
 */
function getEditButton() {
    return select("button#edit-title");
}

/**
 * @param {string} text Text to copy to the clipboard
 */
function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text);
}

/**
 * Wrapper around querySelector that throws if an element is not found.
 * @param {string} cssSelector CSS selector string
 * @returns {HTMLElement} Selected element or null
 */
function select(cssSelector) {
    const elmt = document.querySelector(cssSelector);

    if (!elmt) {
        throw new Error(
            `Failed to find an element with the selector "${cssSelector}"!`
        );
    }

    return elmt;
}
