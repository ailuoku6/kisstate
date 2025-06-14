import { ITrackObj } from '../types';
declare class Scheduler {
    private queue;
    private hasNextConsumer;
    private supportMessageChannel;
    private channel;
    constructor();
    add(task: ITrackObj, option?: {
        immediate?: boolean;
    }): void;
    startTask(): void;
    run(): void;
}
declare const _default: Scheduler;
export default _default;
