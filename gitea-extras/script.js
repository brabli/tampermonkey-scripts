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

    if (isIssuesPage()) {
        const listOfIssues = document.querySelectorAll("div.issue.list > li");

        listOfIssues.forEach((issue) => {
            const issueNameElmt = issue.querySelector("a.title");
            const issueNumberElmt = issue.querySelector("a.index");

            const name = issueNameElmt.textContent;
            const number = issueNumberElmt.textContent.replaceAll(
                /[^0-9]/g,
                ""
            );
            const branch = generateBranchName(name, number);

            const createBranchBtn = createSmallButton("Create", () => {
                copyTextToClipboard(getNewBranchCommand(branch));
            });
            createBranchBtn.title = "Create branch";

            issue
                .querySelector("div")
                .insertAdjacentElement("afterend", createBranchBtn);

            const checkoutBranchBtn = createSmallButton("Checkout", () => {
                copyTextToClipboard(getCheckoutBranchCommand(branch));
            });

            checkoutBranchBtn.title = "Checkout branch";

            issue
                .querySelector("div")
                .insertAdjacentElement("afterend", checkoutBranchBtn);
        });
    }

    if (isBranchesPage()) {
        const branches = document.querySelectorAll("table tbody tr");

        branches.forEach((branch) => {
            const link = branch.querySelector("a");
            const branchName = link.innerText;
            const checkoutCommand = getCheckoutBranchCommand(branchName);
            const copyCommamdToClipboard = copyToClipboard(checkoutCommand);
            const btn = createBtn("Checkout")("Checkout branch")(
                copyCommamdToClipboard
            );

            makeBtnSmall(btn);

            const div = document.createElement("td");
            div.className = "two wide ui";
            div.appendChild(btn);

            const b = branch.querySelector("td");

            if (b) {
                b.insertAdjacentElement("beforebegin", div);
            }
        });
    }
})();

/**
 * @param {string} branch
 * @returns {string} Create and checkout a new git branch command
 */
function getNewBranchCommand(branch) {
    return `git checkout -b ${branch}`;
}

/**
 * @param {string} branch
 * @returns {string} Checkout an existing git branch command
 */
function getCheckoutBranchCommand(branch) {
    return `git checkout ${branch}`;
}

/**
 * @returns {boolean} True if current page is the repo's main issue page
 */
function isIssuesPage() {
    return (
        document.querySelector("#issue-actions") &&
        document.querySelector(".issue.list")
    );
}

/**
 * @returns {boolean} True if current page is a specific issue page
 */
function isIssuePage() {
    return (
        document.querySelector("h1 span#issue-title") &&
        document.querySelector("h1 span.index")
    );
}

/**
 * @returns {boolean} True if the current page is the repo's branches page
 */
function isBranchesPage() {
    return !!document.querySelector(".repository.branches");
}

/**
 * @param {HTMLElement} elem An HTML element
 */
function insertNextToEditButton(elem) {
    getEditButton().insertAdjacentElement("beforebegin", elem);
}

/**
 * @deprecated
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
 * @param {string} displayText
 * @returns {(titleText: string) => (onClickCallback: Function) => HTMLButtonElement}
 */
function createBtn(displayText) {
    const btn = document.createElement("button");
    btn.innerText = displayText;
    btn.className = "ui basic button secondary";

    return (titleText) => {
        btn.title = titleText;

        return (onClickCallback) => {
            btn.addEventListener("click", onClickCallback);
            return btn;
        };
    };
}

/**
 * Makes a button small
 * @param {HTMLButtonElement} btn
 */
function makeBtnSmall(btn) {
    btn.classList.add(["compact", "gt-mr-4", "small"]);
}

/**
 * @param {string} text
 * @returns {() => void} Function that copies the passed in text to the clipboard
 */
function copyToClipboard(text) {
    return () => navigator.clipboard.writeText(text);
}

/**
 * @deprecated
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
 * @deprecated
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
