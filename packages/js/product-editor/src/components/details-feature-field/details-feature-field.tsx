/**
 * External dependencies
 */
import { CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	useFormContext,
	Link,
	__experimentalTooltip as Tooltip,
} from '@poocommerce/components';
import { Product } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import {
	createElement,
	Fragment,
	createInterpolateElement,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getCheckboxTracks } from '../../utils';
import { PRODUCT_DETAILS_SLUG } from '../../constants';

export const DetailsFeatureField = () => {
	const { getCheckboxControlProps } = useFormContext< Product >();

	return (
		<CheckboxControl
			// @ts-expect-error label type is wrong
			label={
				<>
					{ __( 'Feature this product', 'poocommerce' ) }
					<Tooltip
						text={ createInterpolateElement(
							__(
								'Include this product in a featured section on your website with a widget or shortcode. <moreLink />',
								'poocommerce'
							),
							{
								moreLink: (
									<Link
										href="https://poocommerce.com/document/poocommerce-shortcodes/#products"
										target="_blank"
										type="external"
										onClick={ () =>
											recordEvent(
												'add_product_learn_more',
												{
													category:
														PRODUCT_DETAILS_SLUG,
												}
											)
										}
									>
										{ __( 'Learn more', 'poocommerce' ) }
									</Link>
								),
							}
						) }
					/>
				</>
			}
			{ ...getCheckboxControlProps(
				'featured',
				getCheckboxTracks( 'featured' )
			) }
		/>
	);
};
