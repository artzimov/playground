import * as ts from 'typescript';

interface RunMessage {
    code: string;
}

function post(kind: 'stdout' | 'stderr' | 'result' | 'error', text: string) {
    self.postMessage({ kind, text });
}

self.onmessage = async (e: MessageEvent<RunMessage>) => {
    const { code } = e.data;

    let transpiled: string;
    try {
        transpiled = ts.transpileModule(code, {
            compilerOptions: { module: ts.ModuleKind.None, target: ts.ScriptTarget.ES2020 },
            reportDiagnostics: false
        }).outputText;
    } catch (err) {
        post('error', `TypeScript compile error: ${(err as Error).message}`);
        self.postMessage({ kind: 'done' });
        return;
    }

    const sandboxedConsole = {
        log: (...args: unknown[]) => post('stdout', args.map(String).join(' ')),
        error: (...args: unknown[]) => post('stderr', args.map(String).join(' ')),
        warn: (...args: unknown[]) => post('stderr', args.map(String).join(' '))
    };

    try {
        const run = new Function('console', `return (async () => { ${transpiled} })()`);
        const result = await run(sandboxedConsole);
        if (result !== undefined) post('result', String(result));
    } catch (err) {
        post('error', (err as Error).message);
    }

    self.postMessage({ kind: 'done' });
};