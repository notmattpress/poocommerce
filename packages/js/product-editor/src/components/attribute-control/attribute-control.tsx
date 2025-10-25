/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	useState,
	createElement,
	Fragment,
	createInterpolateElement,
} from '@wordpress/element';
import { Button, Notice } from '@wordpress/components';
import { ProductProductAttribute } from '@poocommerce/data';
import {
	Sortable,
	__experimentalSelectControlMenuSlot as SelectControlMenuSlot,
	Link,
} from '@poocommerce/components';
import { getAdminLink } from '@poocommerce/settings';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { EditAttributeModal } from './edit-attribute-modal';
import { EnhancedProductAttribute } from '../../hooks/use-product-attributes';
import {
	getAttributeId,
	getAttributeKey,
	reorderSortableProductAttributePositions,
} from './utils';
import { AttributeListItem } from '../attribute-list-item';
import { NewAttributeModal } from './new-attribute-modal';
import { RemoveConfirmationModal } from '../remove-confirmation-modal';
import { TRACKS_SOURCE } from '../../constants';
import { EmptyState } from '../empty-state';
import { SectionActions } from '../block-slot-fill';
import { AttributeControlProps } from './types';
import { getEmptyStateSequentialNames } from '../../utils';

export const AttributeControl = ( {
	value,
	onAdd = () => {},
	onAddAnother = () => {},
	onRemoveItem = () => {},
	onChange,
	onEdit = () => {},
	onNewModalCancel = () => {},
	onNewModalClose = () => {},
	onNewModalOpen = () => {},
	onEditModalCancel = () => {},
	onEditModalClose = () => {},
	onEditModalOpen = () => {},
	onRemove = () => {},
	onRemoveCancel = () => {},
	onNoticeDismiss = () => {},
	renderCustomEmptyState,
	uiStrings,
	createNewAttributesAsGlobal = false,
	useRemoveConfirmationModal = false,
	disabledAttributeIds = [],
	termsAutoSelection,
	defaultVisibility = false,
}: AttributeControlProps ) => {
	uiStrings = {
		newAttributeListItemLabel: __( 'Add new', 'poocommerce' ),
		globalAttributeHelperMessage: __(
			`You can change the attribute's name in <link>Attributes</link>.`,
			'poocommerce'
		),
		attributeRemoveConfirmationMessage: __(
			'Remove this attribute?',
			'poocommerce'
		),
		...uiStrings,
	};
	const [ isNewModalVisible, setIsNewModalVisible ] = useState( false );
	const [ defaultAttributeSearch, setDefaultAttributeSearch ] =
		useState< string >();
	const [ removingAttribute, setRemovingAttribute ] =
		useState< null | ProductProductAttribute >();
	const [ currentAttributeId, setCurrentAttributeId ] = useState<
		null | string
	>( null );

	const handleChange = ( newAttributes: EnhancedProductAttribute[] ) => {
		onChange(
			newAttributes.map( ( attr ) => {
				return {
					...attr,
					options: attr.terms
						? attr.terms.map( ( term ) => term.name )
						: ( attr.options as string[] ),
					terms: undefined,
					visible: attr.visible || false,
				};
			} )
		);
	};

	const handleRemove = ( attribute: ProductProductAttribute ) => {
		handleChange(
			value.filter(
				( attr ) =>
					getAttributeId( attr ) !== getAttributeId( attribute )
			)
		);
		onRemove( attribute );
		setRemovingAttribute( null );
	};

	const showRemoveConfirmation = ( attribute: ProductProductAttribute ) => {
		if ( useRemoveConfirmationModal ) {
			setRemovingAttribute( attribute );
			return;
		}
		// eslint-disable-next-line no-alert
		if ( window.confirm( uiStrings?.attributeRemoveConfirmationMessage ) ) {
			handleRemove( attribute );
			return;
		}
		onRemoveCancel( attribute );
	};

	const openNewModal = () => {
		setIsNewModalVisible( true );
		onNewModalOpen();
	};

	const closeNewModal = () => {
		setIsNewModalVisible( false );
		setDefaultAttributeSearch( undefined );
		onNewModalClose();
	};

	const openEditModal = ( attribute: ProductProductAttribute ) => {
		recordEvent( 'product_options_edit', {
			source: TRACKS_SOURCE,
			attribute: attribute.name,
		} );
		setCurrentAttributeId( getAttributeId( attribute ) );
		onEditModalOpen( attribute );
	};

	const closeEditModal = ( attribute: ProductProductAttribute ) => {
		setCurrentAttributeId( null );
		onEditModalClose( attribute );
	};

	const handleAdd = ( newAttributes: EnhancedProductAttribute[] ) => {
		const addedAttributesOnly = newAttributes.filter(
			( newAttr ) =>
				! value.some(
					( current: ProductProductAttribute ) =>
						getAttributeId( newAttr ) === getAttributeId( current )
				)
		);
		handleChange( [ ...value, ...addedAttributesOnly ] );
		onAdd( newAttributes );
		closeNewModal();
	};

	const handleEdit = ( updatedAttribute: EnhancedProductAttribute ) => {
		recordEvent( 'product_options_update', {
			source: TRACKS_SOURCE,
			attribute: updatedAttribute.name,
			values: updatedAttribute.terms?.map( ( term ) => term.name ),
			default: updatedAttribute.isDefault,
			visible: updatedAttribute.visible,
			filter: true, // default true until attribute filter gets implemented
		} );

		const updatedAttributes = value.map( ( attr ) => {
			if (
				getAttributeId( attr ) === getAttributeId( updatedAttribute )
			) {
				return updatedAttribute;
			}

			return attr;
		} );

		onEdit( updatedAttribute );
		handleChange( updatedAttributes );
		closeEditModal( updatedAttribute );
	};

	const sortedAttributes = value.sort( ( a, b ) => a.position - b.position );

	const attributeKeyValues = value.reduce(
		(
			keyValue: Record< number | string, ProductProductAttribute >,
			attribute: ProductProductAttribute
		) => {
			keyValue[ getAttributeKey( attribute ) ] = attribute;
			return keyValue;
		},
		{} as Record< number | string, ProductProductAttribute >
	);

	const currentAttribute = value.find(
		( attr ) => getAttributeId( attr ) === currentAttributeId
	);

	function renderEmptyState() {
		if ( value.length ) return null;

		if ( renderCustomEmptyState ) {
			return renderCustomEmptyState( {
				addAttribute( search ) {
					setDefaultAttributeSearch( search );
					openNewModal();
				},
			} );
		}

		return (
			<EmptyState
				names={ getEmptyStateSequentialNames(
					__( 'Attribute', 'poocommerce' ),
					3
				) }
			/>
		);
	}

	function renderSectionActions() {
		if ( renderCustomEmptyState && value.length === 0 ) return null;

		return (
			<SectionActions>
				{ uiStrings?.newAttributeListItemLabel && (
					<Button
						variant="secondary"
						className="poocommerce-add-attribute-list-item__add-button"
						onClick={ openNewModal }
					>
						{ uiStrings.newAttributeListItemLabel }
					</Button>
				) }
			</SectionActions>
		);
	}

	return (
		<div className="poocommerce-attribute-field">
			{ renderSectionActions() }

			{ uiStrings.notice && (
				<Notice
					isDismissible={ true }
					status="warning"
					className="poocommerce-attribute-field__notice"
					onRemove={ onNoticeDismiss }
				>
					<p>{ uiStrings.notice }</p>
				</Notice>
			) }
			{ Boolean( value.length ) && (
				<Sortable
					onOrderChange={ ( items ) => {
						const itemPositions = items.reduce(
							( positions, { props }, index ) => {
								positions[
									getAttributeKey( props.attribute )
								] = index;
								return positions;
							},
							{} as Record< number | string, number >
						);
						onChange(
							reorderSortableProductAttributePositions(
								itemPositions,
								attributeKeyValues
							)
						);
					} }
				>
					{ sortedAttributes.map( ( attr ) => (
						<AttributeListItem
							attribute={ attr }
							removeLabel={ uiStrings?.attributeRemoveLabel }
							key={ getAttributeId( attr ) }
							onEditClick={ () => openEditModal( attr ) }
							onRemoveClick={ () =>
								showRemoveConfirmation( attr )
							}
						/>
					) ) }
				</Sortable>
			) }

			{ isNewModalVisible && (
				<NewAttributeModal
					title={ uiStrings.newAttributeModalTitle }
					description={ uiStrings.newAttributeModalDescription }
					onCancel={ () => {
						closeNewModal();
						onNewModalCancel();
					} }
					onAdd={ handleAdd }
					onAddAnother={ onAddAnother }
					onRemoveItem={ onRemoveItem }
					selectedAttributeIds={ value.map( ( attr ) => attr.id ) }
					createNewAttributesAsGlobal={ createNewAttributesAsGlobal }
					disabledAttributeIds={ disabledAttributeIds }
					disabledAttributeMessage={
						uiStrings.disabledAttributeMessage
					}
					termsAutoSelection={ termsAutoSelection }
					defaultVisibility={ defaultVisibility }
					defaultSearch={ defaultAttributeSearch }
				/>
			) }
			<SelectControlMenuSlot />
			{ currentAttribute && (
				<EditAttributeModal
					title={ sprintf(
						/* translators: %s is the attribute name */
						__( 'Edit %s', 'poocommerce' ),
						currentAttribute.name
					) }
					customAttributeHelperMessage={
						uiStrings.customAttributeHelperMessage
					}
					globalAttributeHelperMessage={
						uiStrings.globalAttributeHelperMessage
							? createInterpolateElement(
									uiStrings.globalAttributeHelperMessage,
									{
										link: (
											<Link
												href={ getAdminLink(
													'edit.php?post_type=product&page=product_attributes'
												) }
												target="_blank"
												type="wp-admin"
											>
												<></>
											</Link>
										),
									}
							  )
							: undefined
					}
					onCancel={ () => {
						closeEditModal( currentAttribute );
						onEditModalCancel( currentAttribute );
					} }
					onEdit={ ( updatedAttribute ) => {
						handleEdit( updatedAttribute );
					} }
					attribute={ currentAttribute }
					attributes={ value }
				/>
			) }
			{ removingAttribute && (
				<RemoveConfirmationModal
					title={ sprintf(
						/* translators: %s is the attribute name that is being removed */
						__( 'Delete %(attributeName)s', 'poocommerce' ),
						{ attributeName: removingAttribute.name }
					) }
					description={
						<p>
							{
								uiStrings.attributeRemoveConfirmationModalMessage
							}
						</p>
					}
					onRemove={ () => handleRemove( removingAttribute ) }
					onCancel={ () => {
						onRemoveCancel( removingAttribute );
						setRemovingAttribute( null );
					} }
				/>
			) }
			{ renderEmptyState() }
		</div>
	);
};
