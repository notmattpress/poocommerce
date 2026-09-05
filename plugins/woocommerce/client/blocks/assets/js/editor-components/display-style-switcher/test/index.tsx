/**
 * External dependencies
 */
import { fireEvent, render, screen } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { DisplayStyleSwitcher, resetDisplayStyleBlock } from '../index';

type MockBlock = {
	clientId: string;
	name: string;
	attributes?: Record< string, unknown >;
	innerBlocks: MockBlock[];
};

type MockBlockType = {
	name: string;
	title: string;
	ancestor?: string[];
	usesContext?: string[];
	supports?: Record< string, unknown >;
};

let mockBlockTypes: MockBlockType[] = [];
let mockParentBlock: MockBlock | null = null;

const mockCreateBlock = jest.fn(
	( name: string, attributes: Record< string, unknown > = {} ) => ( {
		name,
		attributes,
	} )
);
const mockInsertBlock = jest.fn();
const mockReplaceBlock = jest.fn();

jest.mock( '@wordpress/blocks', () => ( {
	createBlock: ( name: string, attributes?: Record< string, unknown > ) =>
		mockCreateBlock( name, attributes ),
	getBlockTypes: () => mockBlockTypes,
} ) );

jest.mock( '@wordpress/data', () => ( {
	select: () => ( {
		getBlock: () => mockParentBlock,
	} ),
	useDispatch: () => ( {
		insertBlock: mockInsertBlock,
		replaceBlock: mockReplaceBlock,
	} ),
	dispatch: () => ( {
		insertBlock: mockInsertBlock,
		replaceBlock: mockReplaceBlock,
	} ),
} ) );

jest.mock( '@poocommerce/utils', () => ( {
	getInnerBlockByName: ( block: MockBlock | null, name: string ) => {
		if ( ! block ) {
			return null;
		}

		for ( const innerBlock of block.innerBlocks ) {
			if ( innerBlock.name === name ) {
				return innerBlock;
			}

			const nestedBlock = jest
				.requireMock( '@poocommerce/utils' )
				.getInnerBlockByName( innerBlock, name );

			if ( nestedBlock ) {
				return nestedBlock;
			}
		}

		return null;
	},
} ) );

jest.mock( '@wordpress/components', () => {
	const element = jest.requireActual( '@wordpress/element' );
	return {
		__experimentalToggleGroupControl: ( {
			children,
			onChange,
		}: {
			children: JSX.Element[];
			onChange: ( value: string ) => void;
		} ) =>
			element.createElement(
				'div',
				{},
				element.Children.map( children, ( child: JSX.Element ) =>
					element.cloneElement( child, { onSelect: onChange } )
				)
			),
		__experimentalToggleGroupControlOption: ( {
			label,
			value,
			onSelect,
		}: {
			label: string;
			value: string;
			onSelect: ( value: string ) => void;
		} ) =>
			element.createElement(
				'button',
				{ type: 'button', onClick: () => onSelect( value ) },
				label
			),
	};
} );

const makeBlockType = ( overrides: Partial< MockBlockType > ) => ( {
	name: 'poocommerce/product-filter-chips',
	title: 'Chips',
	ancestor: [ 'poocommerce/product-filter-attribute' ],
	usesContext: [ 'poocommerce/selectableItems' ],
	supports: {
		poocommerce: {
			innerBlockDisplayStyle: true,
		},
	},
	...overrides,
} );

