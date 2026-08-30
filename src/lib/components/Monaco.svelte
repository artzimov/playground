<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { activeLanguage, codeByLanguage } from '$lib/stores/store';
	import { Languages, type Language } from '$lib/runners/types';
	import type * as Monaco from 'monaco-editor';

	let container: HTMLDivElement;
	let editor: Monaco.editor.IStandaloneCodeEditor;
	let models: Partial<Record<Language, Monaco.editor.ITextModel>> = {};

	function toMonacoLangId(lang: Language): string {
		return lang === 'c' ? 'cpp' : lang;
	}

	onMount(async () => {
		await import('$lib/monaco/setup');
		const monaco = await import('monaco-editor');

		monaco.editor.defineTheme('playground-dark', {
			base: 'vs-dark',
			inherit: true,
			rules: [
				{ token: 'comment', foreground: '6b7086', fontStyle: 'italic' },
				{ token: 'keyword', foreground: 'ff79c6' },
				{ token: 'number', foreground: 'b39bff' },
				{ token: 'string', foreground: 'e6d17a' },
				{ token: 'identifier', foreground: '82aaff' }
			],
			colors: {
				//'editor.background': '#262a3a',
				//'editor.foreground': '#d6d9e2',
				'editorLineNumber.foreground': '#484d63',
				'editor.lineHighlightBackground': '#2c3040'
			}
		});

		const initialCode = get(codeByLanguage);
		(Languages as Language[]).forEach((lang) => {
			models[lang] = monaco.editor.createModel(initialCode[lang], toMonacoLangId(lang));
			models[lang]!.onDidChangeContent(() => {
				codeByLanguage.update((c) => ({ ...c, [lang]: models[lang]!.getValue() }));
			});
		});

		editor = monaco.editor.create(container, {
			model: models[get(activeLanguage)],
			theme: 'playground-dark',
			automaticLayout: true,
			minimap: { enabled: false },
			fontSize: 14,
			fontFamily: "'Fira Code', monospace"
		});
	});

	$effect(() => {
		const lang = $activeLanguage;
		const model = models[lang];

		if (editor && model) {
			editor.setModel(model);
		}
	});

	export function clearCurrent() {
		const lang = get(activeLanguage);
		models[lang]?.setValue('');
	}

	onDestroy(() => {
		editor?.dispose();
		Object.values(models).forEach((m) => m?.dispose());
	});
</script>

<div class="editor-container" bind:this={container}></div>

<style>
	.editor-container {
		width: 100%;
		height: 100%;
		background: var(--panel-bg);
	}
</style>
