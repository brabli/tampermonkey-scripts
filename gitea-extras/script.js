// ==UserScript==
// @name         Gitea Extras
// @version      0.2.1
// @description  Adds buttons to Gitea to quickly checkout and create branches, plus other tweaks for workflow improvements.
// @author       brabli
// @match        https://*.co.uk/*
// @icon         https://about.gitea.com/images/gitea.svg
// @website      https://github.com/brabli/tampermonkey-scripts
// ==/UserScript==

(function () {
    "use strict";

    if (isIssuePage()) {
        // Generate branch name
        const issueName = findIssueTitle();
        const issueNumber = findIssueNumber();
        const generatedBranchName = generateBranchName(issueName, issueNumber);

        // Create checkout branch button
        const checkoutCommandString = getCheckoutBranchCommand(generatedBranchName);
        const copyCheckoutCommandToClipboard = copyToClipboard(checkoutCommandString);
        const checkoutBranchGiteaButton =
            createGiteaButton("Checkout")("Checkout branch")(copyCheckoutCommandToClipboard);

        // Create create branch button
        const createBranchCommandString = getNewBranchCommand(generatedBranchName);
        const copyNewBranchCommandToClipboard = copyToClipboard(createBranchCommandString);
        const createBranchGiteaButton =
            createGiteaButton("Create")("Create branch")(copyNewBranchCommandToClipboard);

        // Find edit button to insert custom buttons next to it.
        const existingEditButton = select("button#issue-title-edit-show")("Failed to find existing edit button.");
        existingEditButton.insertAdjacentElement("beforebegin", checkoutBranchGiteaButton);
        existingEditButton.insertAdjacentElement("beforebegin", createBranchGiteaButton);

        return;
    }

    // @TODO Broken, needs fixing
    if (isIssuesPage()) {
        return;

        const listOfIssues = document.querySelectorAll("div.issue.list > li");
        if (listOfIssues.length === 0) {
            throw new Error("No issues found.");
        }

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
                createGiteaButton("Create")("Create branch")(copyNewBranchCmd);
            issue
                .querySelector("div")
                .insertAdjacentElement("afterend", createBranchBtn);

            const checkoutCommand = getCheckoutBranchCommand(branch);
            const checkoutCallback = copyToClipboard(checkoutCommand);
            const checkoutBranchBtn =
                createGiteaButton("Checkout")("Checkout branch")(checkoutCallback);

            issue
                .querySelector("div")
                .insertAdjacentElement("afterend", checkoutBranchBtn);
        });

        const smallBtnMenu = select(".small-menu-items.ui.compact.tiny.menu")("Failed to find small button menu.");
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
            const btn = createGiteaButton("Checkout")("Checkout branch")(copyCmd);

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
    return null !== document.querySelector('div[role="main"][aria-label="Issues"]')
}

/**
 * @returns {boolean} True if current page is a specific issue page
 */
function isIssuePage() {
    console.log("Checking for issue page...");
    return null !== document.querySelector('div[role="main"][aria-label^="#"]')
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
function createGiteaButton(displayText) {
    const btn = document.createElement("button");
    btn.innerText = displayText;
    btn.className = "ui small basic button";

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
    const branch = `issue/${issueNumber}`;
    const titleNoSymbols = issueName.replaceAll(/[^\w\s]/g, "").replaceAll(/_/g, "");
    const issueTitleKebabCase = titleNoSymbols
        .toLowerCase()
        .trim()
        .split(/\s+/) // Underscores slip through
        .join("-");

    return `${branch}-${issueTitleKebabCase}`;
}

/**
 * Wrapper around querySelector that throws if an element is not found.
 *
 * @param {string} cssSelector CSS selector string
 * @returns {function(string): HTMLElement}} Function that accepts a custom error message and returns the element if found.
 */
function select(cssSelector) {
    const elmt = document.querySelector(cssSelector);

    return (errorMsg) => {
        if (!elmt) {
            throw new Error(`${errorMsg} ("${cssSelector}")`);
        }

        return elmt;
    }
}

/**
 * @returns {string} Extracted issue title
 */
function findIssueTitle() {
    const mainElmt = select('div[role="main"]')("Failed to find main element.");
    const ariaLabelValue = getAttributeValue(mainElmt)('aria-label');

    const issueTitle = ariaLabelValue.replace(/#\d+ \- /, "");

    return issueTitle;
}

/**
 * @returns {string} Extracted issue number
 */
function findIssueNumber() {
    const mainElmt = select('div[role="main"]')("Failed to find main element.");
    const ariaLabelValue = getAttributeValue(mainElmt)('aria-label');

    const issueNumber = ariaLabelValue.match(/^#(\d+)/)[1];

    return issueNumber;
}

/**
 * @param {HTMLElement} elmt
 */
function getAttributeValue(elmt) {
    return (attributeName) => {
        const attrValue = elmt.getAttribute(attributeName);

        if (null === attrValue) {
            throw new Error(`Failed to find an [${attributeName}] attribute on the provided HTMLELement.`);
        }

        return attrValue;
    }
}
