function updatePreview(){
  var header = (document.getElementById('input-header')||{}).value || '';
  var raw = (document.getElementById('input-body')||{}).value || '';
  var footer = (document.getElementById('input-footer')||{}).value || '';
  var empty = document.getElementById('wa-empty');
  var chat = document.getElementById('wa-chat');
  var bubbleText = document.getElementById('wa-bubble-text');
  var time = document.getElementById('wa-time');
  var floating = document.getElementById('preview-floating');
  var headerEl = document.getElementById('wa-header-text');
  var footerEl = document.getElementById('wa-footer-text');
  var buttonsEl = document.getElementById('wa-buttons');

  var hasContent = raw.trim().length > 0;

  if (!hasContent) {
    empty.style.display = 'flex';
    chat.style.display = 'none';
    if (floating) floating.classList.add('hidden');
    return;
  }
  empty.style.display = 'none';
  chat.style.display = 'block';
  if (floating) floating.classList.remove('hidden');

  var displayText = raw;
  var vars = raw.match(/\{\{(\d+)\}\}/g);
  if (vars) {
    var nums = [...new Set(vars.map(function(v){ return parseInt(v.match(/\d+/)[0], 10); }))];
    nums.forEach(function(n){
      var inp = document.getElementById('var-'+n);
      var val = inp ? inp.value.trim() : '';
      if (val) displayText = displayText.replace(new RegExp('\\{\\{'+n+'\\}\\}', 'g'), val);
    });
  }
  var highlighted = displayText.replace(/\{\{(\d+)\}\}/g, '<span class="wa-variable">{{$1}}</span>');
  highlighted = highlighted.replace(/\{\{(texto|valor|data|numero|four_digit_number|amount|order_number|tracking_ID|date|store)\}\}/g, '<span class="wa-variable">{{$1}}</span>');
  highlighted = highlighted.replace(/\n/g, '<br>');
  bubbleText.innerHTML = highlighted;

  var now = new Date();
  time.textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  if (headerEl) {
    if (header.trim()) {
      headerEl.textContent = header;
      headerEl.classList.remove('hidden');
    } else {
      headerEl.classList.add('hidden');
    }
  }

  if (footerEl) {
    if (footer.trim()) {
      footerEl.textContent = footer;
      footerEl.classList.remove('hidden');
    } else {
      footerEl.classList.add('hidden');
    }
  }

  if (buttonsEl) {
    var btns = window.buttons || [];
    if (btns.length) {
      var btnHtml = '<div class="wa-btn-divider"></div>';
      btns.forEach(function(b, i){
        btnHtml += '<div class="wa-btn-row">';
        var icon = '';
        if (b.type === 'URL') icon = '<svg class="wa-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>';
        else if (b.type === 'PHONE_NUMBER') icon = '<svg class="wa-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>';
        else if (b.type === 'COPY_CODE') icon = '<svg class="wa-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>';
        else icon = '';
        btnHtml += icon;
        btnHtml += '<span class="wa-btn-text">'+(b.text||'Botao '+(i+1))+'</span>';
        btnHtml += '</div>';
      });
      buttonsEl.innerHTML = btnHtml;
      buttonsEl.classList.remove('hidden');
    } else {
      buttonsEl.classList.add('hidden');
    }
  }
}
