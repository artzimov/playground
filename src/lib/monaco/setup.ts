import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

declare global {
	interface Window {
		MonacoEnvironment: {
			getWorker(_moduleId: string, label: string): Worker
		}
	}
}

self.MonacoEnvironment = {
	getWorker(_moduleId: string, label: string) {
		if (label === 'typescript' || label === 'javascript') {
			return new TsWorker();
		}
		return new EditorWorker();
	}
};
