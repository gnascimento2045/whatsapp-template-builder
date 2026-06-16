(function(){
  var stored = localStorage.getItem('mt_memory');
  window.MEMORY = stored ? JSON.parse(stored) : [];
  function persist(){ localStorage.setItem('mt_memory', JSON.stringify(window.MEMORY)); }
  window.saveMemory = persist;

  window.addToMemory = function(body, category, score, mode){
    var entry = { id:'tpl_'+Date.now(), body:body, category:category, score:score, mode:mode, saved_at:new Date().toISOString() };
    window.MEMORY.push(entry);
    persist();
    showToast('Salvo na memoria como '+category);
    renderMemory();
  };

  window.removeFromMemory = function(id){
    window.MEMORY = window.MEMORY.filter(function(e){ return e.id !== id; });
    persist();
    renderMemory();
  };

  window.clearMemoryAll = function(){
    if (window.MEMORY.length === 0) return;
    if (!confirm('Limpar todos os templates da memoria?')) return;
    window.MEMORY = [];
    persist();
    renderMemory();
    showToast('Memoria limpa');
  };

  window.exportMemoryJSON = function(){
    if (!window.MEMORY.length) { showToast('Memoria vazia'); return; }
    var a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(window.MEMORY, null, 2));
    a.download = 'memoria_templates_aprovados.json';
    a.click();
    showToast('JSON exportado');
  };

  window.importMemoryJSON = function(e){
    var reader = new FileReader();
    reader.onload = function(e){
      try {
        var data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) throw new Error('Invalido');
        window.MEMORY = data;
        persist();
        renderMemory();
        showToast(data.length+' template(s) importados');
      } catch(err) { showToast('Arquivo JSON invalido'); }
    };
    reader.readAsText(e.target.files[0]);
  };
})();

function renderMemory(){
  var container = document.getElementById('memory-list');
  var search = document.getElementById('memory-search').value.toLowerCase();

  if (!window.MEMORY.length){
    container.innerHTML = '<div class="empty-state"><h3>Nenhum template salvo</h3><p class="text-xs mt-1">Apos validar, clique em "Aprovado como UTILITY" ou "Aprovado como MARKETING"</p></div>';
    return;
  }

  var filtered = window.MEMORY.filter(function(e){ return e.body.toLowerCase().includes(search) || e.category.toLowerCase().includes(search); });
  if (!filtered.length){
    container.innerHTML = '<div class="empty-state"><h3>Nenhum resultado</h3></div>';
    return;
  }

  var html = '';
  filtered.forEach(function(e){
    var date = new Date(e.saved_at).toLocaleString('pt-BR');
    html += '<div class="mem-item">';
    html += '<div class="flex items-center gap-2 mb-1"><span class="text-[10px] font-bold px-1.5 py-0.5 rounded '+(e.category==='UTILITY'?'bg-[#e8f9f2] text-[#00a884]':'bg-[#fde8e8] text-[#ef5350]')+'">'+e.category+'</span><span class="text-[10px] text-[#8696a0]">score '+e.score+'</span><span class="text-[10px] text-[#8696a0]">'+date+'</span></div>';
    html += '<div class="mem-body text-xs">'+e.body+'</div>';
    html += '<button class="text-[10px] text-[#ef5350] hover:underline mt-0.5" onclick="removeFromMemory(\''+e.id+'\')">Remover</button>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function exportMemory(){ exportMemoryJSON(); }
function importMemory(e){ importMemoryJSON(e); }
function clearMemory(){ clearMemoryAll(); }
