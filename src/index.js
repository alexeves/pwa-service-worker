if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service_worker.js')
      .then(registration =>  console.log('SW registered: ', registration))
      .catch(error => console.log('SW registration failed: ', error));
  });

  setTimeout(() => {
    const img = new Image();
    img.src = '/dog.svg';
    document.body.appendChild(img);
  }, 3000);
}
