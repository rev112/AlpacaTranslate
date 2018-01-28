/* globals fetch, browser, Handlebars */
'use strict';

const enableDebugOutput = true;
const enableTestData = false;
const dialogClass = 'transbox';
const transClass = 'trans-size';
const errorClass = 'err-size';
let externalImgUrl = 'src/icons/external_link.png';
let isShown = false;

// Allow the code to work both in the context of a webextension and a normal web-page
if (typeof browser !== 'undefined') {
  externalImgUrl = browser.extension.getURL(externalImgUrl);
}

const tooltipTemplate = `
<div class="trans-normalized">
  <span>{{normalized}}</span>
  <a target="_blank" href="{{url}}" title="Linguee">
    <img class="trans-link-original" src="{{externalImg}}" alt="external source"/>
  </a>
</div>
<div class="trans-list">
  {{#each translations}}
  <div class="trans-single-group">
    <span class="trans-single-term">{{transString}}</span>
    <span class="trans-desc" title="{{transDesc.title}}">{{transDesc.short}}</span>
  </div>
  {{/each}}
</div>
`;

const tooltipErrorTemplate = `
<div class="error-tooltip">
  <span>No translation block found</span>
</div>
`;


function log_debug(...args) {
  if (enableDebugOutput) {
    console.log(...args);
  }
}


function hideTooltip() {
  log_debug('Hiding result tooltip...');
  const elems = document.getElementsByClassName(dialogClass);
  for (let i = 0; i < elems.length; i++) {
    elems[i].remove();
  }
  isShown = false;
}


function showResults(results, e) {
  log_debug('Showing result tooltip...');
  const x = e.pageX;
  const y = e.pageY;
  results.externalImg = externalImgUrl;
  const elem = document.createElement('div');
  const template = Handlebars.compile(tooltipTemplate);
  elem.innerHTML = template(results);
  elem.classList.add(dialogClass);
  elem.classList.add(transClass);
  elem.style.left = x + 10 + 'px';
  elem.style.top = y + 10 + 'px';
  document.body.appendChild(elem);
  isShown = true;
}

function showTranslationError(e){
  log_debug('Showing error tooltip...');  
  const x = e.pageX;
  const y = e.pageY;
  const elem = document.createElement('div');
  const template = Handlebars.compile(tooltipErrorTemplate);
  elem.innerHTML = template();
  elem.classList.add(dialogClass);
  elem.classList.add(errorClass);
  elem.style.left = x + 10 + 'px';
  elem.style.top = y + 10 + 'px';
  document.body.appendChild(elem);
  isShown = true; 
}


function getTestData() {
  const results = {
    'original':'characters',
    'normalized':'characters',
    'translations': [
      {'transString':'символы','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'персонажи','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'герои','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'знаки','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'героини','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'личности','transDesc':{'short':'pl','title':'noun, plural'}}
    ],
    'url':'https://www.linguee.com/english-russian/search?query=characters'
  };
  return results;
}


function showTooltip(text, e) {
  if (enableTestData) {
    let results = getTestData();
    showResults(results, e);
    return;
  }

  const url = 'https://www.linguee.com/english-russian/search?query=' + text;
  fetch(url)
    .then((response) => response.text())
    .then((body) => {
      let el = document.createElement('html');
      el.innerHTML = body;
      let exact_match_block = el.getElementsByClassName('lemma featured')[0];
      if (!exact_match_block) {
        log_debug('No translation block found');
        showTranslationError(e);
        return;
      }
      let translation_blocks = Array.from(exact_match_block.getElementsByClassName('tag_trans'));
      let translations = translation_blocks.map((tr) => {
        let text = tr.getElementsByClassName('dictLink')[0].text;
        let type = tr.getElementsByClassName('tag_type')[0].textContent;
        let type_desc = tr.getElementsByClassName('tag_type')[0].title;
        return {
          transString: text,
          transDesc: {
            short: type,
            title: type_desc
          }
        };
      });

      let normalized_block = exact_match_block.getElementsByClassName('line lemma_desc')[0];
      let normalized = normalized_block.getElementsByClassName('dictLink')[0].text;
      let results = {
        'original': text,
        'normalized': normalized,
        'translations': translations,
        'url': url
      };
      log_debug('Results:', JSON.stringify(results));
      showResults(results, e);
    });
}


function isClickOnTooltip(e) {
  let node = e.originalTarget;
  while (node) {
    if (node.classList.contains(dialogClass)) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}


document.addEventListener('click', (e) => {
  if (isShown && !isClickOnTooltip(e)) {
    hideTooltip();
  }
});


document.addEventListener('dblclick', (e) => {
  if (isClickOnTooltip(e)) {
    return;
  }

  const selObj = window.getSelection().toString();
  const withShift = e.shiftKey;
  log_debug('Double click, with SHIFT: ', withShift);

  if (!withShift || selObj.length > 100) {
    return;
  }

  log_debug('Selected text: ' + selObj);

  if (isShown) {
    hideTooltip();
  }
  showTooltip(selObj, e);
});

log_debug('Extension is loaded');
