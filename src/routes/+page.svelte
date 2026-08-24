<script lang="ts">
	import Monaco from '$lib/components/Monaco.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import OutputPanel from '$lib/components/OutputPanel.svelte';
	import { isRunning, runCurrent } from '$lib/stores/store';

	let monacoRef: Monaco;

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			runCurrent();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="app">
	<header class="toolbar">
		<Navigation />
		<div class="actions">
			<button class="clear-btn" onclick={() => monacoRef?.clearCurrent()}>Clear</button>
			<button class="run-btn" onclick={() => runCurrent()} disabled={$isRunning}>
				{$isRunning ? 'Running…' : '▶ Run'}
			</button>
		</div>
	</header>

	<main class="panes">
		<div class="pane editor-pane"><Monaco bind:this={monacoRef} /></div>
		<div class="divider"></div>
		<div class="pane output-pane"><OutputPanel /></div>
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--panel-bg);
		border-bottom: 1px solid var(--panel-border);
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.clear-btn {
		background: transparent;
		color: var(--muted);
		border: 1px solid var(--panel-border);
		border-radius: 6px;
		padding: 0.5rem 1.1rem;
		cursor: pointer;
		font: inherit;
	}

	.clear-btn:hover {
		color: var(--text);
		border-color: var(--accent-blue);
	}

	.run-btn {
		background: var(--accent-blue);
		color: #10121a;
		border: none;
		border-radius: 6px;
		padding: 0.5rem 1.25rem;
		font-weight: 600;
		cursor: pointer;
	}

	.run-btn:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.panes {
		flex: 1;
		display: flex;
		min-height: 0;
	}

	.pane {
		flex: 1 1 50%;
		min-width: 0;
		height: 100%;
	}

	.divider {
		width: 1px;
		background: var(--panel-border);
	}
</style>
