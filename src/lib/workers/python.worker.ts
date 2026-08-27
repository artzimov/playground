import type { OutputChunk } from '../runners/types';

interface PyodideInterface {
    setStdout(options: { batched: (msg: string) => void }): void;
    setStderr(options: { batched: (msg: string) => void }): void;
    runPythonAsync(code: string): Promise<unknown>;
}

interface PyodideModule {
    loadPyodide(config: { indexURL: string }): Promise<PyodideInterface>;
}

const PYODIDE_VERSION = '314.0.6';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideReady: Promise<PyodideInterface> | null = null;

function getPyodide(): Promise<PyodideInterface> {
    if (!pyodideReady) {
        pyodideReady = (async () => {
            const mod = (await import(`${PYODIDE_CDN}pyodide.mjs`)) as PyodideModule;
            return mod.loadPyodide({ indexURL: PYODIDE_CDN });
        })();
    }
    return pyodideReady;
}

interface InitMessage {
    type: 'init';
}

interface RunMessage {
    type: 'run';
    id: string;
    code: string;
}

self.onmessage = async (e: MessageEvent<InitMessage | RunMessage>) => {
    if (e.data.type === 'init') {
        try {
            await getPyodide();
            self.postMessage({ kind: 'ready' });
        } catch (err) {
            self.postMessage({ kind: 'ready-error', text: (err as Error).message });
        }
        return;
    }

    const { id, code } = e.data;
    const post = (kind: OutputChunk['kind'], text: string) => self.postMessage({ id, kind, text });

    try {
        const pyodide = await getPyodide();
        pyodide.setStdout({ batched: (msg) => post('stdout', msg) });
        pyodide.setStderr({ batched: (msg) => post('stderr', msg) });
        const result = await pyodide.runPythonAsync(code);
        if (result !== undefined) post('result', String(result));
    } catch (err) {
        post('error', (err as Error).message);
    }

    self.postMessage({ id, kind: 'done' });
};