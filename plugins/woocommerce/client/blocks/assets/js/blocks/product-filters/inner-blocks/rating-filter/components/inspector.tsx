/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	Flex,
	FlexItem,
	RadioControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import RatingStars from './rating-stars';
import type { Attributes } from '../types';

function MinimumRatingLabel( {
	stars,
	ariaLabel,
}: {
	stars: number;
	ariaLabel: string;
} ) {
	return (
		<Flex
			title={ ariaLabel }
			aria-label={ ariaLabel }
			justify="flex-start"
			gap={ 1 }
		>
			<FlexItem>
				<RatingStars stars={ stars } />
			</FlexItem>
			<FlexItem>{ __( '& up', 'poocommerce' ) }</FlexItem>
		</Flex>
	);
}

export const Inspector = ( {
	attributes,
	setAttributes,
}: Pick<
	BlockEditProps< Attributes >,
	'attributes' | 'setAttributes' | 'clientId'
> ) => {
	const { showCounts, minRating } = attributes;

	function setCountVisibility( value: boolean ) {
		setAttributes( {
			showCounts: value,
		} );
	}

	function setMinRating( value: string ) {
		setAttributes( {
			minRating: value,
		} );
	}

	return (
		<InspectorControls key="inspector">
			<ToolsPanel
				label={ __( 'Display', 'poocommerce' ) }
				resetAll={ () => {
					setAttributes( {
						minRating: '0',
						showCounts: false,
					} );
				} }
			>
				<ToolsPanelItem
					hasValue={ () => minRating !== '0' }
					label={ __( 'Minimum rating', 'poocommerce' ) }
					onDeselect={ () => setAttributes( { minRating: '0' } ) }
					isShownByDefault
				>
					<RadioControl
						label={ __( 'Minimum rating', 'poocommerce' ) }
						selected={ minRating }
						className="wc-block-rating-filter__rating-control"
						options={ [
							{
								label: (
									<MinimumRatingLabel
										stars={ 4 }
										ariaLabel={ __(
											'Four stars and up',
											'poocommerce'
										) }
									/>
								),
								value: '4',
							},
							{
								label: (
									<MinimumRatingLabel
										stars={ 3 }
										ariaLabel={ __(
											'Three stars and up',
											'poocommerce'
										) }
									/>
								),
								value: '3',
							},
							{
								label: (
									<MinimumRatingLabel
										stars={ 2 }
										ariaLabel={ __(
											'Two stars and up',
											'poocommerce'
										) }
									/>
								),
								value: '2',
							},
							{
								label: __( 'No limit', 'poocommerce' ),
								value: '0', // no limit
							},
						] }
						onChange={ setMinRating }
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					hasValue={ () => showCounts === true }
					label={ __( 'Product counts', 'poocommerce' ) }
					onDeselect={ () => setAttributes( { showCounts: false } ) }
					isShownByDefault
				>
					<ToggleControl
						label={ __( 'Product counts', 'poocommerce' ) }
						checked={ showCounts }
						onChange={ setCountVisibility }
						__nextHasNoMarginBottom
					/>
				</ToolsPanelItem>
			</ToolsPanel>
		</InspectorControls>
	);
};
