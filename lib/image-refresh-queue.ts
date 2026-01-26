import { fetchUserInfo } from './instagram';
import { updateProfilePicUrl } from './storage/profiles';

interface QueueItem {
  userId: string;
  onSuccess?: (newUrl: string) => void;
}

class ImageRefreshQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private processedIds = new Set<string>();
  private readonly DELAY_MS = 2000; // 2 seconds between requests

  add(item: QueueItem) {
    // Skip if already processed or in queue
    if (this.processedIds.has(item.userId)) return;
    if (this.queue.some((q) => q.userId === item.userId)) return;

    this.queue.push(item);
    this.processedIds.add(item.userId);
    this.processNext();
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const item = this.queue.shift()!;

    try {
      const userInfo = await fetchUserInfo(item.userId);
      if (userInfo?.user?.profile_pic_url) {
        await updateProfilePicUrl(item.userId, userInfo.user.profile_pic_url);
        item.onSuccess?.(userInfo.user.profile_pic_url);
      }
    } catch {
      // Silently fail - the fallback icon will remain visible
    }

    // Wait before processing next item
    if (this.queue.length > 0) {
      setTimeout(() => {
        this.processing = false;
        this.processNext();
      }, this.DELAY_MS);
    } else {
      this.processing = false;
    }
  }

  // Clear processed IDs cache (call when component unmounts or tab changes)
  reset() {
    this.processedIds.clear();
  }
}

export const imageRefreshQueue = new ImageRefreshQueue();
