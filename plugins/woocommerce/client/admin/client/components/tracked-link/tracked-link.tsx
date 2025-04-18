/**
 * External dependencies
 */
import { Text } from '@poocommerce/experimental';
import interpolateComponents from '@automattic/interpolate-components';
import { Link } from '@poocommerce/components';
import { recordEvent, ExtraProperties } from '@poocommerce/tracks';

interface TextProps {
	/**
	 * HTML element to use for the Text component. Uses `span` by default.
	 */
	as?: string;
	className?: string;
}

interface TrackedLinkProps {
	textProps?: TextProps;
	/**
	 * The complete translatable string that includes {{Link}} and {{/Link}} placeholders
	 * Example: "Visit the {{Link}}Official PooCommerce Marketplace{{/Link}} to find more tax solutions"
	 */
	message: string;
	eventName?: string;
	eventProperties?: ExtraProperties;
	targetUrl: string;
	linkType?: 'wc-admin' | 'wp-admin' | 'external';
	/**
	 * Optional callback function to be called when the link is clicked
	 * If provided, this will be called instead of the default recordEvent behavior
	 */
	onClickCallback?: () => void;
}

/**
 * A component that renders a link with tracking capabilities.
 */
export const TrackedLink = ( {
	textProps,
	message,
	eventName = '',
	eventProperties = {},
	targetUrl,
	linkType = 'wc-admin',
	onClickCallback,
}: TrackedLinkProps ) => (
	<Text { ...textProps }>
		{ interpolateComponents( {
			mixedString: message,
			components: {
				Link: (
					<Link
						onClick={ () => {
							if ( onClickCallback ) {
								onClickCallback();
							} else {
								recordEvent( eventName, eventProperties );
							}
							window.location.href = targetUrl;
							return false;
						} }
						href={ targetUrl }
						type={ linkType }
					/>
				),
			},
		} ) }
	</Text>
);
