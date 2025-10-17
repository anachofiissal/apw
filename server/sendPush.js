const webpush = require('web-push');

const publicVapidKey = 'BPZf7O-25BUFwch65YM45zLHZr-u6I8xOLeR0PFIOZVKbfGR1w_t29vG3UQdcnolp_LXDMry54aoACDOMpV_Jzw';
const privateVapidKey = 'TzxWPpJYrQRStIGfm21VxYQL6xRtpSRVOvHHdxgmQ88';

webpush.setVapidDetails(
  'https://apw-sigma.vercel.app',
  publicVapidKey,
  privateVapidKey
);

const subscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/cQ0MC8ESZrk:APA91bGaI6x5MOAdj3dWr9ha2wJyPctg1UswiRTWmuTO1VK2_a86gxTyuIruHm1_-A3DyLCUBO61TM6jNXXcA8WzDy41d848GD1XSiAnrLMW7nkV6FHrVIP06T-gzqsrXeTfK0KzZ27g",
  keys: {
    p256dh: "BPZf7O-25BUFwch65YM45zLHZr-u6I8xOLeR0PFIOZVKbfGR1w_t29vG3UQdcnolp_LXDMry54aoACDOMpV_Jzw",
    auth: "TzxWPpJYrQRStIGfm21VxYQL6xRtpSRVOvHHdxgmQ88"
  }
};

webpush.sendNotification(subscription, JSON.stringify({
  title: 'Hola!',
  body: 'Esta es una notificación de prueba',
  icon: '/images/icons/icon-192.png'
}))
.then(() => console.log('Notificación enviada ✅'))
.catch(err => console.error(err));
