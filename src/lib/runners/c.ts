import type { Runner, OutputChunk } from './types';
import CWorker from '../workers/c.worker?worker';

const RUN_TIMEOUT_MS = 60000;

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;

interface PendingRun {
    onChunk: (chunk: OutputChunk) => void;
    finish: () => void;
}

const pending = new Map<string, PendingRun>();

function resetWorker() {
    worker?.terminate();
    worker = null;
    readyPromise = null;
    for (const { finish } of pending.values()) finish();
    pending.clear();
}

function getWorker(): Worker {
    if (!worker) {
        const w = new CWorker();
        w.onmessage = (e: MessageEvent) => {
            const data = e.data;
            if (data.kind === 'ready' || data.kind === 'ready-error') return;
            const entry = pending.get(data.id);
            if (!entry) return;
            if (data.kind === 'done') {
                pending.delete(data.id);
                entry.finish();
            } else {
                entry.onChunk(data as OutputChunk);
            }
        };
        worker = w;
    }
    return worker;
}

let runCounter = 0;

export const cRunner: Runner = {
    init() {
        if (!readyPromise) {
            const w = getWorker();
            readyPromise = new Promise((resolve, reject) => {
                const onMessage = (e: MessageEvent) => {
                    if (e.data.kind === 'ready') {
                        w.removeEventListener('message', onMessage);
                        resolve();
                    } else if (e.data.kind === 'ready-error') {
                        w.removeEventListener('message', onMessage);
                        reject(new Error(e.data.text));
                    }
                };
                w.addEventListener('message', onMessage);
                w.postMessage({ type: 'init' });
            });
        }
        return readyPromise;
    },

    run(code, onChunk, signal) {
        const w = getWorker();
        const id = String(runCounter++);

        return new Promise((resolve) => {
            let settled = false;
            const finish = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                resolve();
            };

            const timer = setTimeout(() => {
                onChunk({ kind: 'error', text: `Timed out after ${RUN_TIMEOUT_MS}ms — restarting the C toolchain` });
                resetWorker();
            }, RUN_TIMEOUT_MS);

            pending.set(id, { onChunk, finish });
            signal.addEventListener('abort', () => {
                pending.delete(id);
                finish();
            });

            w.postMessage({ type: 'run', id, code });
        });
    }
};