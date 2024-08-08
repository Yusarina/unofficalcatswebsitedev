document.addEventListener('DOMContentLoaded', () => {
  const themeSelects = document.querySelectorAll('#theme-select, .mobile-theme-selector select');
  const themeStylesheet = document.createElement('link');
  themeStylesheet.rel = 'stylesheet';
  document.head.appendChild(themeStylesheet);

  window.setTheme = function(theme) {
      if (theme === 'default') {
          themeStylesheet.href = '';
      } else {
          themeStylesheet.href = `../css/themes/${theme}-theme.css`;
      }
      localStorage.setItem('selectedTheme', theme);
      
      // Update all theme selectors
      themeSelects.forEach(select => {
          const selectedOption = select.querySelector(`[data-theme="${theme}"]`);
          if (selectedOption) {
              selectedOption.selected = true;
          }
      });
  }

  themeSelects.forEach(select => {
      select.addEventListener('change', (e) => {
          setTheme(e.target.selectedOptions[0].getAttribute('data-theme'));
      });
  });

  // Load saved theme or set default theme
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
      setTheme(savedTheme);
  } else {
      setTheme('default');
  }
});
