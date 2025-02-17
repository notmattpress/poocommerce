/**
 * External dependencies
 */
import { WooHeaderItem, useAdminSidebarWidth } from '@poocommerce/admin-layout';
import { useEntityId, useEntityRecord } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import {
	createElement,
	useContext,
	useEffect,
	Fragment,
	lazy,
	Suspense,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Tooltip } from '@wordpress/components';
import { box, chevronLeft, group, Icon } from '@wordpress/icons';
import { getNewPath, navigateTo } from '@poocommerce/navigation';
import { recordEvent } from '@poocommerce/tracks';
import classNames from 'classnames';
import { Tag } from '@poocommerce/components';
import { Product } from '@poocommerce/data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types for this exist yet.
// eslint-disable-next-line @poocommerce/dependency-group
import { PinnedItems } from '@wordpress/interface';

/**
 * Internal dependencies
 */
import { EditorLoadingContext } from '../../contexts/editor-loading-context';
import { getHeaderTitle } from '../../utils';
import { MoreMenu } from './more-menu';
import { PreviewButton } from './preview-button';
import { SaveDraftButton } from './save-draft-button';
import { LoadingState } from './loading-state';
import { Tabs } from '../tabs';
import { HEADER_PINNED_ITEMS_SCOPE, TRACKS_SOURCE } from '../../constants';
import { useShowPrepublishChecks } from '../../hooks/use-show-prepublish-checks';
import { HeaderProps, Image } from './types';

const PublishButton = lazy( () =>
	import( './publish-button' ).then( ( module ) => ( {
		default: module.PublishButton,
	} ) )
);

const RETURN_TO_MAIN_PRODUCT = __(
	'Return to the main product',
	'poocommerce'
);

