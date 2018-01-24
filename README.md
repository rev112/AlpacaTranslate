# AlpacaTranslate
A browser plugin that displays word translations on double click and probably something else.

## Development

It is recommended to install ESLint. It can be done in a few (hehe) quick (hehehe) steps:

* Install NodeJS. We recommend NVM for this (https://github.com/creationix/nvm)
* Install Yarn package manager (https://yarnpkg.com/en/docs/install)
* (Finally!) install a bunch of packages: `yarn install`

## Loading the extension

### Firefox

It is highly recommended to check a short WebExtension tutorial from Mozilla first: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_first_WebExtension

In short:

"Open about:debugging in Firefox, click "Load Temporary Add-on" and select any file in your extension's directory:"

#### Cool way

Check `web-ext` tutorial: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext

So basically just run 

    make webext-run
    
...and it will open a new Firefox window with a plugin loaded, and will reload the extension automatically upon code changes.

## How to use

Hold "Shift" and double click on a word you want to translate. A popup with translations will appear in a second or two.
