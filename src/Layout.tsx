/** @jsx h */
import { FunctionComponent, h } from 'preact';

export const Layout: FunctionComponent = ({ children }) => (
	<html lang="en">
		<head>
			<meta charSet="UTF-8" />
			<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<script src="https://unpkg.com/htmx.org@1.9.10"></script>
			<script src="https://unpkg.com/htmx.org/dist/ext/ws.js"></script>
			<link rel="stylesheet" href="/styles.css" />
			<title>Document</title>
		</head>
		<body>{children}</body>
	</html>
);