describe( 'DisplayStyleSwitcher', () => {
	beforeEach( () => {
		mockBlockTypes = [];
		mockParentBlock = {
			clientId: 'parent-client-id',
			name: 'poocommerce/product-filter-attribute',
			innerBlocks: [],
		};
		mockCreateBlock.mockClear();
		mockInsertBlock.mockClear();
		mockReplaceBlock.mockClear();
	} );

	it( 'includes only blocks with display style support, matching ancestor, and matching context', () => {
		mockBlockTypes = [
			makeBlockType( {
				name: 'poocommerce/product-filter-chips',
				title: 'Chips',
			} ),
			makeBlockType( {
				name: 'poocommerce/no-support',
				title: 'No support',
				supports: {},
			} ),
			makeBlockType( {
				name: 'poocommerce/wrong-ancestor',
				title: 'Wrong ancestor',
				ancestor: [ 'poocommerce/other-parent' ],
			} ),
			makeBlockType( {
				name: 'poocommerce/wrong-context',
				title: 'Wrong context',
				usesContext: [ 'poocommerce/removableItems' ],
			} ),
		];

		render(
			<DisplayStyleSwitcher
				clientId="parent-client-id"
				currentStyle="poocommerce/product-filter-chips"
				onChange={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Chips' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'No support' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Wrong ancestor' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Wrong context' } )
		).not.toBeInTheDocument();
	} );

	it( 'replaces the actual display style block when the attribute is stale', () => {
		mockBlockTypes = [
			makeBlockType( {
				name: 'poocommerce/product-filter-chips',
				title: 'Chips',
			} ),
			makeBlockType( {
				name: 'poocommerce/product-filter-checkbox-list',
				title: 'List',
			} ),
		];
		mockParentBlock = {
			clientId: 'parent-client-id',
			name: 'poocommerce/product-filter-attribute',
			innerBlocks: [
				{
					clientId: 'chips-client-id',
					name: 'poocommerce/product-filter-chips',
					attributes: { chipText: 'blue' },
					innerBlocks: [],
				},
			],
		};

		render(
			<DisplayStyleSwitcher
				clientId="parent-client-id"
				currentStyle="poocommerce/missing-style"
				onChange={ jest.fn() }
			/>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'List' } ) );

		expect( mockReplaceBlock ).toHaveBeenCalledWith( 'chips-client-id', {
			name: 'poocommerce/product-filter-checkbox-list',
			attributes: {},
		} );
		expect( mockInsertBlock ).not.toHaveBeenCalled();
	} );

	it( 'restores attributes using the actual display style block name', () => {
		mockBlockTypes = [
			makeBlockType( {
				name: 'poocommerce/product-filter-chips',
				title: 'Chips',
			} ),
			makeBlockType( {
				name: 'poocommerce/product-filter-checkbox-list',
				title: 'List',
			} ),
		];
		mockParentBlock = {
			clientId: 'parent-client-id',
			name: 'poocommerce/product-filter-attribute',
			innerBlocks: [
				{
					clientId: 'style-client-id',
					name: 'poocommerce/product-filter-chips',
					attributes: { chipText: 'blue' },
					innerBlocks: [],
				},
			],
		};

		const { rerender } = render(
			<DisplayStyleSwitcher
				clientId="parent-client-id"
				currentStyle="poocommerce/missing-style"
				onChange={ jest.fn() }
			/>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'List' } ) );

		mockParentBlock = {
			clientId: 'parent-client-id',
			name: 'poocommerce/product-filter-attribute',
			innerBlocks: [
				{
					clientId: 'style-client-id',
					name: 'poocommerce/product-filter-checkbox-list',
					attributes: {},
					innerBlocks: [],
				},
			],
		};
		mockCreateBlock.mockClear();
		mockReplaceBlock.mockClear();

		rerender(
			<DisplayStyleSwitcher
				clientId="parent-client-id"
				currentStyle="poocommerce/product-filter-checkbox-list"
				onChange={ jest.fn() }
			/>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Chips' } ) );

		expect( mockCreateBlock ).toHaveBeenCalledWith(
			'poocommerce/product-filter-chips',
			{ chipText: 'blue' }
		);
	} );

	it( 'uses fallback placement when no display style block exists', () => {
		mockBlockTypes = [
			makeBlockType( {
				name: 'poocommerce/product-filter-chips',
				title: 'Chips',
				ancestor: [
					'poocommerce/add-to-cart-with-options-variation-selector-attribute',
				],
			} ),
		];
		mockParentBlock = {
			clientId: 'parent-client-id',
			name: 'poocommerce/add-to-cart-with-options-variation-selector-attribute',
			innerBlocks: [
				{
					clientId: 'group-client-id',
					name: 'core/group',
					innerBlocks: [],
				},
			],
		};

		render(
			<DisplayStyleSwitcher
				clientId="parent-client-id"
				currentStyle="poocommerce/product-filter-chips"
				getFallbackDisplayStyleInsertionPoint={ () => ( {
					rootClientId: 'group-client-id',
					index: 0,
				} ) }
				onChange={ jest.fn() }
			/>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Chips' } ) );

		expect( mockInsertBlock ).toHaveBeenCalledWith(
			{
				name: 'poocommerce/product-filter-chips',
				attributes: {},
			},
			0,
			'group-client-id',
			false
		);
	} );

	it( 'uses fallback placement when resetting without a display style block', () => {
		mockBlockTypes = [
			makeBlockType( {
				name: 'poocommerce/product-filter-chips',
				title: 'Chips',
				ancestor: [
					'poocommerce/add-to-cart-with-options-variation-selector-attribute',
				],
			} ),
		];
		mockParentBlock = {
			clientId: 'parent-client-id',
			name: 'poocommerce/add-to-cart-with-options-variation-selector-attribute',
			innerBlocks: [],
		};

		resetDisplayStyleBlock(
			'parent-client-id',
			'poocommerce/product-filter-chips',
			() => ( {
				rootClientId: 'group-client-id',
				index: 0,
			} )
		);

		expect( mockInsertBlock ).toHaveBeenCalledWith(
			{
				name: 'poocommerce/product-filter-chips',
				attributes: {},
			},
			0,
			'group-client-id',
			false
		);
	} );
} );
