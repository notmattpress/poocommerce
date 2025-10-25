/**
 * External dependencies
 */
import { useInstanceId } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	createElement,
	Fragment,
	useEffect,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { starEmpty, starFilled } from '@wordpress/icons';
import { cleanForSlug } from '@wordpress/url';
import { Product } from '@poocommerce/data';
import { useWooBlockProps } from '@poocommerce/block-templates';
import clsx from 'clsx';
import {
	Button,
	BaseControl,
	Tooltip,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types for this exist yet.
// eslint-disable-next-line @poocommerce/dependency-group
import {
	useEntityProp,
	useEntityId,
	store as coreStore,
} from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { EditProductLinkModal } from '../../../components/edit-product-link-modal';
import { Label } from '../../../components/label/label';
import { useValidation } from '../../../contexts/validation-context';
import { useProductEdits } from '../../../hooks/use-product-edits';
import useProductEntityProp from '../../../hooks/use-product-entity-prop';
import { ProductEditorBlockEditProps } from '../../../types';
import { AUTO_DRAFT_NAME, getPermalinkParts } from '../../../utils';
import { NameBlockAttributes } from './types';

export function NameBlockEdit( {
	attributes,
	clientId,
}: ProductEditorBlockEditProps< NameBlockAttributes > ) {
	const blockProps = useWooBlockProps( attributes );

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { editEntityRecord, saveEntityRecord } = useDispatch( 'core' );

	const { hasEdit } = useProductEdits();

	const [ showProductLinkEditModal, setShowProductLinkEditModal ] =
		useState( false );

	const productId = useEntityId( 'postType', 'product' );
	const product = useSelect(
		( select ) =>
			// @ts-expect-error getEditedEntityRecord is not typed correctly because we are overriding the type definition. https://github.com/poocommerce/poocommerce/blob/eeaf58e20064d837412d6c455e69cc5a5e2678b4/packages/js/product-editor/typings/index.d.ts#L15-L35
			select( coreStore ).getEditedEntityRecord(
				'postType',
				'product',
				productId
			),
		[ productId ]
	);

	const [ sku, setSku ] = useEntityProp( 'postType', 'product', 'sku' );
	const [ name, setName ] = useEntityProp< string >(
		'postType',
		'product',
		'name'
	);

	const { prefix: permalinkPrefix, suffix: permalinkSuffix } =
		getPermalinkParts( product );

	const {
		ref: nameRef,
		error: nameValidationError,
		validate: validateName,
	} = useValidation< Product >(
		'name',
		async function nameValidator() {
			if ( ! name || name === AUTO_DRAFT_NAME ) {
				return {
					message: __( 'Product name is required.', 'poocommerce' ),
				};
			}

			if ( name.length > 120 ) {
				return {
					message: __(
						'Please enter a product name shorter than 120 characters.',
						'poocommerce'
					),
				};
			}
		},
		[ name ]
	);

	const setSkuIfEmpty = () => {
		if ( sku || nameValidationError ) {
			return;
		}
		setSku( cleanForSlug( name ) );
	};

	const help =
		nameValidationError ??
		( productId &&
			[ 'publish', 'draft' ].includes( product.status ) &&
			permalinkPrefix && (
				<span className="poocommerce-product-form__secondary-text product-details-section__product-link">
					{ __( 'Product link', 'poocommerce' ) }
					:&nbsp;
					<a
						href={ product.permalink }
						target="_blank"
						rel="noreferrer"
					>
						{ permalinkPrefix }
						{ product.slug || cleanForSlug( name ) }
						{ permalinkSuffix }
					</a>
					<Button
						variant="link"
						onClick={ () => setShowProductLinkEditModal( true ) }
					>
						{ __( 'Edit', 'poocommerce' ) }
					</Button>
				</span>
			) );

	const nameControlId = useInstanceId(
		BaseControl,
		'product_name'
	) as string;

	// Select the block initially if it is set to autofocus.
	// (this does not get done automatically by focusing the input)
	const { selectBlock } = useDispatch( 'core/block-editor' );
	useEffect( () => {
		if ( attributes.autoFocus ) {
			selectBlock( clientId );
		}
	}, [] );

	const [ featured, setFeatured ] =
		useProductEntityProp< boolean >( 'featured' );

	function handleSuffixClick() {
		setFeatured( ! featured );
	}

	function renderFeaturedSuffix() {
		const markedText = __( 'Mark as featured', 'poocommerce' );
		const unmarkedText = __( 'Unmark as featured', 'poocommerce' );
		const tooltipText = featured ? unmarkedText : markedText;

		return (
			<Tooltip text={ tooltipText } placement="top">
				{ featured ? (
					<Button
						icon={ starFilled }
						aria-label={ unmarkedText }
						onClick={ handleSuffixClick }
					/>
				) : (
					<Button
						icon={ starEmpty }
						aria-label={ markedText }
						onClick={ handleSuffixClick }
					/>
				) }
			</Tooltip>
		);
	}

	return (
		<>
			<div { ...blockProps }>
				<BaseControl
					id={ nameControlId }
					label={
						<Label label={ __( 'Name', 'poocommerce' ) } required />
					}
					className={ clsx( {
						'has-error': nameValidationError,
					} ) }
					help={ help }
				>
					<InputControl
						id={ nameControlId }
						ref={ nameRef }
						name="name"
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus={ attributes.autoFocus }
						placeholder={ __(
							'e.g. 12 oz Coffee Mug',
							'poocommerce'
						) }
						onChange={ ( nextValue ) => {
							setName( nextValue ?? '' );
						} }
						value={ name && name !== AUTO_DRAFT_NAME ? name : '' }
						autoComplete="off"
						data-1p-ignore
						onBlur={ () => {
							if ( hasEdit( 'name' ) ) {
								setSkuIfEmpty();
								validateName();
							}
						} }
						suffix={ renderFeaturedSuffix() }
					/>
				</BaseControl>

				{ showProductLinkEditModal && (
					<EditProductLinkModal
						permalinkPrefix={ permalinkPrefix || '' }
						permalinkSuffix={ permalinkSuffix || '' }
						product={ product }
						onCancel={ () => setShowProductLinkEditModal( false ) }
						onSaved={ () => setShowProductLinkEditModal( false ) }
						saveHandler={ async ( updatedSlug ) => {
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							const { slug, permalink }: Product =
								await saveEntityRecord( 'postType', 'product', {
									id: product.id,
									slug: updatedSlug,
								} );

							if ( slug && permalink ) {
								editEntityRecord(
									'postType',
									'product',
									product.id,
									{
										slug,
										permalink,
									}
								);

								return {
									slug,
									permalink,
								};
							}
						} }
					/>
				) }
			</div>
		</>
	);
}
