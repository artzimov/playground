import { type Language, type OutputChunk } from "$lib/runners/types";
import { writable } from "svelte/store";

export const activeLanguage = writable<Language>('typescript')
export const codeByLanguage = writable<Record<Language, string>>({ typescript: "", python: "", c: "" })
export const output = writable<OutputChunk[]>([])
export const isRunning = writable(false)