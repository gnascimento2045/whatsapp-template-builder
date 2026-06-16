function showToast(text) {
  var el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  setTimeout(function () { el.classList.remove('show'); }, 2500);
}
