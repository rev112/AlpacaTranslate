/* globals fetch */
'use strict';

console.info('Extension is loaded');

let isShown = false;
const dialogId = 'select_tooltip_dialog';

function renderTooltipMarkup(transDict) {
  return document.createElement('div');
}


function showTooltip(text) {
  const elem = document.createElement('div');
  elem.id = dialogId;
  elem.innerHTML = text;
  document.body.appendChild(elem);
  isShown = true;

  const url = 'https://www.linguee.com/english-russian/search?source=auto&query=' + text;
  fetch(url).then((response) => {
    response.text().then((body) => {
      let el = document.createElement('html');
      el.innerHTML = body;
      let exact_match_block = el.getElementsByClassName('lemma featured')[0];
      if (!exact_match_block) {
        console.log('No translation block found');
        return;
      }
      let translations = Array.from(exact_match_block.getElementsByClassName('tag_trans'));
      let results = translations.map((tr) => {
        let text = tr.getElementsByClassName('dictLink')[0].text;
        let type = tr.getElementsByClassName('tag_type')[0].textContent;
        let type_desc = tr.getElementsByClassName('tag_type')[0].title;
        return [text, [type, type_desc]];
      });
      console.log(results);
    });
  });
}


function hideTooltip() {
  const elems = document.querySelectorAll('#' + dialogId);
  for (let i = 0; i < elems.length; i++) {
    elems[i].remove();
  }

  isShown = false;
}


document.addEventListener('dblclick', (e) => {
  const selObj = window.getSelection().toString();
  const withShift = e.shiftKey;
  console.info('Double click, with SHIFT: ', withShift);

  if (!withShift || selObj.length > 100) {
    return;
  }

  console.info('Selected: ', selObj);

  if (isShown) {
    hideTooltip();
  }
  showTooltip(selObj);
});


document.addEventListener('dblclick', (e) => {
  const x = e.offsetX;
  const y = e.offsetY;
  let el = document.getElementsByClassName('transbox')[0];
  el.style.display = 'block';
  el.style.left = x + 10 + 'px';
  el.style.top = y + 10 + 'px';
  console.log({ x: x, y: y});
});
