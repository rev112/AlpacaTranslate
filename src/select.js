/* globals fetch */
'use strict';

const isDebug = true;
const dialogClass = 'transbox';
let isShown = false;


function log_debug(msg) {
  if (isDebug) {
    console.log(msg);
  }
}


function hideTooltip() {
  const elems = document.getElementsByClassName(dialogClass);
  for (let i = 0; i < elems.length; i++) {
    elems[i].remove();
  }
  isShown = false;
}


function showResults(results, e) {
  log_debug('Showing result tooltip...');
  const x = e.clientX;
  const y = e.clientY;
  log_debug({x: x, y: y});

  const elem = document.createElement('div');
  elem.innerHTML = JSON.stringify(results);
  elem.classList.add(dialogClass);
  elem.style.left = x + 10 + 'px';
  elem.style.top = y + 10 + 'px';

  document.body.appendChild(elem);
  isShown = true;
}


function showTooltip(text, e) {
  const url = 'https://www.linguee.com/english-russian/search?source=auto&query=' + text;
  fetch(url).then((response) => {
    response.text().then((body) => {
      let el = document.createElement('html');
      el.innerHTML = body;
      let exact_match_block = el.getElementsByClassName('lemma featured')[0];
      if (!exact_match_block) {
        log_debug('No translation block found');
        return;
      }
      let translation_blocks = Array.from(exact_match_block.getElementsByClassName('tag_trans'));
      let translations = translation_blocks.map((tr) => {
        let text = tr.getElementsByClassName('dictLink')[0].text;
        let type = tr.getElementsByClassName('tag_type')[0].textContent;
        let type_desc = tr.getElementsByClassName('tag_type')[0].title;
        return [text, [type, type_desc]];
      });

      let normalized_block = exact_match_block.getElementsByClassName('line lemma_desc')[0];
      let normalized = normalized_block.getElementsByClassName('dictLink')[0].text;
      let results = {
        'original': text,
        'normalized': normalized,
        'translations': translations
      };
      log_debug(results);
      showResults(results, e);
    });
  });
}


document.addEventListener('click', () => {
  if (isShown) {
    hideTooltip();
  }
});

document.addEventListener('dblclick', (e) => {
  const selObj = window.getSelection().toString();
  const withShift = e.shiftKey;
  console.info('Double click, with SHIFT: ', withShift);

  if (!withShift || selObj.length > 100) {
    return;
  }

  log_debug('Selected: ', selObj);

  if (isShown) {
    hideTooltip();
  }
  showTooltip(selObj, e);
});

log_debug('Extension is loaded');
