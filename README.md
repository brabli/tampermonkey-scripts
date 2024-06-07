# Tampermonkey Scripts

Some of my personal Tampermonkey scripts.

## Installation

After installing [Tampermonkey](https://www.tampermonkey.net/) you should navigate to the dashboard, click on the `Utilities` tab and paste the **raw** script URL into the `Import from URL` box.

An example of a raw script URL is "https://raw.githubusercontent.com/brabli/tampermonkey-scripts/main/gitea-extras/script.js".

## My Development Workflow

My workflow developing Tampermonkey scripts is to add a new script in my Tampermonkey dashboard with just the required header comment.

The header will contain a `@require` tag pointing to the local file I am working on, so I can get instant feedback.

Unfortunately due to an old [bug in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1266960), developing local Tampermonkey scripts in Firefox is not currently possible. It is possible in Chrome however, so I develop scripts using that at present. [Revelent GitHub issue here.](https://github.com/Tampermonkey/tampermonkey/issues/347)

Once it's reached a 1.0.0 state I'll push it with the version set, and install it by pasting the GitHub raw file URL into the `Import from URL` box.

An example header looks like this:
```js
// ==UserScript==
// @name         Dev Script
// @require      file:///local/absolute/path/to/script.js
// @version      0.1.0
// @description  Development script
// @author       brabli
// @match        https://some/site
// @source       https://github.com/brabli/tampermonkey-scripts
// ==/UserScript==
```
