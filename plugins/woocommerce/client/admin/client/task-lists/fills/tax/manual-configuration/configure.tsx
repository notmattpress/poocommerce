/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import interpolateComponents from '@automattic/interpolate-components';
import { Link } from '@poocommerce/components';
import { recordEvent } from '@poocommerce/tracks';
import { SETTINGS_STORE_NAME } from '@poocommerce/data';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { TaxChildProps } from '../utils';

export const Configure: React.FC<
	Pick< TaxChildProps, 'isPending' | 'onManual' >
> = ( { isPending, onManual } ) => {
	const { generalSettings } = useSelect( ( select ) => {
		const { getSettings } = select( SETTINGS_STORE_NAME );

		return {
			generalSettings: getSettings( 'general' )?.general,
		};
	} );

	return (
		<>
			<Button
				isPrimary
				disabled={ isPending }
				isBusy={ isPending }
				onClick={ () => {
					recordEvent( 'tasklist_tax_config_rates', {} );
					onManual();
				} }
			>
				{ __( 'Configure', 'poocommerce' ) }
			</Button>
			<p>
				{ generalSettings?.poocommerce_calc_taxes !== 'yes' &&
					interpolateComponents( {
						mixedString: __(
							/*eslint-disable max-len*/
							'By clicking "Configure" you\'re enabling tax rates and calculations. More info {{link}}here{{/link}}.',
							'poocommerce'
						),
						components: {
							link: (
								<Link
									href="https://poocommerce.com/document/setting-up-taxes-in-poocommerce/?utm_medium=product#section-1"
									target="_blank"
									type="external"
								>
									<></>
								</Link>
							),
						},
					} ) }
			</p>
		</>
	);
};