export function Header( {
	onTabSelect,
	productType = 'product',
	selectedTab,
}: HeaderProps ) {
	const isEditorLoading = useContext( EditorLoadingContext );

	const productId = useEntityId( 'postType', productType );

	const { editedRecord: product } = useEntityRecord< Product >(
		'postType',
		productType,
		productId,
		{ enabled: productId !== -1 }
	);

	const lastPersistedProduct = useSelect(
		( select ) => {
			const { getEntityRecord } = select( 'core' );
			return productId !== -1
				? // @ts-expect-error getEntityRecord is not typed correctly.
				  getEntityRecord( 'postType', productType, productId )
				: null;
		},
		[ productType, productId ]
	);

	const editedProductName = product?.name;
	const catalogVisibility = product?.catalog_visibility;
	const productStatus = product?.status;

	const { showPrepublishChecks } = useShowPrepublishChecks();

	const sidebarWidth = useAdminSidebarWidth();

	useEffect( () => {
		document
			.querySelectorAll( '.interface-interface-skeleton__header' )
			.forEach( ( el ) => {
				if ( ( el as HTMLElement ).style ) {
					( el as HTMLElement ).style.width =
						'calc(100% - ' + sidebarWidth + 'px)';
					( el as HTMLElement ).style.left = sidebarWidth + 'px';
				}
			} );
	}, [ sidebarWidth ] );

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const isVariation = lastPersistedProduct?.parent_id > 0;

	const selectedImage = isVariation ? product?.image : product?.images;

	if ( isEditorLoading ) {
		return <LoadingState />;
	}

	const isHeaderImageVisible =
		( ! isVariation &&
			Array.isArray( selectedImage ) &&
			selectedImage.length > 0 ) ||
		( isVariation && selectedImage );

	function getImagePropertyValue(
		image: Image | Image[],
		prop: 'alt' | 'src'
	): string {
		if ( Array.isArray( image ) ) {
			return image[ 0 ][ prop ] || '';
		}
		return image[ prop ] || '';
	}

	function getVisibilityTags() {
		const tags = [];
		if ( productStatus === 'draft' ) {
			tags.push(
				<Tag
					key={ 'draft-tag' }
					label={ __( 'Draft', 'poocommerce' ) }
				/>
			);
		}
		if ( productStatus === 'future' ) {
			tags.push(
				<Tag
					key={ 'scheduled-tag' }
					label={ __( 'Scheduled', 'poocommerce' ) }
				/>
			);
		}
		if (
			( productStatus !== 'future' && catalogVisibility === 'hidden' ) ||
			( isVariation && productStatus === 'private' )
		) {
			tags.push(
				<Tag
					key={ 'hidden-tag' }
					label={ __( 'Hidden', 'poocommerce' ) }
				/>
			);
		}
		return tags;
	}

	return (
		<div
			className="poocommerce-product-header"
			role="region"
			aria-label={ __( 'Product Editor top bar.', 'poocommerce' ) }
			tabIndex={ -1 }
		>
			<div className="poocommerce-product-header__inner">
				{ isVariation ? (
					<div className="poocommerce-product-header__back">
						<Tooltip
							// @ts-expect-error className is missing in TS, should remove this when it is included.
							className="poocommerce-product-header__back-tooltip"
							text={ RETURN_TO_MAIN_PRODUCT }
						>
							<div className="poocommerce-product-header__back-tooltip-wrapper">
								<Button
									icon={ chevronLeft }
									isTertiary={ true }
									onClick={ () => {
										recordEvent(
											'product_variation_back_to_main_product',
											{
												source: TRACKS_SOURCE,
											}
										);
										const url = getNewPath(
											{ tab: 'variations' },
											`/product/${ lastPersistedProduct?.parent_id }`
										);
										navigateTo( { url } );
									} }
								>
									{ __( 'Main product', 'poocommerce' ) }
								</Button>
							</div>
						</Tooltip>
					</div>
				) : (
					<div />
				) }

				<div
					className={ classNames(
						'poocommerce-product-header-title-bar',
						{
							'is-variation': isVariation,
						}
					) }
				>
					<div className="poocommerce-product-header-title-bar__image">
						{ isHeaderImageVisible ? (
							<img
								alt={ getImagePropertyValue(
									selectedImage,
									'alt'
								) }
								src={ getImagePropertyValue(
									selectedImage,
									'src'
								) }
								className="poocommerce-product-header-title-bar__product-image"
							/>
						) : (
							<Icon icon={ isVariation ? group : box } />
						) }
					</div>
					<h1 className="poocommerce-product-header__title">
						{ isVariation ? (
							<>
								{ lastPersistedProduct?.name }
								<span className="poocommerce-product-header__variable-product-id">
									# { lastPersistedProduct?.id }
								</span>
							</>
						) : (
							getHeaderTitle(
								editedProductName,
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore - Arg is not typed correctly.
								lastPersistedProduct?.name
							)
						) }
						<div className="poocommerce-product-header__visibility-tags">
							{ getVisibilityTags() }
						</div>
					</h1>
				</div>

				<div className="poocommerce-product-header__actions">
					{ ! isVariation && (
						<SaveDraftButton
							productType={ productType }
							visibleTab={ selectedTab }
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore - Prop is not typed correctly.
							productStatus={ lastPersistedProduct?.status }
						/>
					) }

					<PreviewButton
						productType={ productType }
						visibleTab={ selectedTab }
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore - Prop is not typed correctly.
						productStatus={ lastPersistedProduct?.status }
					/>

					<Suspense fallback={ null }>
						<PublishButton
							productType={ productType }
							isPrePublishPanelVisible={ showPrepublishChecks }
							isMenuButton
							visibleTab={ selectedTab }
						/>
					</Suspense>

					<WooHeaderItem.Slot name="product" />
					<PinnedItems.Slot scope={ HEADER_PINNED_ITEMS_SCOPE } />
					<MoreMenu />
				</div>
			</div>
			<Tabs selected={ selectedTab } onChange={ onTabSelect } />
		</div>
	);
}
