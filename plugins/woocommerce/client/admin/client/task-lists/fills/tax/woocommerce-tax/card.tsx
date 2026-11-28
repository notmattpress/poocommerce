/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import interpolateComponents from '@automattic/interpolate-components';
import { recordEvent } from '@poocommerce/tracks';
import { updateQueryString } from '@poocommerce/navigation';

/**
 * Internal dependencies
 */
import { PartnerCard } from '../components/partner-card';
import logo from './logo.png';
import { TermsOfService } from '~/task-lists/components/terms-of-service';

export const Card = () => {
	return (
		<PartnerCard
			name={ __( 'PooCommerce Tax', 'poocommerce' ) }
			logo={ logo }
			description={ __(
				'PooCommerce Tax, recommended for new stores',
				'poocommerce'
			) }
			benefits={ [
				__( 'Real-time sales tax calculation', 'poocommerce' ),
				interpolateComponents( {
					mixedString: __(
						'{{strong}}Single{{/strong}} economic nexus compliance',
						'poocommerce'
					),
					components: {
						strong: <strong />,
					},
				} ),
				// eslint-disable-next-line @wordpress/i18n-translator-comments
				__( '100% free', 'poocommerce' ),
			] }
			terms={
				<TermsOfService
					buttonText={ __( 'Continue setup', 'poocommerce' ) }
				/>
			}
			actionText={ __( 'Continue setup', 'poocommerce' ) }
			onClick={ () => {
				recordEvent( 'tasklist_tax_select_option', {
					selected_option: 'poocommerce-tax',
				} );
				updateQueryString( {
					partner: 'poocommerce-tax',
				} );
			} }
		/>
	);
};
