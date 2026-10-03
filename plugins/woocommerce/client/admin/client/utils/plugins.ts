export function getPluginSlug( id: string | null ): string {
	return ( id || '' ).split( ':', 1 )[ 0 ];
}

export function getPluginTrackKey( id: string ): string {
	const slug = getPluginSlug( id );
	const key = /^poocommerce(-|_)payments$/.test( slug )
		? 'wcpay'
		: `${ slug.replace( /-/g, '_' ) }`.split( ':', 1 )[ 0 ];
	return key;
}
