export interface SourceProps {
	result: string;
	source: string;
}

export function Source(props: SourceProps): string {
	return `-# \`→ ${props.result}\` ◇ ${props.source}`;
}
