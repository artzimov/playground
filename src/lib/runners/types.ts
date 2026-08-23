export const Languages = ["typescript", "python", "c"]
export type Language = typeof Languages[number]

export type OutputChunk =
	| { kind: "stdout" | "stderr"; text: string }
	| { kind: "result"; text: string }
	| { kind: "error"; text: string }

export interface Runner {
	init(): Promise<void>;
	run(code: string, onChunk: (c: OutputChunk) => void, signal: AbortSignal): Promise<void>
}