/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { getSetting } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import Block from './block';

export const Edit = ( {
	attributes,
	setAttributes,
}: {
	attributes: {
		className: string;
		showRateAfterTaxName: boolean;
	};
	setAttributes: ( attributes: Record< string, unknown > ) => void;
} ): JSX.Element => {
	const { className, showRateAfterTaxName } = attributes;
	const blockProps = useBlockProps();
	const taxesEnabled = getSetting( 'taxesEnabled' ) as boolean;
	const displayItemizedTaxes = getSetting(
		'displayItemizedTaxes',
		false
	) as boolean;
	const displayCartPricesIncludingTax = getSetting(
		'displayCartPricesIncludingTax',
		false
	) as boolean;
	return (
		<div { ...blockProps }>
			<InspectorControls>
				{ taxesEnabled &&
					displayItemizedTaxes &&
					! displayCartPricesIncludingTax && (
						<PanelBody title={ __( 'Taxes', 'poocommerce' ) }>
							<ToggleControl
								label={ __(
									'Show rate after tax name',
									'poocommerce'
								) }
								help={ __(
									'Show the percentage rate alongside each tax line in the summary.',
									'poocommerce'
								) }
								checked={ showRateAfterTaxName }
								onChange={ () =>
									setAttributes( {
										showRateAfterTaxName:
											! showRateAfterTaxName,
									} )
								}
							/>
						</PanelBody>
					) }
			</InspectorControls>
			<Block
				className={ className }
				showRateAfterTaxName={ showRateAfterTaxName }
			/>
		</div>
	);
};

export const Save = (): JSX.Element => {
	return <div { ...useBlockProps.save() } />;
};
