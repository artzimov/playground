import type { Runner, OutputChunk } from './types';
import TsWorker from '../workers/ts.worker?worker';

const TIMEOUT_MS = 5000;

export const tsRunner: Runner = {
    async init() { },
    run(code, onChunk, signal) {
        return new Promise((resolve) => {
            const worker = new TsWorker();
            let settled = false;

            const finish = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                worker.terminate();
                resolve();
            };

            const timer = setTimeout(() => {
                onChunk({ kind: 'error', text: `Timed out after ${TIMEOUT_MS}ms` });
                finish();
            }, TIMEOUT_MS);

            worker.onmessage = (e: MessageEvent<OutputChunk | { kind: 'done' }>) => {
                if (e.data.kind === 'done') {
                    finish();
                } else {
                    onChunk(e.data);
                }
            };

            worker.onerror = (e) => {
                onChunk({ kind: 'error', text: e.message });
                finish();
            };

            signal.addEventListener('abort', finish);
            worker.postMessage({ code });
        });
    }
};