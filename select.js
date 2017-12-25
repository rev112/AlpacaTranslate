console.info("Extension is loaded");

var isShown = false;
const dialogId = 'select_tooltip_dialog';

function showTooltip(text) {
  const elem = document.createElement('div');
  elem.id = dialogId;
  elem.innerHTML = text;
  document.body.appendChild(elem);
  isShown = true; 

  const url = "https://www.linguee.com/english-russian/search?source=auto&query=" + text;
  fetch(url).then((response) => {
    response.text().then((body) => {
      var el = document.createElement('html');
      el.innerHTML = body;
      console.log(el);
    });
  });
}


function hideTooltip() {
  const elems = document.querySelectorAll("#" + dialogId);
  for (var i = 0; i < elems.length; i++) {
    elems[i].remove(); 
  }

  isShown = false;
}


document.addEventListener("dblclick", (e) => {
  const selObj = window.getSelection().toString();
  const withShift = e.shiftKey;
  console.info("Double click, with SHIFT: ", withShift); 

  if (!withShift || selObj.length > 100) {
    return;
  }

  console.info("Selected: ", selObj);

  if (isShown) {
    hideTooltip();
  }
  showTooltip(selObj);
});
