// ==UserScript==
// @name         YouTube Shorts Hider
// @version      1.0.0
// @description  Removes YouTube shorts from my YouTube subscription list
// @author       brabli
// @match        https://www.youtube.com/feed/subscriptions
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function() {
    'use strict';

    findAndRemoveShorts();

    setInterval(() => {
        if (broswerTabIsVisible()) {
            findAndRemoveShorts();
        }
    }, 2000);
})();

function findAndRemoveShorts() {
    const shorts = findShorts();
    logNumberOfShorts(shorts);
    removeElements(shorts);
}

function findShorts() {
    const shortIcons = document.querySelectorAll('#overlays > [overlay-style="SHORTS"]');
    const shorts = Array.from(shortIcons).map(icon => icon.closest('ytd-grid-video-renderer'));

    return shorts;
}

function logNumberOfShorts(shorts) {
    if (0 !== shorts.length) {
        console.log(`Removing ${shorts.length} shorts...`);
    }
}

function removeElements(elements) {
    elements.forEach(ele => ele.remove());
}

function broswerTabIsVisible() {
    return document.visibilityState === 'visible';
}
