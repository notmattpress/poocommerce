/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { WooOnboardingTask } from '@poocommerce/onboarding';
import { Text } from '@poocommerce/experimental';
import { registerPlugin } from '@wordpress/plugins';
import { useMemo, useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { getAdminLink } from '@poocommerce/settings';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import { recordEvent } from '@poocommerce/tracks';
import { applyFilters } from '@wordpress/hooks';
import { pluginsStore } from '@poocommerce/data';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './index.scss';
import { getAdminSetting } from '~/utils/admin-settings';
import { getSurfacedProductTypeKeys, getProductTypes } from './utils';
import useProductTypeListItems from './use-product-types-list-items';
import Stack from './stack';
import LoadSampleProductModal from '../components/load-sample-product-modal';
import useLoadSampleProducts from '../components/use-load-sample-products';
import LoadSampleProductConfirmModal from '../components/load-sample-product-confirm-modal';
import useRecordCompletionTime from '../use-record-completion-time';
import {
	SETUP_TASKLIST_PRODUCTS_AFTER_FILTER,
	ImportCSVItem,
	PrintfulAdvertProductPlacement,
	SponsoredProductPlacementType,
} from './constants';
import { TrackedLink } from '~/components/tracked-link/tracked-link';
import { isFeatureEnabled } from '~/utils/features';

const getOnboardingProductType = (): string[] => {
	const onboardingData = getAdminSetting( 'onboarding' );
	return (
		( onboardingData?.profile &&
			onboardingData?.profile.product_types ) || [ 'physical' ]
	);
};

const ViewControlButton = ( {
	isExpanded,
	onClick,
}: {
	isExpanded: boolean;
	onClick: () => void;
} ) => (
	<Button
		className="poocommerce-task-products__button-view-less-product-types"
		onClick={ onClick }
	>
		{ isExpanded
			? __( `View less product types`, 'poocommerce' )
			: __( `View more product types`, 'poocommerce' ) }
		<Icon icon={ isExpanded ? chevronUp : chevronDown } />
	</Button>
);

export const Products = () => {
	const [ isExpanded, setIsExpanded ] = useState< boolean >( false );
	const [
		isConfirmingLoadSampleProducts,
		setIsConfirmingLoadSampleProducts,
	] = useState( false );

	const { installedPlugins, isRequestingPlugins } = useSelect( ( select ) => {
		const { getInstalledPlugins, isPluginsRequesting } =
			select( pluginsStore );
		return {
			isRequestingPlugins: isPluginsRequesting( 'installPlugins' ),
			installedPlugins: getInstalledPlugins(),
		};
	}, [] );

	const surfacedProductTypeKeys = getSurfacedProductTypeKeys(
		getOnboardingProductType()
	);

	const { productTypes, isRequesting } = useProductTypeListItems(
		getProductTypes(),
		surfacedProductTypeKeys
	);
	const { recordCompletionTime } = useRecordCompletionTime( 'products' );

	const productTypesWithTimeRecord = useMemo(
		() =>
			productTypes.map( ( productType ) => ( {
				...productType,
				onClick: (): void => {
					productType.onClick();
					recordCompletionTime();
				},
			} ) ),
		[ recordCompletionTime, productTypes ]
	);

	const { loadSampleProduct, isLoadingSampleProducts } =
		useLoadSampleProducts( {
			redirectUrlAfterSuccess: getAdminLink(
				'edit.php?post_type=product&wc_onboarding_active_task=products'
			),
		} );

	const visibleProductTypes = useMemo( () => {
		const surfacedProductTypes = productTypesWithTimeRecord.filter(
			( productType ) =>
				surfacedProductTypeKeys.includes( productType.key )
		);
		if ( isExpanded ) {
			// To show product types in same order, we need to push the other product types to the end.
			productTypesWithTimeRecord.forEach(
				( productType ) =>
					! surfacedProductTypes.includes( productType ) &&
					surfacedProductTypes.push( productType )
			);
		}
		/**
		 * Can be used to add an item to the end of the Products task list.
		 *
		 * @filter poocommerce_admin_task_products_after
		 * @param {Array.<Object>} productTypes Array of product types.
		 */
		const surfacedProductTypesAndAppendedProducts = applyFilters(
			SETUP_TASKLIST_PRODUCTS_AFTER_FILTER,
			surfacedProductTypes
		) as typeof surfacedProductTypes;
		return surfacedProductTypesAndAppendedProducts;
	}, [ surfacedProductTypeKeys, isExpanded, productTypesWithTimeRecord ] );

	const footerStack = useMemo( () => {
		const importCSVItemWithTimeRecord = {
			...ImportCSVItem,
			onClick: () => {
				ImportCSVItem.onClick();
				recordCompletionTime();
			},
		};

		const options: SponsoredProductPlacementType[] = [
			importCSVItemWithTimeRecord,
		];

		if (
			!! window.wcAdminFeatures?.printful &&
			! isRequestingPlugins &&
			! installedPlugins.includes( 'printful-shipping-for-poocommerce' )
		) {
			options.push( PrintfulAdvertProductPlacement );
		}
		return options;
	}, [ recordCompletionTime, isRequestingPlugins, installedPlugins ] );

	return (
		<div className="poocommerce-task-products">
			<Text
				variant="title"
				as="h2"
				className="poocommerce-task-products__title"
			>
				{ __( 'What product do you want to add?', 'poocommerce' ) }
			</Text>

			<div className="poocommerce-product-content">
				<Stack
					items={ visibleProductTypes }
					onClickLoadSampleProduct={ () =>
						setIsConfirmingLoadSampleProducts( true )
					}
					showOtherOptions={ isExpanded }
					isTaskListItemClicked={ isRequesting }
				/>
				<ViewControlButton
					isExpanded={ isExpanded }
					onClick={ () => {
						if ( ! isExpanded ) {
							recordEvent(
								'tasklist_view_more_product_types_click'
							);
						}
						setIsExpanded( ! isExpanded );
					} }
				/>
				<Stack
					items={ footerStack }
					showOtherOptions={ false }
					isTaskListItemClicked={ isRequesting }
				/>
				<TrackedLink
					textProps={ {
						className: 'poocommerce-products-marketplace-link',
					} }
					message={ __(
						// translators: {{Link}} is a placeholder for a html element.
						'Visit {{Link}}the PooCommerce Marketplace{{/Link}} to enhance your store with additional options such as Subscriptions, Gift Cards, and more.',
						'poocommerce'
					) }
					eventName="tasklist_add_product_visit_marketplace_click"
					targetUrl={
						isFeatureEnabled( 'marketplace' )
							? getAdminLink(
									'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=merchandising'
							  )
							: 'https://poocommerce.com/product-category/poocommerce-extensions/merchandising/'
					}
					linkType={
						isFeatureEnabled( 'marketplace' )
							? 'wc-admin'
							: 'external'
					}
				/>
			</div>
			{ isLoadingSampleProducts ? (
				<LoadSampleProductModal />
			) : (
				isConfirmingLoadSampleProducts && (
					<LoadSampleProductConfirmModal
						onCancel={ () => {
							setIsConfirmingLoadSampleProducts( false );
							recordEvent(
								'tasklist_cancel_load_sample_products_click'
							);
						} }
						onImport={ () => {
							setIsConfirmingLoadSampleProducts( false );
							loadSampleProduct();
						} }
					/>
				)
			) }
		</div>
	);
};

const ProductsFill = () => {
	return (
		<WooOnboardingTask id="products">
			<Products />
		</WooOnboardingTask>
	);
};

registerPlugin( 'wc-admin-onboarding-task-products', {
	scope: 'poocommerce-tasks',
	render: () => <ProductsFill />,
} );
