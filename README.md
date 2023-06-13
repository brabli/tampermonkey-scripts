# Tampermonkey Scripts

Some of my personal Tampermonkey scripts.

## Installation

After installing [Tampermonkey](https://www.tampermonkey.net/), navigate to the dashbaord, click on the `Utilities` tab and paste the **raw** script URL into the `Import from URL` box. EG: https://raw.githubusercontent.com/brabli/tampermonkey-scripts/main/youtube-shorts-hider/script.js

## My Workflow

My workflow for writing new scripts is to add a new script in my Tampermonkey dashboard with just the required header comment. The header will contain a `@require` tag pointing to the local file I am working on, so I can get instant feedback. Once it's reached a 1.0.0 state I'll push it with the version set, and install it by pasting the GitHub raw file URL into the `Import from URL` box.

An example header looks like:
```js
// ==UserScript==
// @name         Dev Script
// @require      file:///local/path/to/script.js
// @version      0.1.0
// @description  Development script
// @author       brabli
// @match        https://some/site
// @source       https://github.com/brabli/tampermonkey-scripts
// ==/UserScript==
```