/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Product } from '@poocommerce/data';
import { useEntityProp } from '@wordpress/core-data';
import { recordEvent } from '@poocommerce/tracks';
import { CheckboxControl, PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { VisibilitySectionProps } from './types';
import { TRACKS_SOURCE } from '../../../constants';
import { RequirePassword } from '../../require-password';
import { CatalogVisibility } from '../../catalog-visibility';

export function VisibilitySection( { productType }: VisibilitySectionProps ) {
	const [ catalogVisibility, setCatalogVisibility ] = useEntityProp<
		Product[ 'catalog_visibility' ]
	>( 'postType', productType, 'catalog_visibility' );

	const [ reviewsAllowed, setReviewsAllowed ] = useEntityProp<
		Product[ 'reviews_allowed' ]
	>( 'postType', productType, 'reviews_allowed' );

	const [ postPassword, setPostPassword ] = useEntityProp< string >(
		'postType',
		productType,
		'post_password'
	);

	function getVisibilityLabel() {
		if ( postPassword !== '' ) {
			return __( 'Password protected', 'poocommerce' );
		}
		if ( catalogVisibility === 'hidden' ) {
			return __( 'Hidden', 'poocommerce' );
		}
		return __( 'Public', 'poocommerce' );
	}

	return (
		<PanelBody
			initialOpen={ false }
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore We need to send an Element.
			title={ [
				__( 'Visibility: ', 'poocommerce' ),
				<span className="editor-post-publish-panel__link" key="label">
					{ getVisibilityLabel() }
				</span>,
			] }
		>
			<div className="poocommerce-publish-panel-visibility">
				<fieldset className="poocommerce-publish-panel-visibility__fieldset">
					<legend className="poocommerce-publish-panel-visibility__legend">
						{ __(
							'Control how this product is viewed by customers and other site users.',
							'poocommerce'
						) }
					</legend>
					<CatalogVisibility
						catalogVisibility={ catalogVisibility }
						label={ __( 'Hide in product catalog', 'poocommerce' ) }
						visibility={ 'search' }
						onCheckboxChange={ setCatalogVisibility }
					/>
					<CatalogVisibility
						catalogVisibility={ catalogVisibility }
						label={ __(
							'Hide from search results',
							'poocommerce'
						) }
						visibility={ 'catalog' }
						onCheckboxChange={ setCatalogVisibility }
					/>
					<CheckboxControl
						label={ __( 'Enable product reviews', 'poocommerce' ) }
						checked={ reviewsAllowed }
						onChange={ ( selected: boolean ) => {
							setReviewsAllowed( selected );
							recordEvent( 'product_prepublish_panel', {
								source: TRACKS_SOURCE,
								action: 'enable_product_reviews',
								value: selected,
							} );
						} }
					/>
					<RequirePassword
						label={ __( 'Require a password', 'poocommerce' ) }
						postPassword={ postPassword }
						onInputChange={ setPostPassword }
					/>
				</fieldset>
			</div>
		</PanelBody>
	);
}
