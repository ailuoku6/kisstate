import { ITrackObj } from '../types';

const supportMessageChannel = () => {
  return typeof MessageChannel !== 'undefined';
};

class Scheduler {
  private queue: ITrackObj[] = [];
  private isRunning = false;
  private supportMessageChannel = false;

  constructor() {
    this.supportMessageChannel = supportMessageChannel();
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

  startTask() {
    if (this.isRunning) return;
    this.isRunning = true;
    setTimeout(() => {
      this.run();
      this.isRunning = false;
    }, 0);
  }

  // 参考React的批处理机制消费任务
  run() {
    while (this.queue.length) {
      const task = this.queue.shift();
      task && task.fn?.();
    }
  }
}

export default new Scheduler();
