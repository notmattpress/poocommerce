/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { InspectorControls, PlainText } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';

/**
 * Component displaying a product search form.
 *
 * @param {Object}            props                        Incoming props for the component.
 * @param {Object}            props.attributes             Incoming block attributes.
 * @param {string}            props.attributes.label
 * @param {string}            props.attributes.placeholder
 * @param {string}            props.attributes.formId
 * @param {string}            props.attributes.className
 * @param {boolean}           props.attributes.hasLabel
 * @param {string}            props.attributes.align
 * @param {string}            props.instanceId
 * @param {function(any):any} props.setAttributes          Setter for block attributes.
 */
interface EditProps {
	attributes: {
		label: string;
		placeholder: string;
		formId: string;
		className: string;
		hasLabel: boolean;
		align: string;
	};
	instanceId: number;
	setAttributes: ( attributes: {
		label?: string;
		placeholder?: string;
		formId?: string;
		className?: string;
		hasLabel?: boolean;
		align?: string;
	} ) => void;
}
const Edit = ( {
	attributes: { label, placeholder, formId, className, hasLabel, align },
	instanceId,
	setAttributes,
}: EditProps ) => {
	const classes = clsx(
		'wc-block-product-search',
		align ? 'align' + align : '',
		className
	);

	useEffect( () => {
		if ( ! formId ) {
			setAttributes( {
				formId: `wc-block-product-search-${ instanceId }`,
			} );
		}
	}, [ formId, setAttributes, instanceId ] );

	return (
		<>
			<InspectorControls key="inspector">
				<PanelBody title={ __( 'Content', 'poocommerce' ) } initialOpen>
					<ToggleControl
						label={ __( 'Show search field label', 'poocommerce' ) }
						checked={ hasLabel }
						onChange={ () =>
							setAttributes( { hasLabel: ! hasLabel } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div className={ classes }>
				{ !! hasLabel && (
					<>
						<label
							className="screen-reader-text"
							htmlFor="wc-block-product-search__label"
						>
							{ __( 'Search Label', 'poocommerce' ) }
						</label>
						<PlainText
							className="wc-block-product-search__label"
							id="wc-block-product-search__label"
							value={ label }
							onChange={ ( value ) =>
								setAttributes( { label: value } )
							}
							style={ { backgroundColor: 'transparent' } }
						/>
					</>
				) }
				<div className="wc-block-product-search__fields">
					<TextControl
						className="wc-block-product-search__field input-control"
						value={ placeholder }
						placeholder={ __(
							'Enter search placeholder text',
							'poocommerce'
						) }
						onChange={ ( value ) =>
							setAttributes( { placeholder: value } )
						}
					/>
					<button
						type="submit"
						className="wc-block-product-search__button"
						aria-label={ __( 'Search', 'poocommerce' ) }
						onClick={ ( e ) => e.preventDefault() }
						tabIndex={ -1 }
					>
						<svg
							aria-hidden="true"
							role="img"
							focusable="false"
							className="dashicon dashicons-arrow-right-alt2"
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 20 20"
						>
							<path d="M6 15l5-5-5-5 1-2 7 7-7 7z" />
						</svg>
					</button>
				</div>
			</div>
		</>
	);
};

export default withInstanceId( Edit );
