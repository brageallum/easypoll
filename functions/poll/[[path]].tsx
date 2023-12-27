/** @jsx h */
import { h, Fragment, JSX, ComponentType } from 'preact';
import { PagesFunction } from '@cloudflare/workers-types';
import { render } from 'preact-render-to-string';
import { Layout } from '../../src/Layout';
import cookie from 'cookie';
import { v4 as uuidv4 } from 'uuid';
import { Env } from '../../src/Env';
import { Poll } from '../submit';

let calls = 0;

const idRegex =
	/^\/poll\/([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})\/?/;
export const onRequestGet: PagesFunction<Env> = async ({ request, next, env }): Promise<any> => {
	console.log('calls:', ++calls);
	const url = new URL(request.url);
	const pollId = url.pathname.match(idRegex)?.[1];

	if (!pollId) {
		return next();
	}

	const cookies = cookie.parse(request.headers.get('Cookie') ?? '');
	const userId = cookies['userId'] ?? uuidv4();
	const basePath = `/poll/${pollId}`;
	const relativePath = url.pathname.replace(new RegExp(basePath + '\\/?'), './');

	const pollStr = await env.SIMPLE_POLL_KV.get(pollId);
	if (!pollStr) {
		return new Response(
			render(
				<Layout>
					<div>
						<h1>Poll not found</h1>
						<a href="/" className="text-blue-700">
							Create a poll
						</a>
					</div>
				</Layout>,
			),
			{
				headers: { 'Content-Type': 'text/html' },
				status: 404,
			},
		);
	}
	const poll = JSON.parse(pollStr ?? '{}') as Poll;

	const Form = ({ maxVotes }: { maxVotes: number }) => (
		<form
			hx-get={basePath + '/vote'}
			hx-swap="innerHTML"
			hx-trigger="change from:form"
			hx-target="closest body"
			className="flex flex-col items-center justify-center h-screen bg-neutral-800 m-0 p-10 gap-5"
		>
			<div className="w-full outline-none bg-transparent border-b-2 border-b-red-500 text-white px-4 py-2">
				{poll.title}
			</div>
			{poll.options.map((option) => {
				return (
					<LoadingCheckbox
						label={option.name}
						votes={option.votes.length}
						totalVotes={maxVotes}
						key={option.name}
						id={option.name}
						name={option.name}
						checked={option.votes.some((vote) => vote.userId === userId)}
					/>
				);
			})}
		</form>
	);
	const Page: ComponentType<{ children: JSX.Element }> = ({ children }) => (
		<Layout>
			<div
				hx-get={basePath + '/reload'}
				hx-swap="innerHTML"
				hx-trigger="load delay:10s, mousemove throttle:5s"
			>
				{children}
			</div>
		</Layout>
	);

	const getMaxVotes = () =>
		poll.options.reduce(
			(acc, option) => (acc > option.votes.length ? acc : option.votes.length),
			0,
		);

	const routes = {
		'./': () => () => (
			<Page>
				<Form maxVotes={getMaxVotes()} />
			</Page>
		),
		'./reload': () => () => <Form maxVotes={getMaxVotes()} />,
		'./vote': async () => {
			const params = url.searchParams;

			poll.options.forEach((option) => {
				const checked = params.get(option.name) === 'on';
				if (checked && !option.votes.map(({ userId }) => userId).includes(userId))
					option.votes.push({ userId });
				else if (!checked) option.votes = option.votes.filter((vote) => vote.userId !== userId);
			});

			await env.SIMPLE_POLL_KV.put(pollId, JSON.stringify(poll));
			return () => {
				return (
					<Page>
						<Form maxVotes={getMaxVotes()} />
					</Page>
				);
			};
		},
	};

	if (relativePath in routes) {
		const View = await routes[relativePath as keyof typeof routes]();
		if (View) {
			return new Response(render(<View />), {
				headers: {
					'Content-Type': 'text/html',
					'Set-Cookie': cookie.serialize('userId', userId, {
						httpOnly: true,
						maxAge: 60 * 60 * 24 * 7,
					}),
				},
			});
		}
	}

	return next();
};

interface LoadingCheckboxProps extends JSX.HTMLAttributes<HTMLInputElement> {
	label: string;
	votes: number;
	totalVotes: number;
}

const LoadingCheckbox: preact.FunctionalComponent<LoadingCheckboxProps> = ({
	label,
	votes,
	totalVotes,
	...inputOptions
}) => {
	const fillPercent = totalVotes ? (votes / totalVotes) * 100 : 0;
	return (
		<label className="relative inline-block px-4 py-2 w-full text-sm font-medium text-gray-800 bg-gray-200 rounded cursor-pointer select-none overflow-hidden hover:bg-gray-300 shadow-md">
			<input {...inputOptions} type="checkbox" className="sr-only peer" />
			<div
				className="absolute top-0 left-0 bottom-0 bg-red-400 peer-checked:bg-red-600"
				style={{ width: `${fillPercent}%` }}
			></div>
			<div className="relative z-10 peer-checked:text-white">{label}</div>
			{fillPercent > 95 ? (
				<div className="absolute bottom-2 right-2 peer-checked:text-white">{votes}</div>
			) : (
				<div className="absolute bottom-2 right-2">{votes}</div>
			)}
		</label>
	);
};
