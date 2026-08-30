<script lang="ts">
	import Monaco from '$lib/components/Monaco.svelte';
	import OutputPanel from '$lib/components/OutputPanel.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import logo from '$lib/assets/logo.svg';
	import { runCurrent } from '$lib/stores/store';

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
		<img alt="" src={logo} height="40" width="40" />
	</header>

	<main class="panes">
		<Sidebar onClear={() => monacoRef?.clearCurrent()} onRun={() => runCurrent()} />
		<div class="editor-pane"><Monaco bind:this={monacoRef} /></div>
		<div class="divider"></div>
		<div class="output-pane"><OutputPanel /></div>
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
		/*background: var(--panel-bg);*/
		border-bottom: 1px solid var(--panel-border);
	}

	.panes {
		flex: 1;
		display: flex;
		min-height: 0;
		margin-left: 6rem;
		margin-right: 6rem;
		margin-top: 4rem;
		margin-bottom: 4rem;
		box-shadow: rgba(0, 0, 0, 0.25) 0px 9px 20px 9px;
	}

	.editor-pane {
		flex: 3 3 60%;
		min-width: 0;
		height: 100%;
	}

	.output-pane {
		flex: 2 2 40%;
		min-width: 0;
		height: 100%;
	}

	.divider {
		width: 1px;
		background: var(--panel-border);
	}
</style>
