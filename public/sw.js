self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action || 'open';
  const actionMap = {
    take: 'take',
    snooze: 'snooze',
    skip: 'skip',
    open: 'open'
  };

  const selected = actionMap[action] || 'open';
  const targetUrl = selected === 'open' ? '/patient/schedule' : `/patient/schedule?reminderAction=${selected}`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const appClient = clientsArr.find((client) => client.url.includes('/patient'));
      if (appClient) {
        appClient.navigate(targetUrl);
        return appClient.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
