import { type Language, type OutputChunk } from "$lib/runners/types";
import { getRunner } from "$lib/runners";
import { get, writable } from "svelte/store";

export const activeLanguage = writable<Language>('typescript')
export const codeByLanguage = writable<Record<Language, string>>({ typescript: "", python: "", c: "" })
export const output = writable<OutputChunk[]>([])
export const isRunning = writable(false)

export async function runCurrent() {
    const language = get(activeLanguage)
    output.set([])
    isRunning.set(true)

    try {
        const runner = await getRunner(language)
        await runner.init()
        const controller = new AbortController()
        await runner.run(
            get(codeByLanguage)[language], (chunk) => output.update((o) => [...o, chunk]),
            controller.signal
        )
    } catch (err) {
        output.update((o) => [...o, {
            kind: 'error', text: `${language} isn't wired up yet: ${(err as Error).message}`
        }
        ]);
    } finally {
        isRunning.set(false)
    }
}