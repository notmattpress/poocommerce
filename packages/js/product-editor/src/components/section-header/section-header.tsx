/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { __experimentalTooltip as Tooltip } from '@poocommerce/components';
import { sanitizeHTML } from '@poocommerce/sanitize';

/**
 * Internal dependencies
 */
import { SectionHeaderProps } from './types';
import { BlockSlot } from '../block-slot-fill';

export function SectionHeader( {
	description,
	sectionTagName,
	title,
}: SectionHeaderProps ) {
	const HeadingTagName = sectionTagName === 'fieldset' ? 'legend' : 'div';

	return (
		<HeadingTagName className="wp-block-poocommerce-product-section-header__heading">
			<div className="wp-block-poocommerce-product-section-header__heading-title-wrapper">
				<h2 className="wp-block-poocommerce-product-section-header__heading-title">
					{ title }
					{ description && (
						<Tooltip
							className="wp-block-poocommerce-product-section-header__heading-tooltip"
							text={
								<p
									className="wp-block-poocommerce-product-section-header__heading-description"
									dangerouslySetInnerHTML={ {
										__html: sanitizeHTML( description ),
									} }
								/>
							}
							position={ 'bottom center' }
							helperText={ __(
								'View helper text',
								'poocommerce'
							) }
						/>
					) }
				</h2>

				<div className="wp-block-poocommerce-product-section-header__actions">
					<BlockSlot name={ `section-actions` } />
				</div>
			</div>
			<BlockSlot name={ `section-description` } />
		</HeadingTagName>
	);
}
