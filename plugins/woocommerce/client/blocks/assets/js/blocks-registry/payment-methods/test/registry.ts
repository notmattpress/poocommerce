/**
 * External dependencies
 */
import { registerPaymentMethodExtensionCallbacks } from '@poocommerce/blocks-registry';

/**
 * Internal dependencies
 */
import { canMakePaymentExtensionsCallbacks } from '../extensions-config';

describe( 'registerPaymentMethodExtensionCallbacks', () => {
	it( 'Logs an error to console if namespace is already registered', () => {
		registerPaymentMethodExtensionCallbacks(
			'poocommerce-marketplace-extension',
			{
				cod: () => false,
			}
		);

		// eslint-disable-next-line no-console
		expect( console ).not.toHaveErrored();
		registerPaymentMethodExtensionCallbacks(
			'poocommerce-marketplace-extension',
			{
				cod: () => false,
			}
		);
		expect( console ).toHaveErrored();

		// eslint-disable-next-line no-console
		expect( console.error ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Does not overwrite a namespace if a second extensions tries to register with the same name', () => {
		const firstCodCallback = jest.fn().mockReturnValue( false );
		registerPaymentMethodExtensionCallbacks(
			'overwrite-marketplace-extension',
			{
				cod: firstCodCallback,
			}
		);

		// eslint-disable-next-line no-console
		expect( console ).not.toHaveErrored();
		registerPaymentMethodExtensionCallbacks(
			'overwrite-marketplace-extension',
			{
				cod: () => false,
			}
		);

		expect(
			canMakePaymentExtensionsCallbacks[
				'overwrite-marketplace-extension'
			].cod
		).toEqual( firstCodCallback );
	} );

	it( 'Logs an error if a supplied callback is not a function and does not register the callback for that method', () => {
		registerPaymentMethodExtensionCallbacks(
			'other-poocommerce-marketplace-extension',
			{
				cod: false,
				cheque: () => true,
			}
		);

		// eslint-disable-next-line no-console
		expect( console ).toHaveErrored();
		expect( canMakePaymentExtensionsCallbacks ).toHaveProperty(
			'other-poocommerce-marketplace-extension'
		);
		expect(
			canMakePaymentExtensionsCallbacks[
				'other-poocommerce-marketplace-extension'
			]
		).not.toHaveProperty( 'cod' );
		expect(
			canMakePaymentExtensionsCallbacks[
				'other-poocommerce-marketplace-extension'
			]
		).toHaveProperty( 'cheque' );
	} );

	it( 'Adds the namespace and callbacks to the canMakePaymentExtensionCallbacks object', () => {
		// We are using a new namespace here because canMakePaymentExtensionsCallbacks cannot be reset between tests.
		registerPaymentMethodExtensionCallbacks(
			'third-poocommerce-marketplace-extension',
			{
				cod: () => false,
			}
		);
		expect( canMakePaymentExtensionsCallbacks ).toHaveProperty(
			'third-poocommerce-marketplace-extension'
		);
	} );
} );
