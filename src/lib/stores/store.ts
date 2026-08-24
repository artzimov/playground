import { type Language, type OutputChunk } from '$lib/runners/types';
import { getRunner } from '$lib/runners';
import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

const starterCode: Record<Language, string> = {
    typescript: [
        'function greet(name: string): string {',
        '\treturn `Hello, ${name}!`;',
        '}',
        '',
        'console.log(greet("world"));'
    ].join('\n'),
    python: ['def greet(name):', '\treturn f"Hello, {name}!"', '', 'print(greet("world"))'].join('\n'),
    c: [
        '#include <stdio.h>',
        '',
        'int main(void) {',
        '\tprintf("Hello, world!\\n");',
        '\treturn 0;',
        '}'
    ].join('\n')
};

export const activeLanguage = writable<Language>('typescript');
export const codeByLanguage = writable<Record<Language, string>>({ ...starterCode });
export const output = writable<OutputChunk[]>([]);
export const isRunning = writable(false);

let activeController: AbortController | undefined;

export async function runCurrent() {
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    const lang = get(activeLanguage);
    output.set([]);
    isRunning.set(true);

    try {
        const runner = await getRunner(lang);
        await runner.init();
        await runner.run(
            get(codeByLanguage)[lang],
            (chunk) => {
                if (controller.signal.aborted) return; // stale run — its output arrived after a newer one started
                output.update((o) => [...o, chunk]);
            },
            controller.signal
        );
    } catch (err) {
        if (!controller.signal.aborted) {
            output.update((o) => [
                ...o,
                { kind: 'error', text: `${lang} isn't wired up yet: ${(err as Error).message}` }
            ]);
        }
    } finally {
        if (activeController === controller) {
            isRunning.set(false);
        }
    }
}

const AUTORUN_DEBOUNCE_MS = 600;
let autorunTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleAutorun() {
    if (!browser) return;
    if (get(activeLanguage) === 'c') return; // C only runs via the button — compiling is too slow for keystroke-driven runs

    clearTimeout(autorunTimer);
    autorunTimer = setTimeout(runCurrent, AUTORUN_DEBOUNCE_MS);
}

codeByLanguage.subscribe(scheduleAutorun);
activeLanguage.subscribe(scheduleAutorun);