// auth.js - Solo muestra la app. Clave en config.js
window.Auth = { apiKey: window.GEMINI_KEY || '' };
document.addEventListener('DOMContentLoaded', function () {
  var app = document.querySelector('.app');
  if (app) app.style.display = 'grid';
});
