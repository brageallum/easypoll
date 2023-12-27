const esbuild = require('esbuild');

esbuild
	.build({
		entryPoints: ['./src/index.jsx'],
		bundle: true,
		outfile: 'dist/bundle.js',
		minify: false,
		sourcemap: true,
		target: 'es6',
		jsxFactory: 'React.createElement',
		jsxFragment: 'React.Fragment',
	})
	.catch(() => process.exit(1));
