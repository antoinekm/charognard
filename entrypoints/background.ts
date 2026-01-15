import { MessageType, type ExtensionMessage, type MessageResponse, type AutomationSettings } from '@/lib/types';
import { getAutomationSettings, getAutomationProgress } from '@/lib/storage/automation';

const ALARM_NAME = 'ig-automation';

export default defineBackground(() => {
  // Set up alarm on startup
  setupAlarm();

  // Listen for alarm events
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      runAutomation();
    }
  });

  // Relay messages from popup/content to background
  browser.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse: (response: MessageResponse) => void) => {
      handleMessage(message).then(sendResponse);
      return true; // Keep channel open for async response
    }
  );
});

async function setupAlarm(): Promise<void> {
  const settings = await getAutomationSettings();

  // Clear existing alarm
  await browser.alarms.clear(ALARM_NAME);

  if (!settings.enabled) {
    return;
  }

  // Check if there's an in-progress automation to resume
  const progress = await getAutomationProgress();
  if (progress && progress.completedFollowCount < progress.targetFollowCount) {
    console.log('[Charognard] In-progress automation detected, resuming...');
    await browser.alarms.create(ALARM_NAME, { delayInMinutes: 0.1 });
    return;
  }

  // Check if we missed today's automation and should run it now
  const shouldCatchUp = checkMissedAutomation(settings);
  if (shouldCatchUp) {
    console.log('[Charognard] Missed automation detected, running catch-up...');
    await browser.alarms.create(ALARM_NAME, { delayInMinutes: 0.1 });
    return;
  }

  const nextRun = calculateNextRunTime(settings);
  const delayInMinutes = Math.max(1, (nextRun - Date.now()) / 60000);

  await browser.alarms.create(ALARM_NAME, {
    delayInMinutes,
    // For weekly, we'll reschedule after each run
    // For daily, we can use periodInMinutes
    periodInMinutes: settings.frequency === 'Daily' ? 24 * 60 : undefined,
  });
}

function checkMissedAutomation(settings: AutomationSettings): boolean {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(settings.hour, settings.minute, 0, 0);

  // Check if scheduled time has passed today
  if (scheduledTime >= now) {
    return false; // Not yet time
  }

  // For weekly, also check if it's the right day
  if (settings.frequency === 'Weekly' && now.getDay() !== settings.dayOfWeek) {
    return false; // Not the right day
  }

  // Check if automation already ran today
  if (settings.lastRunAt) {
    const lastRun = new Date(settings.lastRunAt);
    const isSameDay =
      lastRun.getDate() === now.getDate() &&
      lastRun.getMonth() === now.getMonth() &&
      lastRun.getFullYear() === now.getFullYear();

    if (isSameDay) {
      return false; // Already ran today
    }
  }

  // Scheduled time passed, correct day (for weekly), and hasn't run today
  return true;
}

function calculateNextRunTime(settings: AutomationSettings): number {
  const now = new Date();
  const target = new Date();

  target.setHours(settings.hour, settings.minute, 0, 0);

  if (settings.frequency === 'Weekly') {
    // Set to the correct day of week
    const currentDay = now.getDay();
    const targetDay = settings.dayOfWeek;
    let daysUntil = targetDay - currentDay;

    if (daysUntil < 0 || (daysUntil === 0 && target <= now)) {
      daysUntil += 7;
    }

    target.setDate(target.getDate() + daysUntil);
  } else {
    // Daily - if time has passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
  }

  return target.getTime();
}

async function runAutomation(): Promise<void> {
  const settings = await getAutomationSettings();

  if (!settings.enabled) {
    return;
  }

  try {
    // Find or create Instagram tab
    let igTab = await findInstagramTab();

    if (!igTab) {
      // Open Instagram
      igTab = await browser.tabs.create({ url: 'https://www.instagram.com/', active: false });
      // Wait for page to load
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (!igTab?.id) {
      console.error('[Charognard] Could not get Instagram tab');
      return;
    }

    // Send message to content script to run automation
    await browser.tabs.sendMessage(igTab.id, { type: MessageType.RunAutomation });

    // Reschedule for next run (handles both catch-up and weekly cases)
    await setupAlarm();
  } catch (error) {
    console.error('[Charognard] Automation failed:', error);
    // Still reschedule even on error to not break future runs
    await setupAlarm();
  }
}

async function findInstagramTab() {
  const tabs = await browser.tabs.query({ url: '*://*.instagram.com/*' });
  return tabs[0];
}

async function handleMessage(message: ExtensionMessage): Promise<MessageResponse> {
  try {
    if (message.type === 'UPDATE_ALARM') {
      await setupAlarm();
      return { success: true };
    }

    // Find the active Instagram tab
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
      url: '*://*.instagram.com/*',
    });

    let targetTab = tabs[0];

    if (!targetTab) {
      // Try to find any Instagram tab
      const igTabs = await browser.tabs.query({
        url: '*://*.instagram.com/*',
      });

      if (igTabs.length === 0) {
        return {
          success: false,
          error: 'No Instagram tab found. Please open Instagram first.',
        };
      }

      targetTab = igTabs[0];
    }

    // Send message to the Instagram tab
    const response = await browser.tabs.sendMessage(targetTab.id!, message);
    return response as MessageResponse;
  } catch (error) {
    console.error('[Charognard] Background error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to communicate with Instagram tab',
    };
  }
}
