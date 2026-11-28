/**
 * External dependencies
 */
import { createBlock, parse, serialize } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import '../index';

jest.mock( '@poocommerce/settings', () => ( {
	...jest.requireActual( '@poocommerce/settings' ),
	getSetting: jest.fn( ( key: string, defaultValue: unknown ) =>
		key === 'defaultProductFilterAttribute'
			? { attribute_id: '5' }
			: defaultValue
	),
} ) );

const BLOCK = 'poocommerce/product-filter-attribute';

describe( 'Attribute filter block', () => {
	it( 'saves the attribute ID when it is the store default', () => {
		const block = createBlock( BLOCK, { attributeId: 5 } );

		expect( serialize( [ block ] ) ).toContain( '"attributeId":5' );
	} );

	it( 'sets the store default on saved blocks that have no attribute ID', () => {
		const [ block ] = parse(
			`<!-- wp:${ BLOCK } {"showCounts":true} -->\n<div class="wp-block-poocommerce-product-filter-attribute"></div>\n<!-- /wp:${ BLOCK } -->`
		);

		expect( block.isValid ).toBe( true );
		expect( block.attributes ).toMatchObject( {
			attributeId: 5,
			showCounts: true,
		} );
	} );
} );
