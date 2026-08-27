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

let activeController: AbortController | undefined;

export async function runCurrent() {
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    const lang = get(activeLanguage);
    isRunning.set(true);

    const collected: OutputChunk[] = [];

    try {
        const runner = await getRunner(lang);
        await runner.init();
        await runner.run(
            get(codeByLanguage)[lang],
            (chunk) => {
                if (controller.signal.aborted) return;
                collected.push(chunk);
                output.set([...collected]); // swap in one commit — no blank-then-refill flash
            },
            controller.signal
        );
        if (collected.length === 0 && !controller.signal.aborted) {
            output.set([]); // confirmed genuinely empty — safe to clear now
        }
    } catch (err) {
        if (!controller.signal.aborted) {
            collected.push({ kind: 'error', text: `${lang} isn't wired up yet: ${(err as Error).message}` });
            output.set([...collected]);
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
    if (get(activeLanguage) === 'c') return; // C only runs via the button

    clearTimeout(autorunTimer);
    autorunTimer = setTimeout(runCurrent, AUTORUN_DEBOUNCE_MS);
}

codeByLanguage.subscribe(scheduleAutorun);
activeLanguage.subscribe(scheduleAutorun);