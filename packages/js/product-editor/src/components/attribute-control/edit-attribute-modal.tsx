/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	Modal,
	CheckboxControl,
	TextControl,
} from '@wordpress/components';
import { useState, createElement, Fragment, useMemo } from '@wordpress/element';
import {
	__experimentalTooltip as Tooltip,
	__experimentalSelectControlMenuSlot as SelectControlMenuSlot,
} from '@poocommerce/components';

/**
 * Internal dependencies
 */
import {
	AttributeTermInputField,
	CustomAttributeTermInputField,
} from '../attribute-term-input-field';
import { EnhancedProductAttribute } from '../../hooks/use-product-attributes';
import { Notice } from '../notice';
import { getAttributeId } from './utils';

type EditAttributeModalProps = {
	title?: string;
	nameLabel?: string;
	globalAttributeHelperMessage?: JSX.Element;
	customAttributeHelperMessage?: string;
	termsLabel?: string;
	termsPlaceholder?: string;
	isDefaultLabel?: string;
	isDefaultTooltip?: string;
	useAsFilterLabel?: string;
	useAsFilterTooltip?: string;
	visibleLabel?: string;
	visibleTooltip?: string;
	cancelAccessibleLabel?: string;
	cancelLabel?: string;
	updateAccessibleLabel?: string;
	updateLabel?: string;
	onCancel: () => void;
	onEdit: ( alteredAttribute: EnhancedProductAttribute ) => void;
	attribute: EnhancedProductAttribute;
	attributes: EnhancedProductAttribute[];
};

