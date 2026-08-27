<script lang="ts">
	import { activeLanguage, isRunning } from '$lib/stores/store';
	import type { Language } from '$lib/runners/types';

	let { onClear, onRun }: { onClear: () => void; onRun: () => void } = $props();

	const languages: { id: Language; label: string; bg: string; fg: string }[] = [
		{ id: 'typescript', label: 'TS', bg: '#3178c6', fg: '#ffffff' },
		{ id: 'python', label: 'PY', bg: '#306998', fg: '#ffd43b' },
		{ id: 'c', label: 'C', bg: '#00599c', fg: '#ffffff' }
	];
</script>

<nav class="sidebar">
	<div class="lang-group">
		{#each languages as lang (lang.id)}
			<button
				class="icon-btn lang-btn"
				class:active={$activeLanguage === lang.id}
				style="--badge-bg: {lang.bg}; --badge-fg: {lang.fg};"
				title={lang.id}
				onclick={() => activeLanguage.set(lang.id)}
			>
				<span class="badge">{lang.label}</span>
			</button>
		{/each}
	</div>

	<div class="divider"></div>

	<div class="action-group">
		<button class="icon-btn" title="Clear" onclick={onClear}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
				/>
			</svg>
		</button>

		<button
			class="icon-btn run-btn"
			title="Run"
			disabled={$activeLanguage !== 'c' || $isRunning}
			onclick={onRun}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
				/>
			</svg>
		</button>
	</div>
</nav>

<style>
	.sidebar {
		width: 56px;
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
		padding: 0;
	}

	.icon-btn:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text);
	}

	.icon-btn svg {
		width: 20px;
		height: 20px;
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
		background: var(--badge-bg);
		color: var(--badge-fg);
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
