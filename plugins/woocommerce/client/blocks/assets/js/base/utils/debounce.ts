// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DebouncedFunction< T extends ( ...args: any[] ) => any > = ( (
	...args: Parameters< T >
) => void ) & { flush: () => void; clear: () => void };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = < T extends ( ...args: any[] ) => any >(
	func: T,
	wait: number,
	immediate?: boolean
): DebouncedFunction< T > => {
	let timeout: ReturnType< typeof setTimeout > | null;
	let latestArgs: Parameters< T > | null = null;

	const debounced = ( ( ...args: Parameters< T > ) => {
		latestArgs = args;
		if ( timeout ) clearTimeout( timeout );
		timeout = setTimeout( () => {
			timeout = null;
			if ( ! immediate && latestArgs ) func( ...latestArgs );
		}, wait );
		if ( immediate && ! timeout ) func( ...args );
	} ) as DebouncedFunction< T >;

	// Clear the debounce queue and execute any pending function immediately.
	debounced.flush = () => {
		if ( timeout && latestArgs ) {
			func( ...latestArgs );
			clearTimeout( timeout );
			timeout = null;
		}
	};

	// Clear the debounce queue without executing any functions.
	debounced.clear = () => {
		if ( timeout ) {
			clearTimeout( timeout );
		}
		timeout = null;
	};

	return debounced;
};
