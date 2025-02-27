export const parser = 'tsx';

const i18nFunctionsToRename = [
    '__',
    '_n',
    '_x'
]


const isFunctionNamed = ( path, names ) => {
	return names.includes(path.value.callee.name);
};

export default function transformer( file, api ) {
	const j = api.jscodeshift;

	return j( file.source )
		.find( j.CallExpression )
		.filter( ( p ) => isFunctionNamed( p, i18nFunctionsToRename ) )
		.forEach( ( path ) => {
			j( path ) // Descend into each call expression to find any strings literal 'poocommerce-admin'
				.find( j.StringLiteral, { value: 'poocommerce-admin' } )
				.replaceWith( j.stringLiteral( 'poocommerce' ) );
		} )
		.toSource();
}
