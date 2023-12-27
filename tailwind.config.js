/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: [
		'./src/**/*.html',
		'./src/**/*.js',
		'./src/**/*.jsx',
		'./src/**/*.ts',
		'./src/**/*.tsx',
		'./functions/**/*.ts',
		'./functions/**/*.tsx',
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
