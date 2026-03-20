import { registerRootComponent } from 'expo';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { scheduleAllLunarNotifications } from './src/utils/lunarNotifications';
import { BACKGROUND_NOTIFICATION_TASK } from './src/constants/tasks';

import App from './App';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    await scheduleAllLunarNotifications();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

registerRootComponent(App);
