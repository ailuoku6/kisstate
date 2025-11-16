import { ITrackObj } from '../types/index';

const supportMessageChannel = () => {
  return typeof MessageChannel !== 'undefined';
};

class Scheduler {
  private queue: ITrackObj[] = [];
  private hasNextConsumer = false;
  private supportMessageChannel = false;
  private channel: MessageChannel | null = null;

  constructor() {
    this.supportMessageChannel = supportMessageChannel();
    if (this.supportMessageChannel) {
      this.channel = new MessageChannel();

      this.channel.port1.onmessage = () => {
        this.run();
      };
    }
  }

  add(task: ITrackObj, option: { immediate?: boolean } = {}) {
    const { immediate } = option;
    this.queue.push(task);
    if (immediate) {
      this.run();
      return;
    }
    this.startTask();
  }

  private startTask() {
    if (this.hasNextConsumer) return;
    this.hasNextConsumer = true;
    if (this.supportMessageChannel && this.channel) {
      this.channel.port2.postMessage(null);
    } else {
      setTimeout(() => {
        this.run();
      }, 0);
    }
  }

  // 消费任务
  private run() {
    const runSet = new Set<ITrackObj>();
    const tasks = this.queue;
    this.queue = [];
    this.hasNextConsumer = false;
    while (tasks.length) {
      const task = tasks.shift();
      if (task && !runSet.has(task)) {
        task.fn?.();
        runSet.add(task);
      }
    }
  }
}

export default new Scheduler();
