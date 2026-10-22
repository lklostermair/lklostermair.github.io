(() => {
  // Public site token from Cloudflare Web Analytics > Manage site (not an API key).
  // Leave empty to disable analytics until the dashboard has been configured.
  const siteToken = '';
  const productionHosts = ['lukasklostermair.com', 'www.lukasklostermair.com'];

  if (!siteToken || !productionHosts.includes(window.location.hostname)) return;
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;

  const beacon = document.createElement('script');
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.defer = true;
  beacon.dataset.cfBeacon = JSON.stringify({ token: siteToken });
  document.head.appendChild(beacon);
})();
