import { ITrackObj } from '../types';
declare class Scheduler {
    private queue;
    private isRunning;
    private supportMessageChannel;
    constructor();
    add(task: ITrackObj, option?: {
        immediate?: boolean;
    }): void;
    startTask(): void;
    run(): void;
}
declare const _default: Scheduler;
export default _default;
