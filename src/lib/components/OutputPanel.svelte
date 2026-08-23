<script lang="ts">
	import { output } from '$lib/stores/store';
</script>

<div class="output-container">
	{#each $output as chunk, i (i)}
		<div class="line {chunk.kind}">{chunk.text}</div>
	{/each}
</div>

<style>
	.output-container {
		width: 100%;
		height: 100%;
		overflow-y: auto;
		padding: 1rem;
		box-sizing: border-box;
		font-family: 'Fira Code', monospace;
		font-size: 14px;
		background: var(--panel-bg);
	}
	.line {
		white-space: pre-wrap;
		line-height: 1.5;
	}
	.line.stdout,
	.line.result {
		color: var(--text);
	}
	.line.stderr,
	.line.error {
		color: #ff6b6b;
	}
</style>
