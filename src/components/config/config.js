function saveApiConfig(){
  var url = document.getElementById('api-url-input').value.trim();
  var model = document.getElementById('api-model-input').value.trim();
  var key = document.getElementById('api-key-input').value.trim();

  if (url) localStorage.setItem('mt_api_url', url); else localStorage.removeItem('mt_api_url');
  if (model) localStorage.setItem('mt_api_model', model); else localStorage.removeItem('mt_api_model');
  if (key) localStorage.setItem('mt_api_key', key); else localStorage.removeItem('mt_api_key');
  showToast('Configuracao salva');

  var status = document.getElementById('config-status');
  status.textContent = 'Salvo';
  status.classList.remove('hidden');
  setTimeout(function(){ status.classList.add('hidden'); }, 3000);
}

(function loadConfig(){
  var url = localStorage.getItem('mt_api_url');
  if (url) document.getElementById('api-url-input').value = url;
  var model = localStorage.getItem('mt_api_model');
  if (model) document.getElementById('api-model-input').value = model;
  var key = localStorage.getItem('mt_api_key');
  if (key) document.getElementById('api-key-input').value = key;
})();
