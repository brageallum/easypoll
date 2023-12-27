/** @jsx h */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { render } from 'preact-render-to-string';
import { v4 as uuidv4 } from 'uuid';
import { Env } from '../src/Env';

export interface Poll {
	title: string;
	options: Option[];
}
export interface Option {
	name: string;
	votes: Vote[];
}
export interface Vote {
	userId: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }): Promise<any> => {
	const url = new URL(request.url);
	const formData = await request.formData();
	const id = uuidv4();
	url.pathname = '/poll/' + id;

	const title = formData.get('title')?.toString() ?? '';
	const options = formData
		.getAll('option')
		.filter((option) => option !== '')
		.map((option) => ({ name: option.toString(), votes: [] as Vote[] }));

	await env.SIMPLE_POLL_KV.put(
		id,
		JSON.stringify({
			title: title,
			options: options,
		} satisfies Poll),
	);

	return new Response(
		render(
			<div className="flex flex-col justify-center items-center gap-5">
				<h1 className="text-white text-3xl">Thanks for submitting!</h1>
				<h2 className="text-white text-2xl">{title}</h2>
				<div className="flex flex-row gap-5">
					{options.map(({ name }) => (
						<div key={name} className="text-white">
							{name}
						</div>
					))}
				</div>
				<a href={url.toString()} className="text-white bg-red-500 rounded-md px-5 py-2">
					Open the poll
				</a>
			</div>,
		),
	);
};
