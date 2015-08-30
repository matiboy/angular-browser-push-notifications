'use strict';

self.addEventListener('push', function(event) {
  console.log('Received a push message', event);
  var title = 'Anacondapp';
  var icon = '/images/icon-192x192.png';
  var tag = 'anacondapp'+Date.now();

  var notificationPromise = event.currentTarget.registration.pushManager.getSubscription().then(function(sub) {
        var id = sub.endpoint.split('/').pop();
        return fetch('/communications/details?token='+id);
      }).then(function(response){
        return response.text();
      }).then(function(body) {
        return self.registration.showNotification(title, {
          body: body,
          icon: icon,
          tag: tag
        });
      });

  event.waitUntil(notificationPromise);

  // Close after 5 seconds if still there - more browser like than mobile phone
  notificationPromise.then(function() {
    return new Promise(function(resolve){
      setTimeout(resolve, 5000)
    });
  }).then(function() {
    return event.currentTarget.registration.getNotifications();
  }).then(function(notifications) {
    for(var i=0;i<notifications.length;i++){
      var notification = notifications[i];
      if(notification.tag === tag){
        notification.close();
        break;
      }
    }
  });
});


self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url == '/' && 'focus' in client)
        return client.focus();
    }
    if (clients.openWindow)
      return clients.openWindow('/');
  }));

});
