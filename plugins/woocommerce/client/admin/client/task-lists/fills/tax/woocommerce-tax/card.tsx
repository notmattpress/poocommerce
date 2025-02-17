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
import newLogo from './logo_new.png';
import { TaxChildProps } from '../utils';
import { TermsOfService } from '~/task-lists/components/terms-of-service';
import { isNewBranding } from '~/utils/admin-settings';

export const Card: React.FC< TaxChildProps > = () => {
	return (
		<PartnerCard
			name={ __( 'PooCommerce Tax', 'poocommerce' ) }
			logo={ isNewBranding() ? newLogo : logo }
			description={
				isNewBranding()
					? __(
							'PooCommerce Tax, recommended for new stores',
							'poocommerce'
					  )
					: __( 'Best for new stores', 'poocommerce' )
			}
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
