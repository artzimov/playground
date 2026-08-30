<script lang="ts">
	import { activeLanguage, isRunning } from '$lib/stores/store';
	import { Languages } from '$lib/runners/types';
	import ClearIcon from './ClearIcon.svelte';
	import RunIcon from './RunIcon.svelte';

	let { onClear, onRun }: { onClear: () => void; onRun: () => void } = $props();
</script>

<nav class="sidebar">
	<div class="lang-group">
		{#each Languages as lang (lang)}
			<button
				class="icon-btn lang-btn"
				class:active={$activeLanguage === lang}
				title={lang}
				onclick={() => activeLanguage.set(lang)}
			>
				<span class="badge"><img alt="" src={`/${lang}.svg`} /></span>
			</button>
		{/each}
	</div>

	<div class="divider"></div>

	<div class="action-group">
		<button class="icon-btn" title="Clear" onclick={onClear}><ClearIcon /> </button>

		<button
			class="icon-btn run-btn"
			title="Run"
			disabled={$activeLanguage !== 'c' || $isRunning}
			onclick={onRun}
			><RunIcon />
		</button>
	</div>
</nav>

<style>
	.sidebar {
		box-sizing: border-box;
		width: var(--sidebar-width);
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 0;
		background: var(--panel-bg);
		border-right: 1px solid var(--panel-border);
		height: 100%;
	}

	.lang-group,
	.action-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.divider {
		width: 32px;
		height: 1px;
		background: var(--panel-border);
		margin: 0.25rem 0;
	}

	.icon-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		color: var(--muted);
		padding: 8px;
	}

	.icon-btn:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text);
	}

	.lang-btn.active {
		outline: 2px solid var(--accent-blue);
		outline-offset: 1px;
	}

	.badge {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: 700;
	}

	.run-btn {
		color: var(--text);
	}

	.icon-btn:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.icon-btn:disabled:hover {
		background: transparent;
	}
</style>
