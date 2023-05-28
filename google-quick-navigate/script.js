// ==UserScript==
// @name         Google Quick Navigate
// @version      1.0.0
// @description  Allows pressing the number keys 1 - 9 to quickly navigate to that link on the Google search results page
// @author       brabli
// @match        https://www.google.com/search?q=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// ==/UserScript==

(function() {
    'use strict'

    const resultHeaders = findResultHeaders();

    for (const [i, header] of resultHeaders.entries()) {
        addNumberToStartOfText(header, i);
        addQuickNavDataAttribute(header, i);
    }

    document.addEventListener('keypress', e => {
        if (isTargetingDocumentBody(e) && isPressedKeyDigit(e)) {
            const header = findCorrespondingHeader(e);
            underline(header);
            findLink(header).click();
        }
    });
})();

function findResultHeaders() {
    const allResultHeaders = findAllResultHeaders();
    const visibleHeaders = removeHiddenElements(allResultHeaders);
    return limitToNineElements(visibleHeaders);
}

function findAllResultHeaders() {
    return Array.from(document.querySelectorAll('.g h3'));
}

function removeHiddenElements(elements) {
    return elements.filter(h => isElementVisible(h))
}

function isElementVisible(el) {
    return el.offsetParent !== null;
}

function limitToNineElements(elements) {
    return elements.slice(0, 9);
}

function addNumberToStartOfText(header, i) {
    header.textContent = `${i + 1}. ${header.textContent}`;
}

function addQuickNavDataAttribute(header, i) {
    header.dataset.quickNav = i + 1;
}

function isTargetingDocumentBody(e) {
    return 'BODY' === e.target.tagName;
}

function isPressedKeyDigit(e) {
    return e.code.match(/Digit/);
}

function findCorrespondingHeader(e) {
    return document.querySelector(`[data-quick-nav="${e.key}"]`)
}

function underline(header) {
    header.style.textDecoration = 'underline';
}

function findLink(header) {
    return header.closest('a');
}
