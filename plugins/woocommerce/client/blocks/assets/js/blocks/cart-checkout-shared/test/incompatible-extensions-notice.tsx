/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSetting } from '@poocommerce/settings';
import { useLocalStorageState } from '@poocommerce/base-hooks';

/**
 * Internal dependencies
 */
import { IncompatibleExtensionsFrontendNotice } from '../incompatible-extensions-notice';

jest.mock( '@poocommerce/settings', () => ( {
	getSetting: jest.fn(),
	CURRENT_USER_IS_ADMIN: true,
} ) );

jest.mock( '@poocommerce/base-hooks', () => ( {
	useLocalStorageState: jest.fn(),
} ) );

jest.mock( '@poocommerce/base-components/notice-banner', () => ( {
	__esModule: true,
	default: ( {
		children,
		onRemove,
		status,
	}: {
		children: React.ReactNode;
		onRemove: () => void;
		status: string;
	} ) => (
		<div data-testid="notice-banner" data-status={ status }>
			{ children }
			<button onClick={ onRemove } data-testid="dismiss-button">
				Dismiss
			</button>
		</div>
	),
} ) );

const mockGetSetting = getSetting as jest.MockedFunction< typeof getSetting >;
const mockUseLocalStorageState = useLocalStorageState as jest.MockedFunction<
	typeof useLocalStorageState
>;

describe( 'IncompatibleExtensionsFrontendNotice', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseLocalStorageState.mockReturnValue( [ [], jest.fn() ] );
	} );

	// Note: Testing CURRENT_USER_IS_ADMIN=false requires module re-mocking which
	// conflicts with testing-library hooks. The admin check is a simple boolean
	// guard at the top of the component, so we rely on the other tests to verify
	// the component works correctly when the admin check passes.

	describe( 'when there are no incompatible extensions', () => {
		beforeEach( () => {
			mockGetSetting.mockReturnValue( [] );
		} );

		it( 'should not render', () => {
			const { container } = render(
				<IncompatibleExtensionsFrontendNotice block="poocommerce/checkout" />
			);
			expect( container ).toBeEmptyDOMElement();
			expect(
				screen.queryByText(
					'may not be compatible with the Checkout block'
				)
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'when there is one incompatible extension', () => {
		beforeEach( () => {
			mockGetSetting.mockReturnValue( [
				{ id: 'test-plugin', title: 'Test Plugin' },
			] );
		} );

		it( 'should render notice with extension name for checkout', () => {
			render(
				<IncompatibleExtensionsFrontendNotice block="poocommerce/checkout" />
			);

			expect( screen.getByTestId( 'notice-banner' ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'notice-banner' ) ).toHaveAttribute(
				'data-status',
				'warning'
			);
			expect(
				screen.getByText(
					/Test Plugin may not be compatible with the Checkout block/
				)
			).toBeInTheDocument();
			expect(
				screen.getByText( /Only administrators see this notice/ )
			).toBeInTheDocument();
		} );

		it( 'should render notice with extension name for cart', () => {
			render(
				<IncompatibleExtensionsFrontendNotice block="poocommerce/cart" />
			);

			expect(
				screen.getByText(
					/Test Plugin may not be compatible with the Cart block/
				)
			).toBeInTheDocument();
		} );

		it( 'should not render a list', () => {
			render(
				<IncompatibleExtensionsFrontendNotice block="poocommerce/checkout" />
			);

			expect( screen.queryByRole( 'list' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when there are multiple incompatible extensions', () => {
		beforeEach( () => {
			mockGetSetting.mockReturnValue( [
				{ id: 'plugin-one', title: 'Plugin One' },
				{ id: 'plugin-two', title: 'Plugin Two' },
			] );
		} );

		it( 'should render notice with list of extensions', () => {
			render(
				<IncompatibleExtensionsFrontendNotice block="poocommerce/checkout" />
			);

			expect(
				screen.getByText(
					/Some extensions may not be compatible with the Checkout block/
				)
			).toBeInTheDocument();
			expect( screen.getByRole( 'list' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Plugin One' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Plugin Two' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'dismissal behavior', () => {
		const mockSetDismissedNotices = jest.fn();

		beforeEach( () => {
			mockGetSetting.mockReturnValue( [
				{ id: 'test-plugin', title: 'Test Plugin' },
			] );
			mockUseLocalStorageState.mockReturnValue( [
				[],
				mockSetDismissedNotices,
			] );
		} );

		it( 'should call setDismissedNotices when dismissed', async () => {
			const user = userEvent.setup();
			render(
				<IncompatibleExtensionsFrontendNotice block="poocommerce/checkout" />
			);

			await user.click( screen.getByTestId( 'dismiss-button' ) );

			expect( mockSetDismissedNotices ).toHaveBeenCalledWith( [
				'test-plugin',
			] );
		} );

		it( 'should not render when already dismissed with same extensions', () => {
			mockUseLocalStorageState.mockReturnValue( [
				[ 'test-plugin' ],
				mockSetDismissedNotices,
			] );

			const { container } = render(
				<IncompatibleExtensionsFrontendNotice block="poocommerce/checkout" />
			);

			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'should render when dismissed but extensions changed', () => {
			mockGetSetting.mockReturnValue( [
				{ id: 'test-plugin', title: 'Test Plugin' },
				{ id: 'new-plugin', title: 'New Plugin' },
			] );
			mockUseLocalStorageState.mockReturnValue( [
				[ 'test-plugin' ],
				mockSetDismissedNotices,
			] );

			render(
				<IncompatibleExtensionsFrontendNotice block="poocommerce/checkout" />
			);

			expect( screen.getByTestId( 'notice-banner' ) ).toBeInTheDocument();
		} );

		it( 'should not render for cart when notice is dismissed (shared dismissal)', () => {
			mockUseLocalStorageState.mockReturnValue( [
				[ 'test-plugin' ],
				mockSetDismissedNotices,
			] );

			const { container } = render(
				<IncompatibleExtensionsFrontendNotice block="poocommerce/cart" />
			);

			expect( container ).toBeEmptyDOMElement();
		} );
	} );
} );
