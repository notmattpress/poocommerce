/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Link } from '@poocommerce/components';
import interpolateComponents from '@automattic/interpolate-components';

const ReadBlogMessage = () => {
	return interpolateComponents( {
		mixedString: __(
			'Read {{link}}the PooCommerce blog{{/link}} for more tips on marketing your store',
			'poocommerce'
		),
		components: {
			link: (
				<Link
					type="external"
					href="https://poocommerce.com/blog/marketing/coupons/?utm_medium=product"
					target="_blank"
				/>
			),
		},
	} );
};

export default ReadBlogMessage;
