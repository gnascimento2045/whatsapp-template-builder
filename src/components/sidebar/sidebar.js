document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.sidebar-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.sidebar-btn').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('panel-'+btn.dataset.tab);
      panel.classList.add('active');
      if (btn.dataset.tab === 'library') renderLibrary();
      if (btn.dataset.tab === 'memory') renderMemory();
    });
  });
});
