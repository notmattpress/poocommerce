/**
 * External dependencies
 */
import { Text } from '@poocommerce/experimental';
import interpolateComponents from '@automattic/interpolate-components';
import { __, sprintf } from '@wordpress/i18n';
import { Link } from '@poocommerce/components';

export const TermsOfService = ( { buttonText } ) => (
	<Text
		variant="caption"
		className="poocommerce-task__caption is-tos"
		size="12"
		lineHeight="16px"
		style={ { display: 'block' } }
	>
		{ interpolateComponents( {
			mixedString: sprintf(
				/* translators: button text, most likely something like 'Install and Enable' or Continue setup' */
				__(
					'By clicking "%s," you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyPolicyLink}}Privacy Policy{{/privacyPolicyLink}}.',
					'poocommerce'
				),
				buttonText
			),
			components: {
				tosLink: (
					<Link
						href={ 'https://wordpress.com/tos/' }
						target="_blank"
						type="external"
					>
						<></>
					</Link>
				),
				privacyPolicyLink: (
					<Link
						href={ 'https://automattic.com/privacy/' }
						target="_blank"
						type="external"
					>
						<></>
					</Link>
				),
			},
		} ) }
	</Text>
);
