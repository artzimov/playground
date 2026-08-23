<script lang="ts">
	import Monaco from '$lib/components/Monaco.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import OutputPanel from '$lib/components/OutputPanel.svelte';
	import { isRunning, runCurrent } from '$lib/stores/store';

	function handleKeyDown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			runCurrent();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="app">
	<header class="toolbar">
		<Navigation />
		<button class="run-btn" onclick={() => runCurrent()} disabled={$isRunning}>
			{$isRunning ? 'Running...' : '▶ Run'}
		</button>
	</header>

	<main class="panes">
		<div class="pane editor-pane"><Monaco /></div>
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
