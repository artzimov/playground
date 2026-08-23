<script lang="ts">
	import { activeLanguage } from '$lib/stores/store';
	import { Languages } from '$lib/runners/types';
</script>

<nav class="language-tabs">
	{#each Languages as lang (lang)}
		<button class:active={$activeLanguage === lang} onclick={() => activeLanguage.set(lang)}
			>{lang}</button
		>
	{/each}
</nav>

<style>
	.language-tabs {
		display: flex;
		gap: 0.5 rem;
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
