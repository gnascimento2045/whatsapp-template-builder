function renderLibrary(){
  var area = document.getElementById('lib-list');
  var html = '';
  REFERENCE.forEach(function(t){
    html += '<div class="lib-item cursor-pointer" onclick="previewGenerated(\''+t.body.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n')+'\')"><div class="flex-1 min-w-0">';
    html += '<div class="lib-name">'+t.name+'</div>';
    html += '<div class="lib-body">'+t.body+'</div>';
    html += '<div class="lib-reason">'+t.reason+'</div>';
    html += '<span class="lib-tag '+t.tag.toLowerCase()+'">'+t.tag+'</span>';
    html += '</div></div>';
  });
  area.innerHTML = html;
}