export const EditAttributeModal: React.FC< EditAttributeModalProps > = ( {
	title = __( 'Edit attribute', 'poocommerce' ),
	nameLabel = __( 'Name', 'poocommerce' ),
	globalAttributeHelperMessage,
	customAttributeHelperMessage = __(
		'Your customers will see this on the product page',
		'poocommerce'
	),
	termsLabel = __( 'Values', 'poocommerce' ),
	termsPlaceholder = __( 'Search or create value', 'poocommerce' ),
	isDefaultLabel = __( 'Set default value', 'poocommerce' ),
	isDefaultTooltip = __(
		'Check to preselect the first choice when customers enter the product page.',
		'poocommerce'
	),
	useAsFilterLabel = __( 'Use as filter', 'poocommerce' ),
	useAsFilterTooltip = __(
		'Check to allow customers to search and filter by this option in your store.',
		'poocommerce'
	),
	visibleLabel = __( 'Show in product details', 'poocommerce' ),
	visibleTooltip = __(
		'Check to show this option and its values in the product details section on the product page.',
		'poocommerce'
	),
	cancelAccessibleLabel = __( 'Cancel', 'poocommerce' ),
	cancelLabel = __( 'Cancel', 'poocommerce' ),
	updateAccessibleLabel = __( 'Edit attribute', 'poocommerce' ),
	updateLabel = __( 'Update', 'poocommerce' ),
	onCancel,
	onEdit,
	attribute,
	attributes,
} ) => {
	const [ editableAttribute, setEditableAttribute ] = useState<
		EnhancedProductAttribute | undefined
	>( { ...attribute } );

	const isCustomAttribute = editableAttribute?.id === 0;

	const { additions, deletions } = useMemo( () => {
		if ( ! attribute.variation ) {
			return {};
		}

		const variationsSubTotal = attributes
			.filter(
				( otherAttribute ) =>
					getAttributeId( otherAttribute ) !==
					getAttributeId( attribute )
			)
			.reduce(
				( subTotal, { terms } ) => subTotal * ( terms?.length ?? 1 ),
				1
			);

		const currentAttributeTermsCount = attribute.terms?.length ?? 0;
		const variationsTotal = variationsSubTotal * currentAttributeTermsCount;

		const addedTermsCount =
			editableAttribute?.terms?.filter(
				( editedTerm ) =>
					! attribute.terms?.some(
						( currentTerm ) => currentTerm.id === editedTerm.id
					)
			)?.length ?? 0;
		const addedTermsTotal =
			currentAttributeTermsCount + addedTermsCount || 1;

		const remainedTermsCount =
			attribute.terms?.filter( ( currentTerm ) =>
				editableAttribute?.terms?.some(
					( editedTerm ) => currentTerm.id === editedTerm.id
				)
			)?.length ?? 0;

		return {
			additions: Math.abs(
				variationsTotal - variationsSubTotal * addedTermsTotal
			),
			deletions: Math.abs(
				variationsTotal - variationsSubTotal * remainedTermsCount
			),
		};
	}, [ attributes, attribute, editableAttribute ] );

	function getNoticeMessage() {
		const additionsMessage = sprintf(
			// translators: %d is the amount of variations to be added
			__( '%d variations will be added', 'poocommerce' ),
			additions
		);
		const deletionsMessage = sprintf(
			// translators: %d is the amount of variations to be removed
			__( '%d variations will be removed', 'poocommerce' ),
			deletions
		);
		if ( additions && deletions ) {
			return sprintf( '%1$s, %2$s.', additionsMessage, deletionsMessage );
		} else if ( additions ) {
			return sprintf( '%s.', additionsMessage );
		}
		return sprintf( '%s.', deletionsMessage );
	}

	return (
		<>
			<Modal
				title={ title }
				onRequestClose={ () => onCancel() }
				className="poocommerce-edit-attribute-modal"
			>
				<div className="poocommerce-edit-attribute-modal__body">
					<TextControl
						label={ nameLabel }
						disabled={ ! isCustomAttribute }
						value={
							editableAttribute?.name
								? editableAttribute?.name
								: ''
						}
						onChange={ ( val ) =>
							setEditableAttribute( {
								...( editableAttribute as EnhancedProductAttribute ),
								name: val,
							} )
						}
					/>
					<p className="poocommerce-edit-attribute-modal__helper-text">
						{ ! isCustomAttribute
							? globalAttributeHelperMessage
							: customAttributeHelperMessage }
					</p>
					{ attribute.terms ? (
						<AttributeTermInputField
							label={ termsLabel }
							placeholder={
								editableAttribute?.terms &&
								editableAttribute?.terms.length > 0
									? ''
									: termsPlaceholder
							}
							value={ editableAttribute?.terms }
							attributeId={ editableAttribute?.id }
							onChange={ ( val ) => {
								setEditableAttribute( {
									...( editableAttribute as EnhancedProductAttribute ),
									terms: val,
								} );
							} }
						/>
					) : (
						<CustomAttributeTermInputField
							label={ termsLabel }
							placeholder={
								editableAttribute?.options &&
								editableAttribute?.options.length > 0
									? ''
									: termsPlaceholder
							}
							disabled={ ! attribute?.name }
							value={ editableAttribute?.options }
							onChange={ ( val ) => {
								setEditableAttribute( {
									...( editableAttribute as EnhancedProductAttribute ),
									options: val,
								} );
							} }
						/>
					) }

					<div className="poocommerce-edit-attribute-modal__options">
						{ attribute.variation && (
							<div className="poocommerce-edit-attribute-modal__option-container">
								<CheckboxControl
									onChange={ ( checked ) =>
										setEditableAttribute( {
											...( editableAttribute as EnhancedProductAttribute ),
											isDefault: checked,
										} )
									}
									checked={ editableAttribute?.isDefault }
									label={ isDefaultLabel }
								/>
								<Tooltip
									className="poocommerce-edit-attribute-modal__tooltip-set-default-value"
									text={ isDefaultTooltip }
								/>
							</div>
						) }

						<div className="poocommerce-edit-attribute-modal__option-container">
							<CheckboxControl
								onChange={ ( val ) =>
									setEditableAttribute( {
										...( editableAttribute as EnhancedProductAttribute ),
										visible: val,
									} )
								}
								checked={ editableAttribute?.visible }
								label={ visibleLabel }
							/>
							<Tooltip
								className="poocommerce-edit-attribute-modal__tooltip-show-in-product-details"
								text={ visibleTooltip }
							/>
						</div>
						{ attribute.id !== 0 && (
							/* Only supported for global attributes, and disabled for now as the 'Filter by Attributes' block does not support this yet. */
							<div className="poocommerce-edit-attribute-modal__option-container">
								<CheckboxControl
									disabled={ true }
									onChange={ () => {
										// Disabled.
									} }
									checked={ true }
									label={ useAsFilterLabel }
								/>
								<Tooltip
									className="poocommerce-edit-attribute-modal__tooltip-use-as-filter"
									text={ useAsFilterTooltip }
								/>
							</div>
						) }
					</div>

					{ Boolean( additions || deletions ) && (
						<Notice>{ getNoticeMessage() }</Notice>
					) }
				</div>
				<div className="poocommerce-edit-attribute-modal__buttons">
					<Button
						isSecondary
						label={ cancelAccessibleLabel }
						onClick={ () => onCancel() }
					>
						{ cancelLabel }
					</Button>
					<Button
						isPrimary
						label={ updateAccessibleLabel }
						onClick={ () => {
							onEdit(
								editableAttribute as EnhancedProductAttribute
							);
						} }
					>
						{ updateLabel }
					</Button>
				</div>
			</Modal>
			<SelectControlMenuSlot />
		</>
	);
};
