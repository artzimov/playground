<script lang="ts">
	import { activeLanguage } from '$lib/stores/store';
	import type { Language } from '$lib/runners/types';

	const langs: Language[] = ['typescript', 'python', 'c'];
</script>

<nav class="lang-tabs">
	{#each langs as lang (lang)}
		<button class:active={$activeLanguage === lang} onclick={() => activeLanguage.set(lang)}>
			{lang}
		</button>
	{/each}
</nav>

<style>
	.lang-tabs {
		display: flex;
		gap: 0.5rem;
	}
	button {
		background: transparent;
		border: 1px solid var(--panel-border);
		color: var(--muted);
		padding: 0.4rem 0.9rem;
		border-radius: 6px;
		cursor: pointer;
		font: inherit;
	}
	button.active {
		color: var(--text);
		border-color: var(--accent-blue);
		background: var(--panel-bg);
	}
</style>
