/**
 * External dependencies
 */
import {
	act,
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@poocommerce/test-utils/msw';

/**
 * Internal dependencies
 */
import { allSettings } from '../../../settings/shared/settings-init';
import Block from '../block';
import { Attributes } from '../types';

const setWindowUrl = ( { url }: { url: string } ) => {
	Object.defineProperty( window, 'location', {
		value: {
			href: url,
		},
		writable: true,
	} );
};

const mockResults = {
	stock_status_counts: [
		{ status: 'instock', count: '18' },
		{ status: 'outofstock', count: '1' },
		{ status: 'onbackorder', count: '5' },
	],
};

jest.mock( '@poocommerce/base-context/hooks', () => {
	return {
		...jest.requireActual( '@poocommerce/base-context/hooks' ),
		useCollectionData: () => ( { isLoading: false, data: mockResults } ),
	};
} );

jest.mock( '@poocommerce/settings', () => {
	return {
		...jest.requireActual( '@poocommerce/settings' ),
		getSettingWithCoercion: jest
			.fn()
			.mockImplementation( ( key, defaultValue ) => {
				if ( key === 'hasFilterableProducts' ) {
					return true;
				}
				return defaultValue;
			} ),
	};
} );

type DisplayStyle = 'list' | 'dropdown';
type SelectType = 'single' | 'multiple';
interface SetupParams {
	filterStock?: string;
	displayStyle?: DisplayStyle;
	selectType?: SelectType;
	showCounts?: boolean;
	showFilterButton?: boolean;
}

const selectors = {
	list: '.wc-block-stock-filter.style-list',
	suggestionsContainer: '.components-form-token-field__suggestions-list',
	chipsContainer: '.components-form-token-field__token',
};

const setup = ( params: SetupParams = {} ) => {
	cleanup();
	const url = `http://woo.local/${
		params.filterStock ? '?filter_stock_status=' + params.filterStock : ''
	}`;
	setWindowUrl( { url } );

	const attributes: Attributes = {
		displayStyle: params.displayStyle || 'list',
		selectType: params.selectType || 'single',
		showCounts: params.showCounts !== undefined ? params.showCounts : true,
		showFilterButton:
			params.showFilterButton !== undefined
				? params.showFilterButton
				: true,
		isPreview: false,
		heading: '',
		headingLevel: 3,
	};

	const { container, ...utils } = render(
		<Block attributes={ attributes } />
	);

	const getList = () => container.querySelector( selectors.list );
	const getDropdown = () => screen.queryByRole( 'combobox' );

	const getChipsContainers = () =>
		container.querySelectorAll( selectors.chipsContainer );
	const getSuggestionsContainer = () =>
		container.querySelector( selectors.suggestionsContainer );

	const getChips = ( value: string ) => {
		const chipsContainers = getChipsContainers();
		const chips = Array.from( chipsContainers ).find( ( chipsContainer ) =>
			chipsContainer
				? within( chipsContainer ).queryByText( value, {
						exact: false,
						ignore: '.components-visually-hidden',
				  } )
				: false
		);

		return chips || null;
	};
	const getSuggestion = ( value: string ) => {
		const suggestionsContainer = getSuggestionsContainer();
		if ( suggestionsContainer ) {
			return within( suggestionsContainer ).queryByText( value, {
				exact: false,
			} );
		}
		return null;
	};
	const getCheckbox = ( value: string ) => {
		const checkboxesContainer = getList();
		const checkboxes = checkboxesContainer
			? checkboxesContainer.querySelectorAll( 'input' )
			: [];

		const checkbox = Array.from( checkboxes ).find(
			( input ) => input.value === value
		);

		return checkbox;
	};

	const getRemoveButtonFromChips = ( chips: HTMLElement | null ) =>
		chips ? within( chips ).getByLabelText( 'Remove stock filter.' ) : null;

	const inStockLabel = 'In stock';
	const outOfStockLabel = 'Out of stock';
	const onBackstockLabel = 'On backorder';
	const inStockId = 'instock';
	const outOfStockId = 'outofstock';
	const onBackstoreId = 'onbackorder';

	const getInStockChips = () => getChips( inStockLabel );
	const getOutOfStockChips = () => getChips( outOfStockLabel );
	const getOnBackorderChips = () => getChips( onBackstockLabel );

	const getInStockSuggestion = () => getSuggestion( inStockLabel );
	const getOutOfStockSuggestion = () => getSuggestion( outOfStockLabel );
	const getOnBackorderSuggestion = () => getSuggestion( onBackstockLabel );

	const getInStockCheckbox = () => getCheckbox( inStockId );
	const getOutOfStockCheckbox = () => getCheckbox( outOfStockId );
	const getOnBackorderCheckbox = () => getCheckbox( onBackstoreId );

	return {
		...utils,
		container,
		getDropdown,
		getList,
		getInStockChips,
		getOutOfStockChips,
		getOnBackorderChips,
		getInStockSuggestion,
		getOutOfStockSuggestion,
		getOnBackorderSuggestion,
		getInStockCheckbox,
		getOutOfStockCheckbox,
		getOnBackorderCheckbox,
		getRemoveButtonFromChips,
	};
};

interface SetupParams {
	filterStock?: string;
	displayStyle?: DisplayStyle;
	selectType?: SelectType;
}

const setupSingleChoiceList = ( filterStock = 'instock' ) =>
	setup( {
		filterStock,
		displayStyle: 'list',
		selectType: 'single',
	} );

const setupMultipleChoiceList = ( filterStock = 'instock' ) =>
	setup( {
		filterStock,
		displayStyle: 'list',
		selectType: 'multiple',
	} );

const setupSingleChoiceDropdown = ( filterStock = 'instock' ) =>
	setup( {
		filterStock,
		displayStyle: 'dropdown',
		selectType: 'single',
	} );

const setupMultipleChoiceDropdown = ( filterStock = 'instock' ) =>
	setup( {
		filterStock,
		displayStyle: 'dropdown',
		selectType: 'multiple',
	} );

describe( 'Filter by Stock block', () => {
	beforeEach( () => {
		allSettings.stockStatusOptions = {
			instock: 'In stock',
			outofstock: 'Out of stock',
			onbackorder: 'On backorder',
		};
	} );

	afterEach( () => {
		server.resetHandlers();
	} );

	test( 'renders the stock filter block', async () => {
		const { container } = setup( {
			showFilterButton: false,
			showCounts: false,
		} );
		expect( container ).toMatchSnapshot();
	} );

	test( 'renders the stock filter block with the filter button', async () => {
		const { container } = setup( {
			showFilterButton: true,
			showCounts: false,
		} );
		expect( container ).toMatchSnapshot();
	} );

	test( 'renders the stock filter block with the product counts', async () => {
		const { container } = setup( {
			showFilterButton: false,
			showCounts: true,
		} );
		expect( container ).toMatchSnapshot();
	} );

	describe( 'Single choice Dropdown', () => {
		test( 'renders dropdown', () => {
			const { getDropdown, getList } = setupSingleChoiceDropdown();

			expect( getDropdown() ).toBeInTheDocument();
			expect( getList() ).toBeNull();
		} );

		test( 'renders chips based on URL params', async () => {
			await waitFor( async () => {
				const ratingParam = 'instock';
				const {
					getInStockChips,
					getOutOfStockChips,
					getOnBackorderChips,
				} = setupSingleChoiceDropdown( ratingParam );

				expect( getInStockChips() ).toBeInTheDocument();
				expect( getOutOfStockChips() ).toBeNull();
				expect( getOnBackorderChips() ).toBeNull();
			} );
		} );

		test( 'replaces chosen option when another one is clicked', async () => {
			await waitFor( async () => {
				const user = userEvent.setup();
				const ratingParam = 'instock';
				const {
					getDropdown,
					getInStockChips,
					getOutOfStockChips,
					getOutOfStockSuggestion,
				} = setupSingleChoiceDropdown( ratingParam );

				expect( getInStockChips() ).toBeInTheDocument();
				expect( getOutOfStockChips() ).toBeNull();

				const dropdown = getDropdown();

				if ( dropdown ) {
					await act( async () => {
						await user.click( dropdown );
					} );
				}

				const outOfStockSuggestion = getOutOfStockSuggestion();

				if ( outOfStockSuggestion ) {
					await act( async () => {
						await user.click( outOfStockSuggestion );
					} );
				}

				expect( getInStockChips() ).toBeNull();
				expect( getOutOfStockChips() ).toBeInTheDocument();
			} );
		} );

		test( 'removes the option when the X button is clicked', async () => {
			await waitFor( async () => {
				const user = userEvent.setup();
				const ratingParam = 'outofstock';
				const {
					getInStockChips,
					getOutOfStockChips,
					getOnBackorderChips,
					getRemoveButtonFromChips,
				} = setupMultipleChoiceDropdown( ratingParam );

				expect( getInStockChips() ).toBeNull();
				expect( getOutOfStockChips() ).toBeInTheDocument();
				expect( getOnBackorderChips() ).toBeNull();

				const removeOutOfStockButton = getRemoveButtonFromChips(
					getOutOfStockChips()
				);

				if ( removeOutOfStockButton ) {
					await act( async () => {
						await user.click( removeOutOfStockButton );
					} );
				}

				expect( getInStockChips() ).toBeNull();
				expect( getOutOfStockChips() ).toBeNull();
				expect( getOnBackorderChips() ).toBeNull();
			} );
		} );
	} );

	describe( 'Multiple choice Dropdown', () => {
		test( 'renders dropdown', () => {
			const { getDropdown, getList } = setupMultipleChoiceDropdown();
			expect( getDropdown() ).toBeDefined();
			expect( getList() ).toBeNull();
		} );

		test( 'renders chips based on URL params', async () => {
			await waitFor( async () => {
				const ratingParam = 'instock,onbackorder';
				const {
					getInStockChips,
					getOutOfStockChips,
					getOnBackorderChips,
				} = setupMultipleChoiceDropdown( ratingParam );

				expect( getInStockChips() ).toBeInTheDocument();
				expect( getOutOfStockChips() ).toBeNull();
				expect( getOnBackorderChips() ).toBeInTheDocument();
			} );
		} );

		test( 'adds chosen option to another one that is clicked', async () => {
			await waitFor( async () => {
				const user = userEvent.setup();
				const ratingParam = 'onbackorder';
				const {
					getDropdown,
					getInStockChips,
					getOutOfStockChips,
					getOnBackorderChips,
					getInStockSuggestion,
					getOutOfStockSuggestion,
				} = setupMultipleChoiceDropdown( ratingParam );

				expect( getInStockChips() ).toBeNull();
				expect( getOutOfStockChips() ).toBeNull();
				expect( getOnBackorderChips() ).toBeInTheDocument();

				const dropdown = getDropdown();

				if ( dropdown ) {
					await user.click( dropdown );
				}

				const inStockSuggestion = getInStockSuggestion();

				if ( inStockSuggestion ) {
					await user.click( inStockSuggestion );
				}

				expect( getInStockChips() ).toBeInTheDocument();
				expect( getOutOfStockChips() ).toBeNull();
				expect( getOnBackorderChips() ).toBeInTheDocument();

				const freshDropdown = getDropdown();
				if ( freshDropdown ) {
					await user.click( freshDropdown );
				}

				const outOfStockSuggestion = getOutOfStockSuggestion();

				if ( outOfStockSuggestion ) {
					await userEvent.click( outOfStockSuggestion );
				}

				expect( getInStockChips() ).toBeInTheDocument();
				expect( getOutOfStockChips() ).toBeInTheDocument();
				expect( getOnBackorderChips() ).toBeInTheDocument();
			} );
		} );

		test( 'removes the option when the X button is clicked', async () => {
			await waitFor( async () => {
				const user = userEvent.setup();
				const ratingParam = 'instock,outofstock,onbackorder';
				const {
					getInStockChips,
					getOutOfStockChips,
					getOnBackorderChips,
					getRemoveButtonFromChips,
				} = setupMultipleChoiceDropdown( ratingParam );

				expect( getInStockChips() ).toBeInTheDocument();
				expect( getOutOfStockChips() ).toBeInTheDocument();
				expect( getOnBackorderChips() ).toBeInTheDocument();

				const removeOutOfStockButton = getRemoveButtonFromChips(
					getOutOfStockChips()
				);

				if ( removeOutOfStockButton ) {
					await act( async () => {
						await user.click( removeOutOfStockButton );
					} );
				}

				expect( getInStockChips() ).toBeInTheDocument();
				expect( getOutOfStockChips() ).toBeNull();
				expect( getOnBackorderChips() ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Single choice List', () => {
		test( 'renders list', () => {
			const { getDropdown, getList } = setupSingleChoiceList();
			expect( getDropdown() ).toBeNull();
			expect( getList() ).toBeInTheDocument();
		} );

		test( 'renders checked options based on URL params', async () => {
			await waitFor( async () => {
				const ratingParam = 'instock';
				const {
					getInStockCheckbox,
					getOutOfStockCheckbox,
					getOnBackorderCheckbox,
				} = setupSingleChoiceList( ratingParam );

				expect( getInStockCheckbox()?.checked ).toBeTruthy();
				expect( getOutOfStockCheckbox()?.checked ).toBeFalsy();
				expect( getOnBackorderCheckbox()?.checked ).toBeFalsy();
			} );
		} );

		test( 'replaces chosen option when another one is clicked', async () => {
			await waitFor( async () => {
				const user = userEvent.setup();
				const ratingParam = 'outofstock';
				const {
					getInStockCheckbox,
					getOutOfStockCheckbox,
					getOnBackorderCheckbox,
				} = setupSingleChoiceList( ratingParam );

				expect( getInStockCheckbox()?.checked ).toBeFalsy();
				expect( getOutOfStockCheckbox()?.checked ).toBeTruthy();
				expect( getOnBackorderCheckbox()?.checked ).toBeFalsy();

				const onBackorderCheckbox = getOnBackorderCheckbox();

				if ( onBackorderCheckbox ) {
					await act( async () => {
						await user.click( onBackorderCheckbox );
					} );
				}

				expect( getInStockCheckbox()?.checked ).toBeFalsy();
				expect( getOutOfStockCheckbox()?.checked ).toBeFalsy();
				expect( getOnBackorderCheckbox()?.checked ).toBeTruthy();
			} );
		} );

		test( 'removes the option when it is clicked again', async () => {
			await waitFor( async () => {
				const ratingParam = 'onbackorder';
				const {
					getInStockCheckbox,
					getOutOfStockCheckbox,
					getOnBackorderCheckbox,
				} = setupMultipleChoiceList( ratingParam );

				expect( getInStockCheckbox()?.checked ).toBeFalsy();
				expect( getOutOfStockCheckbox()?.checked ).toBeFalsy();
				expect( getOnBackorderCheckbox()?.checked ).toBeTruthy();

				const onBackorderCheckbox = getOnBackorderCheckbox();

				if ( onBackorderCheckbox ) {
					userEvent.click( onBackorderCheckbox );
				}

				await waitFor( () => {
					expect( getInStockCheckbox()?.checked ).toBeFalsy();
					expect( getOutOfStockCheckbox()?.checked ).toBeFalsy();
					expect( getOnBackorderCheckbox()?.checked ).toBeFalsy();
				} );
			} );
		} );
	} );

	describe( 'Multiple choice List', () => {
		test( 'renders list', () => {
			const { getDropdown, getList } = setupMultipleChoiceList();
			expect( getDropdown() ).toBeNull();
			expect( getList() ).toBeInTheDocument();
		} );

		test( 'renders chips based on URL params', async () => {
			await waitFor( async () => {
				const ratingParam = 'instock,onbackorder';
				const {
					getInStockCheckbox,
					getOutOfStockCheckbox,
					getOnBackorderCheckbox,
				} = setupMultipleChoiceList( ratingParam );

				expect( getInStockCheckbox()?.checked ).toBeTruthy();
				expect( getOutOfStockCheckbox()?.checked ).toBeFalsy();
				expect( getOnBackorderCheckbox()?.checked ).toBeTruthy();
			} );
		} );

		test( 'adds chosen option to another one that is clicked', async () => {
			await waitFor( async () => {
				const ratingParam = 'outofstock,onbackorder';
				const {
					getInStockCheckbox,
					getOutOfStockCheckbox,
					getOnBackorderCheckbox,
				} = setupMultipleChoiceList( ratingParam );

				expect( getInStockCheckbox()?.checked ).toBeFalsy();
				expect( getOutOfStockCheckbox()?.checked ).toBeTruthy();
				expect( getOnBackorderCheckbox()?.checked ).toBeTruthy();

				const inStockCheckbox = getInStockCheckbox();

				if ( inStockCheckbox ) {
					userEvent.click( inStockCheckbox );
				}

				await waitFor( () => {
					expect( getInStockCheckbox()?.checked ).toBeTruthy();
					expect( getOutOfStockCheckbox()?.checked ).toBeTruthy();
					expect( getOnBackorderCheckbox()?.checked ).toBeTruthy();
				} );
			} );
		} );

		test( 'removes the option when it is clicked again', async () => {
			await waitFor( async () => {
				const ratingParam = 'instock,outofstock';
				const {
					getInStockCheckbox,
					getOutOfStockCheckbox,
					getOnBackorderCheckbox,
				} = setupMultipleChoiceList( ratingParam );

				expect( getInStockCheckbox()?.checked ).toBeTruthy();
				expect( getOutOfStockCheckbox()?.checked ).toBeTruthy();
				expect( getOnBackorderCheckbox()?.checked ).toBeFalsy();

				const inStockCheckbox = getInStockCheckbox();

				if ( inStockCheckbox ) {
					userEvent.click( inStockCheckbox );
				}

				await waitFor( () => {
					expect( getInStockCheckbox()?.checked ).toBeFalsy();
					expect( getOutOfStockCheckbox()?.checked ).toBeTruthy();
					expect( getOnBackorderCheckbox()?.checked ).toBeFalsy();
				} );
			} );
		} );
	} );
} );
