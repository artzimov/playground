import { type Language, type Runner } from "./types";

const registry = new Map<Language, () => Promise<Runner>>([
	["typescript", () => import('./ts').then(m => m.tsRunner)],
	//["python", () => import('./python').then(m => m.pythonRunner)],
	//["c", () => import('./c').then(m => m.cRunner)],
])

export function getRunner(language: Language) {
	return registry.get(language)!()
}