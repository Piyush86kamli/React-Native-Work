import {Platform} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';

interface Props {
  id: string;
  autoCancel: boolean;
  largeIcon: string;
  smallIcon: string;
  bigText: string;
  subText: string;
  vibrate: boolean;
  vibration: number;
  priority: string;
  importance: string;
  playSound: boolean;
  soundName: string;
  largeIconUrl: string;
  data: any;
}
class LocalPushNotification {
  configure = (onOpenNotification) => {
    PushNotification.configure({
      onRegister: function (token) {
        //console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        //console.log('NOTIFICATION:', notification);
        // if (!notification?.data) return;
        // notification.userInteraction = true;
        // onOpenNotification(
        //   Platform.OS === 'ios' ? notification.data.item : notification.data,
        // );
        // if (Platform.OS === 'ios')
        //   notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      onAction: function (notification) {
        //console.log('ACTION:', notification);
      },
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
    PushNotification.createChannel(
      {
        channelId: 'ems_medic_channel',
        channelName: 'My channel',
        channelDescription: 'A channel to categorise your notifications',
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => {},
    );
  };
  unRegister = () => {
    PushNotification.unregister();
  };
  showNotification = (
    id,
    title,
    message,
    data = {},
    option: Partial<Props>,
  ) => {
    PushNotification.localNotification({
      ...this.buildAndriodNotification(id, title, message, (data = {}), option),
      ...this.buildIOSNotification(id, title, message, (data = {}), option),
      channelId: 'ems_medic_channel',
      title: title || '', // (optional)
      message: message || '', // (required)
      playSound: option.playSound || true, // (optional) default: true
      soundName: option.soundName || 'default',
    });
  };
  buildAndriodNotification = (id, title, message, data = {}, option) => {
    return {
      id: id,
      autoCancel: true,
      largeIcon: option.largeIcon || 'ic_launcher',
      smallIcon: option.smallIcon || 'ic_notification',
      largeIconUrl: option.largeIconUrl || '',
      bigText: message || '', // (optional) default: "message" prop
      subText: title || '',
      vibrate: option.vibrate || true,
      vibration: option.vibration || 300,
      priority: option.priority || 'high', // (optional) set notification priority, default: high
      importance: option.importance || 'high',
      data: data,
    };
  };
  buildIOSNotification = (id, title, message, data = {}, option) => {
    return {
      alertAction: option.alertAction || 'view',
      category: option.category || '',
      userInfo: {
        id: id,
        item: data,
      },
    };
  };
  cancelAllLocalNotification = () => {
    PushNotification.cancelAllLocalNotifications();
  };
}

export const localPushNotification = new LocalPushNotification();
