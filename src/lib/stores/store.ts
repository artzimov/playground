import { type Language, type OutputChunk } from '$lib/runners/types';
import { getRunner } from '$lib/runners';
import { get, writable } from 'svelte/store';

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


export async function runCurrent() {
    const lang = get(activeLanguage);
    output.set([]);
    isRunning.set(true);

    try {
        const runner = await getRunner(lang);
        await runner.init();
        const controller = new AbortController();
        await runner.run(
            get(codeByLanguage)[lang],
            (chunk) => output.update((o) => [...o, chunk]),
            controller.signal
        );
    } catch (err) {
        output.update((o) => [
            ...o,
            { kind: 'error', text: `${lang} isn't wired up yet: ${(err as Error).message}` }
        ]);
    } finally {
        isRunning.set(false);
    }
}
