// VS Code stamps its active theme onto <body> as a class. The shared stylesheet
// keys dark mode off a `.dark` class on <html>, so mirror one onto the other
// and keep following it when the user switches themes.
export function syncVscodeTheme(): () => void {
  const apply = () => {
    const { classList } = document.body;
    const dark = classList.contains('vscode-dark')
      || classList.contains('vscode-high-contrast');
    document.documentElement.classList.toggle('dark', dark);
  };

  apply();
  const observer = new MutationObserver(apply);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}
