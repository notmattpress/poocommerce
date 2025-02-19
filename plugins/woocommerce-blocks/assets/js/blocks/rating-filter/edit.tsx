/**
 * External dependencies
 */
import { __, _x } from '@wordpress/i18n';
import clsx from 'clsx';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Disabled,
	Notice,
	PanelBody,
	ToggleControl,
	withSpokenMessages,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import Block from './block';
import type { Attributes } from './types';
import './editor.scss';

const noRatingsNotice = (
	<Notice status="warning" isDismissible={ false }>
		<p>
			{ __(
				"Your store doesn't have any products with ratings yet. This filter option will display when a product receives a review.",
				'poocommerce'
			) }
		</p>
	</Notice>
);

const Edit = ( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) => {
	const {
		className,
		displayStyle,
		showCounts,
		showFilterButton,
		selectType,
	} = attributes;

	const blockProps = useBlockProps( {
		className: clsx( 'wc-block-rating-filter', className ),
	} );

	const getInspectorControls = () => {
		return (
			<InspectorControls key="inspector">
				<PanelBody title={ __( 'Display Settings', 'poocommerce' ) }>
					<ToggleControl
						label={ __( 'Display product count', 'poocommerce' ) }
						checked={ showCounts }
						onChange={ () =>
							setAttributes( {
								showCounts: ! showCounts,
							} )
						}
					/>
					<ToggleGroupControl
						label={ __(
							'Allow selecting multiple options?',
							'poocommerce'
						) }
						isBlock
						value={ selectType || 'multiple' }
						onChange={ ( value: string ) =>
							setAttributes( {
								selectType: value,
							} )
						}
						className="wc-block-attribute-filter__multiple-toggle"
					>
						<ToggleGroupControlOption
							value="multiple"
							label={ _x(
								'Multiple',
								'Number of filters',
								'poocommerce'
							) }
						/>
						<ToggleGroupControlOption
							value="single"
							label={ _x(
								'Single',
								'Number of filters',
								'poocommerce'
							) }
						/>
					</ToggleGroupControl>
					<ToggleGroupControl
						label={ __( 'Display Style', 'poocommerce' ) }
						isBlock
						value={ displayStyle }
						onChange={ ( value: string ) =>
							setAttributes( {
								displayStyle: value,
							} )
						}
						className="wc-block-attribute-filter__display-toggle"
					>
						<ToggleGroupControlOption
							value="list"
							label={ __( 'List', 'poocommerce' ) }
						/>
						<ToggleGroupControlOption
							value="dropdown"
							label={ __( 'Dropdown', 'poocommerce' ) }
						/>
					</ToggleGroupControl>
					<ToggleControl
						label={ __(
							"Show 'Apply filters' button",
							'poocommerce'
						) }
						help={ __(
							'Products will update when the button is clicked.',
							'poocommerce'
						) }
						checked={ showFilterButton }
						onChange={ ( value ) =>
							setAttributes( {
								showFilterButton: value,
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>
		);
	};

	return (
		<>
			{ getInspectorControls() }
			{
				<div { ...blockProps }>
					<Disabled>
						<Block
							attributes={ attributes }
							isEditor={ true }
							noRatingsNotice={ noRatingsNotice }
						/>
					</Disabled>
				</div>
			}
		</>
	);
};

export default withSpokenMessages( Edit );
