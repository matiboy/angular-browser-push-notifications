angular.module('browserPushNotifications', [])
  .provider('BrowserPushNotifications', function() {
    // Default values
    var workerUrl = '/service-worker.js';
    var userVisibleOnly = true;

    // Config methods
    this.setWorkerUrl = function(u) {
      workerUrl = u;
    }

    this.setUserVisibleOnly = function(direction) {
      userVisibleOnly = direction;
    }

    this.$get = ['$q', '$log', 'BrowserPushNotificationsStatus', '$rootScope', function($q, $log, BrowserPushNotificationsStatus, $rootScope) {
      // All methods starting with an "_" are using ES6 promises and not Angular promises
      var service = {
        _getPermissions: function() {
          return Notification.permission === 'denied' ? Promise.reject(BrowserPushNotificationsStatus.USER_BLOCKED_NOTIFICATIONS) : Promise.resolve(Notification.permission);
        },
        _getServiceWorkerRegistration: function() {
          return navigator.serviceWorker.ready.catch(function() {
            return Promise.reject(BrowserPushNotificationsStatus.WORKER_REGISTRATION_FAIL);
          });
        },
        _getSubscription: function(serviceWorkerRegistration) {
          return serviceWorkerRegistration.pushManager.getSubscription().then(function(sub) {
            if(!sub) {
              return serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: userVisibleOnly});
            }
            $log.debug('Subscription found!');
            return sub;
          }).catch(function(err) {
            $log.debug(err);
            return Promise.reject(BrowserPushNotificationsStatus.FAILED_TO_SUBSCRIBE);
          });
        },
        _notificationsSupported: function() {
          return 'showNotification' in ServiceWorkerRegistration.prototype ? Promise.resolve() : Promise.reject(BrowserPushNotificationsStatus.NOTIFICATIONS_NOT_SUPPORTED);
        },
        _pushMessagingSupported: function() {
          return 'PushManager' in window ? Promise.resolve() : Promise.reject(BrowserPushNotificationsStatus.PUSH_NOT_SUPPORTED);
        },
        register: function() {
          var q = $q.defer();
          service._workersSupported().then(function() {
            $log.debug('Workers are supported');
            return service._registerWorker();
          }).then(function() {
            $log.debug('Worker has been registered');
            return service._notificationsSupported();
          }).then(function() {
            $log.debug('Notifications are supported');
            return service._pushMessagingSupported();
          }).then(function() {
            $log.debug('Push is supported');
            return service._getPermissions();
          }).then(function(permission) {
            $log.debug('Permission: ', permission);
            return service._getServiceWorkerRegistration();
          }).then(function(serviceWorkerRegistration) {
            $log.debug('Service registration: ', serviceWorkerRegistration);
            return service._getSubscription(serviceWorkerRegistration);
          }).then(function(subscription) {
            $rootScope.$apply(q.resolve.bind(q, subscription));
          }).catch(function(errorCode) {
            $rootScope.$apply(q.reject.bind(q, errorCode));
          });
          return q.promise;
        },
        getSubscriptionId: function() {
          return service.register().then(function(sub){
            // 'PushSubscription.subscriptionId' is deprecated and is now included in 'PushSubscription.endpoint'. It will be removed in Chrome 45, around August 2015.
            if(sub.subscriptionId) {
              return sub.subscriptionId;
            }
            return sub.endpoint.split('/').pop();
          });
        },
        _registerWorker: function() {
          // Check that it's at the root
          if(workerUrl.lastIndexOf('/') > 0) {
            $log.warn('Worker url should be at the root of the domain');
          }
          return navigator.serviceWorker.register(workerUrl);
        },
        _workersSupported: function() {
          return 'serviceWorker' in navigator ? Promise.resolve() : Promise.reject(BrowserPushNotificationsStatus.WORKERS_NOT_SUPPORTED);
        }
      };

      return service;
    }];
  }
).value('BrowserPushNotificationsStatus', {
  WORKERS_NOT_SUPPORTED: 'workers_not_supported',
  NOTIFICATIONS_NOT_SUPPORTED: 'notifications_not_supported',
  PUSH_NOT_SUPPORTED: 'push_not_supported',
  USER_BLOCKED_NOTIFICATIONS: 'user_blocked_notifications',
  WORKER_REGISTRATION_FAIL: 'worker_registration_fail',
  FAILED_TO_SUBSCRIBE: 'failed_to_subscribe'
});
