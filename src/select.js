/* globals fetch, browser, Handlebars */
'use strict';

let enableTestData = false;
const enableDebugOutput = true;
const dialogClass = 'transbox';
const transClass = 'trans-size';
const errorClass = 'err-size';
let externalImgUrl = 'src/icons/external_link.png';
let soundImgUrl = 'src/icons/sound.svg';
let isShown = false;

// Allow the code to work both in the context of a webextension and a normal web-page
if (typeof browser !== 'undefined') {
  externalImgUrl = browser.extension.getURL(externalImgUrl);
  soundImgUrl = browser.extension.getURL(soundImgUrl);
}

const tooltipTemplate = `
<div class="trans-normalized">
  <div class="trans-first-line">
    <span>{{normalized}}</span>
    <span onclick="document.getElementById('trans-audio').play(); return false">
      <img style="height:1em" src="{{soundImg}}"/>
    </span>
    <span class="trans-desc">{{wordtype}}</span>
  </div>
  <a target="_blank" href="{{url}}" title="Linguee">
    <img class="trans-link-original" src="{{externalImg}}" alt="external source"/>
  </a>
  <audio id="trans-audio" src="">
    No audio support
  </audio>
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

function prepareElem(e, additionalClass){
  const x = e.pageX;
  const y = e.pageY;
  const preparingElem = document.createElement('div');
  preparingElem.classList.add(dialogClass);
  preparingElem.classList.add(additionalClass);
  preparingElem.style.left = x + 10 + 'px';
  preparingElem.style.top = y + 10 + 'px';
  return preparingElem;
}

function showResults(results, e) {
  log_debug('Showing result tooltip...');
  const elem = prepareElem(e, transClass);
  const template = Handlebars.compile(tooltipTemplate);
  results.externalImg = externalImgUrl;
  results.soundImg = soundImgUrl;
  // FIXME ugly, move to a function?
  fetch(results.audio_url)
    .then((resp) => resp.blob())
    .then((blob)=>{
      let reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64_audio = reader.result;
        const el = elem.getElementsByClassName('audio')[0];
        el.src = base64_audio;
      };
    });
  elem.innerHTML = template(results);
  document.body.appendChild(elem);
  isShown = true;
}

function showTranslationError(e){
  log_debug('Showing error tooltip...');
  const elem = prepareElem(e, errorClass);
  const template = Handlebars.compile(tooltipErrorTemplate);
  elem.innerHTML = template();
  document.body.appendChild(elem);
  isShown = true;
}


function getTestData() {
  const results = {
    'original':'characters',
    'normalized':'characters',
    'wordtype':'noun, plural',
    'translations': [
      {'transString':'символы','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'персонажи','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'герои','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'знаки','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'героини','transDesc':{'short':'pl','title':'noun, plural'}},
      {'transString':'личности','transDesc':{'short':'pl','title':'noun, plural'}}
    ],
    'url':'https://www.linguee.com/english-russian/search?query=characters',
    'audio_url': 'https://www.linguee.com/mp3/EN_US/7d/7d97481b1fe66f4b51db90da7e794d9f-101.mp3'
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

      const normalized_block = exact_match_block.getElementsByClassName('line lemma_desc')[0];
      const normalized = normalized_block.getElementsByClassName('dictLink')[0].text;
      const normalized_wordtype = normalized_block.getElementsByClassName('tag_wordtype')[0].textContent;
      const audio_element = normalized_block.getElementsByClassName('audio')[0];
      const audio_url =
        audio_element
          ? 'https://www.linguee.com/mp3/' + audio_element.id + '.mp3'
          : undefined;
      let results = {
        'original': text,
        'normalized': normalized,
        'wordtype': normalized_wordtype,
        'translations': translations,
        'url': url,
        'audio_url': audio_url
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
