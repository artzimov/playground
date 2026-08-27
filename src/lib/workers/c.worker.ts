import type { OutputChunk } from '../runners/types';

const WASMER_SDK_URL = 'https://unpkg.com/@wasmer/sdk@0.10.0/dist/index.mjs';

interface WasmerDirectory {
    writeFile(path: string, contents: string): Promise<void>;
    readFile(path: string): Promise<Uint8Array>;
}

interface WasmerRunResult {
    wait(): Promise<{ ok: boolean; code: number; stdout: string; stderr: string }>;
}

interface WasmerPackage {
    entrypoint: {
        run(options?: { args?: string[]; mount?: Record<string, WasmerDirectory> }): Promise<WasmerRunResult>;
    };
}

interface WasmerModule {
    init(): Promise<void>;
    Wasmer: {
        fromRegistry(pkg: string): Promise<WasmerPackage>;
        fromFile(bytes: Uint8Array): Promise<WasmerPackage>;
    };
    Directory: new () => WasmerDirectory;
}

let readyPromise: Promise<{ wasmer: WasmerModule; clang: WasmerPackage }> | null = null;

function getReady() {
    if (!readyPromise) {
        readyPromise = (async () => {
            const wasmer = (await import(WASMER_SDK_URL)) as WasmerModule;
            await wasmer.init();
            const clang = await wasmer.Wasmer.fromRegistry('clang/clang');
            return { wasmer, clang };
        })();
    }
    return readyPromise;
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
            await getReady();
            self.postMessage({ kind: 'ready' });
        } catch (err) {
            self.postMessage({ kind: 'ready-error', text: (err as Error).message });
        }
        return;
    }

    const { id, code } = e.data;
    const post = (kind: OutputChunk['kind'], text: string) => self.postMessage({ id, kind, text });

    try {
        const { wasmer, clang } = await getReady();
        const project = new wasmer.Directory();
        await project.writeFile('main.c', code);

        const compileInstance = await clang.entrypoint.run({
            args: ['/project/main.c', '-o', '/project/main.wasm'],
            mount: { '/project': project }
        });
        const compileResult = await compileInstance.wait();

        if (!compileResult.ok) {
            post('error', compileResult.stderr || `Compilation failed (exit ${compileResult.code})`);
            self.postMessage({ id, kind: 'done' });
            return;
        }

        const wasmBytes = await project.readFile('main.wasm');
        const program = await wasmer.Wasmer.fromFile(wasmBytes);
        const runInstance = await program.entrypoint.run();
        const runResult = await runInstance.wait();

        if (runResult.stdout) post('stdout', runResult.stdout);
        if (runResult.stderr) post('stderr', runResult.stderr);
        if (!runResult.ok) post('error', `Exited with code ${runResult.code}`);
    } catch (err) {
        post('error', (err as Error).message);
    }

    self.postMessage({ id, kind: 'done' });
};