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
    this.queue.push(task);
    this.run();
  }

  // 参考React的批处理机制消费任务
  run() {
    if (this.isRunning) return;
    this.isRunning = true;
    const task = this.queue.shift();
    task && task.fn?.();
    this.isRunning = false;
  }
}

export default new Scheduler();
