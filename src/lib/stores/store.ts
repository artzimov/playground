// src/lib/stores/store.ts
import { type Language, type OutputChunk } from '$lib/runners/types';
import { getRunner } from '$lib/runners';
import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

const starterCode: Record<Language, string> = {
    typescript: '', python: '', c: ''
};

export const activeLanguage = writable<Language>('typescript');
export const codeByLanguage = writable<Record<Language, string>>({ ...starterCode });
export const output = writable<OutputChunk[]>([]);
export const isRunning = writable(false);

const outputByLanguage: Record<Language, OutputChunk[]> = { typescript: [], python: [], c: [] };

let activeController: AbortController | undefined;

export async function runCurrent() {
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    const lang = get(activeLanguage);
    isRunning.set(true);

    const collected: OutputChunk[] = [];
    const commit = () => {
        outputByLanguage[lang] = collected;
        if (get(activeLanguage) === lang) {
            output.set([...collected]);
        }
    };

    try {
        const runner = await getRunner(lang);
        await runner.init();
        await runner.run(
            get(codeByLanguage)[lang],
            (chunk) => {
                if (controller.signal.aborted) return;
                collected.push(chunk);
                commit();
            },
            controller.signal
        );
        if (collected.length === 0 && !controller.signal.aborted) {
            commit();
        }
    } catch (err) {
        if (!controller.signal.aborted) {
            collected.push({ kind: 'error', text: `${lang} isn't wired up yet: ${(err as Error).message}` });
            commit();
        }
    } finally {
        if (activeController === controller) {
            isRunning.set(false);
        }
    }
}

const AUTORUN_DEBOUNCE_MS = 1000;
let autorunTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleAutorun() {
    if (!browser) return;
    if (get(activeLanguage) === 'c') return;

    clearTimeout(autorunTimer);
    autorunTimer = setTimeout(runCurrent, AUTORUN_DEBOUNCE_MS);
}

activeLanguage.subscribe((lang) => {
    output.set(outputByLanguage[lang]);
    scheduleAutorun();
});
codeByLanguage.subscribe(scheduleAutorun);