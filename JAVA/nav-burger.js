(function () {
  var burger = document.querySelector('.nav-burger');
  var nav = document.querySelector('.nav-bar');
  var links = document.querySelectorAll('.nav-links-container a');

  if (!burger || !nav) return;

  function close() {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation menu');
  }

  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = nav.classList.contains('is-open');
    if (isOpen) {
      close();
    } else {
      nav.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close navigation menu');
    }
  });

  links.forEach(function (link) {
    link.addEventListener('click', close);
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) {
      close();
    }
  });
})();
