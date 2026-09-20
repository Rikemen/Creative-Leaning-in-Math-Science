// A new entry URL prevents an older cached game from wiring a newer HTML shell.
import('./game.js?v=20260916-beam-audio').catch(error => {
  console.error('Game startup failed', error);
  document.getElementById('boot-error').hidden=false;
});
