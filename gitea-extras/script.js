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
        const issueName = select("h1 span#issue-title")
            .textContent.trim()
            .replace(/[0-9]+$/, "");
        const issueNumber = select("h1 span.index").textContent.substring(1);
        const branchName = generateBranchName(issueName, issueNumber);

        const checkoutCmd = getCheckoutBranchCommand(branchName);
        const copyCheckoutCmd = copyToClipboard(checkoutCmd);
        const checkoutBranchBtn =
            createBtn("Checkout")("Checkout branch")(copyCheckoutCmd);

        const createCmd = getNewBranchCommand(branchName);
        const newBranchCmd = copyToClipboard(createCmd);
        const createBranchBtn =
            createBtn("Create")("Create branch")(newBranchCmd);

        const editBtn = select("button#edit-title");
        editBtn.insertAdjacentElement("beforebegin", checkoutBranchBtn);
        editBtn.insertAdjacentElement("beforebegin", createBranchBtn);

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

            const newBranchCmd = getNewBranchCommand(branch);
            const copyNewBranchCmd = copyToClipboard(newBranchCmd);
            const createBranchBtn =
                createBtn("Create")("Create branch")(copyNewBranchCmd);
            issue
                .querySelector("div")
                .insertAdjacentElement("afterend", createBranchBtn);

            const checkoutCommand = getCheckoutBranchCommand(branch);
            const checkoutCallback = copyToClipboard(checkoutCommand);
            const checkoutBranchBtn =
                createBtn("Checkout")("Checkout branch")(checkoutCallback);

            issue
                .querySelector("div")
                .insertAdjacentElement("afterend", checkoutBranchBtn);
        });

        const smallBtnMenu = select(".small-menu-items.ui.compact.tiny.menu");
        const closedIssuesBtn = smallBtnMenu.querySelector("a:last-child");
        const url = new URL(closedIssuesBtn.href);
        url.searchParams.append("sort", "recentupdate");
        closedIssuesBtn.href = url.toString();
        smallBtnMenu.appendChild(closedIssuesBtn);
    }

    if (isBranchesPage()) {
        const branches = document.querySelectorAll("table tbody tr");

        branches.forEach((branch) => {
            const link = branch.querySelector("a");
            const branchName = link.innerText;
            const checkoutCommand = getCheckoutBranchCommand(branchName);
            const copyCmd = copyToClipboard(checkoutCommand);
            const btn = createBtn("Checkout")("Checkout branch")(copyCmd);

            const cell = wrapBtnInTd(btn);
            insertElmt(cell);

            /**
             * @param {HTMLButtonElement} btn
             * @returns {HTMLTableCellElement}
             */
            function wrapBtnInTd(btn) {
                const td = document.createElement("td");
                td.className = "two wide ui";
                td.appendChild(btn);

                return td;
            }

            /**
             * @param {HTMLTableCellElement} cell
             */
            function insertElmt(cell) {
                const firstCell = branch.querySelector("td");
                firstCell.insertAdjacentElement("beforebegin", cell);
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
 * @param {string} displayText
 * @returns {(titleText: string) => (onClickCallback: Function) => HTMLButtonElement}
 */
function createBtn(displayText) {
    const btn = document.createElement("button");
    btn.innerText = displayText;
    btn.className = "ui basic button secondary compact gt-mr-4 small";

    return (titleText) => {
        btn.title = titleText;

        return (onClickCallback) => {
            btn.addEventListener("click", onClickCallback);
            return btn;
        };
    };
}

/**
 * @param {string} text
 * @returns {() => void} Function that copies the passed in text to the clipboard
 */
function copyToClipboard(text) {
    return () => navigator.clipboard.writeText(text);
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
        .split(/\s+/) // Underscores slip through
        .join("-");

    return `${branch}-${issueTitleKebabCase}`;
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
