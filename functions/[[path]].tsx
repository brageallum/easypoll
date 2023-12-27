/** @jsx h */
import { h } from 'preact';
import { PagesFunction } from '@cloudflare/workers-types';
import { render } from 'preact-render-to-string';
import { Layout } from '../src/Layout';
import { v4 as uuidv4 } from 'uuid';

export const onRequestGet: PagesFunction = async ({ request, next }): Promise<any> => {
	const url = new URL(request.url);

	const Input = () => {
		const key = uuidv4();
		return (
			<div className="flex relative w-full text-gray-800 cursor-text htmx-fade-in">
				<label className="sr-only" for={key}>
					Add an option for the poll
				</label>
				<input
					id={key}
					name="option"
					className="flex-grow outline-none rounded bg-red-300 placeholder-shown:bg-gray-300 focus:bg-red-200 px-4 py-2 shadow-md placeholder-gray-800"
					placeholder="add an option (fields with no content will be ignored)"
					hx-get="/input"
					hx-trigger="input once changed"
					hx-target="closest div"
					hx-swap="afterend"
				></input>
				<button
					className="absolute bottom-2 right-2"
					hx-get="/input"
					hx-target="closest div"
					hx-swap="delete"
					tabindex={-1}
				>
					X
				</button>
			</div>
		);
	};

	const routes = {
		'/': () => (
			<Layout>
				<form className="flex flex-col items-stretch justify-center h-screen bg-neutral-800 mb-0 p-10 gap-4 transition-all">
					<div className="flex relative w-full cursor-text text-white">
						<label className="sr-only">placeholder label</label>
						<input
							name="title"
							className="flex-grow outline-none bg-transparent border-b-2 border-b-red-500 px-4 py-2 placeholder-gray-300"
							placeholder="Add a title for the poll..."
							autofocus
						></input>
					</div>
					<Input />
					<button
						className="rounded-md px-5 py-2 border-red-500 border-2 text-white"
						hx-get="/input"
						hx-swap="beforebegin"
					>
						New Option
					</button>
					<button
						className="bg-red-500 rounded-md px-5 py-2"
						hx-post={'/submit'}
						hx-target="closest form"
					>
						Submit
					</button>
				</form>
			</Layout>
		),
		'/input': () => <Input />,
	};

	if (url.pathname in routes) {
		const View = routes[url.pathname as keyof typeof routes];
		if (View) {
			return new Response(render(<View />), {
				headers: { 'Content-Type': 'text/html' },
			});
		}
	}

	return next();
};
