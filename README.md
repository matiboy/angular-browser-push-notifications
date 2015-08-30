# Angular browser push notifications
Enable browser push notifications using Angular

## Install

```
 $ bower install angular-browser-push-notifications
```

## Pre-requisites

- If you are not running on `localhost`, you must run this on a HTTPS domain verified in [Google developer console](https://console.developers.google.com)
- If you are using https, you must ensure that the certificate is fully trusted
- You must have a `manifest.json` file referenced in your HTML as follows
``` <link rel="manifest" href="manifest.json"> ```
- You need a service worker available *at the root* of your site. See [examples](./examples) for sample manifest and service workers
- Refer to [this article](https://developers.google.com/web/updates/2015/03/push-notificatons-on-the-open-web) for more information on Chrome push notifications

## How to use

- Add `browserPushNotifications` to the list of dependencies of you Angular app
- Dependency inject the `BrowserPushNotifications` service
- Optionally inject the `BrowserPushNotificationsStatus` value to handle rejection reasons
- Call `BrowserPushNotifications.register()` which returns a promise

## API

### BrowserPushNotifications.register

Returns a promise which resolves with a subscription object looking like this:

```json
{
  "endpoint":"https://android.googleapis.com/gcm/send/APA91bGOYel46xxxxxx_xxxxxxx…",
  "subscriptionId":"APA91bGOYel46xxxxxx_xxxxxxx…"
}
```
*Note* that `subscriptionId` is deprecated in Chrome 45

The promise can reject with any of the statuses in `BrowserPushNotificationsStatus`

### BrowserPushNotifications.getSubscription

Returns a promise which resolves with a subscription id only

### BrowserPushNotificationsStatus

Possible reasons for failure:

- WORKERS_NOT_SUPPORTED: Workers not supported by the browser
- NOTIFICATIONS_NOT_SUPPORTED: Notifications not supported by the browser
- PUSH_NOT_SUPPORTED: Push not supported by the browser
- USER_BLOCKED_NOTIFICATIONS: The user has set notifications to "Disallowed"
- WORKER_REGISTRATION_FAIL: Worker registration failed, usually related to invalid certificate
- FAILED_TO_SUBSCRIBE: Subscription failed, could be related to certificate or to your application key

## Configuration methods

### BrowserPushNotificationsProvider.setWorkerUrl

Set the url for the service worker which will be registered

## Sample code

```js
angular.module('notificationsApp', ['browserPushNotifications'])
  .controller('StatusController', function($scope, BrowserPushNotifications){
    $scope.status = 'Pending';
    BrowserPushNotifications.getSubscriptionId().then(function(id) {
      $scope.status = id;
    }, function(err) {
      $scope.status = 'Error ' + err;
    });
  });
```

## Demo

[Demo site](https://www.redapesolutions.com/pushnotifications)



