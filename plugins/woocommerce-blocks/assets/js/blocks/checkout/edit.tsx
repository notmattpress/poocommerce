/**
 * External dependencies
 */
import clsx from 'clsx';
import {
	InnerBlocks,
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { SidebarLayout } from '@poocommerce/base-components/sidebar-layout';
import { CheckoutProvider, EditorProvider } from '@poocommerce/base-context';
import {
	previewCart,
	previewSavedPaymentMethods,
} from '@poocommerce/resource-previews';
import { SlotFillProvider } from '@poocommerce/blocks-checkout';
import type { TemplateArray } from '@wordpress/blocks';
import { useEffect, useRef } from '@wordpress/element';
import { getQueryArg } from '@wordpress/url';
import { dispatch, select as selectData, useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { defaultFields as defaultFieldsSetting } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import './inner-blocks';
import './styles/editor.scss';
import {
	addClassToBody,
	BlockSettings,
	useBlockPropsWithLocking,
} from '../cart-checkout-shared';
import '../cart-checkout-shared/sidebar-notices';
import { CheckoutBlockContext } from './context';
import type { Attributes } from './types';

// This is adds a class to body to signal if the selected block is locked
addClassToBody();

// Array of allowed block names.
const ALLOWED_BLOCKS: string[] = [
	'poocommerce/checkout-fields-block',
	'poocommerce/checkout-totals-block',
];

export const Edit = ( {
	clientId,
	attributes,
	setAttributes,
}: {
	clientId: string;
	attributes: Attributes;
	setAttributes: ( attributes: Record< string, unknown > ) => undefined;
} ): JSX.Element => {
	const {
		showOrderNotes,
		showPolicyLinks,
		showReturnToCart,
		showRateAfterTaxName,
		cartPageId,
		isPreview = false,
		showFormStepNumbers = false,
		hasDarkControls = false,
	} = attributes;

	const defaultFields = useSelect( ( select ) => {
		const settings = select(
			coreStore as unknown as string
		).getEditedEntityRecord( 'root', 'site' ) as Record< string, string >;

		const fieldsWithDefaults = {
			phone: 'optional',
			company: 'hidden',
			address_2: 'optional',
		} as const;

		return {
			...defaultFieldsSetting,
			...Object.fromEntries(
				Object.entries( fieldsWithDefaults ).map(
					( [ field, defaultValue ] ) => {
						const value =
							settings[
								`poocommerce_checkout_${ field }_field`
							] || defaultValue;
						return [
							field,
							{
								...defaultFieldsSetting[ field ],
								required: value === 'required',
								hidden: value === 'hidden',
							},
						];
					}
				)
			),
		};
	} );

	// This focuses on the block when a certain query param is found. This is used on the link from the task list.
	const focus = useRef( getQueryArg( window.location.href, 'focus' ) );

	useEffect( () => {
		if (
			focus.current === 'checkout' &&
			! selectData( 'core/block-editor' ).hasSelectedBlock()
		) {
			dispatch( 'core/block-editor' ).selectBlock( clientId );
			dispatch( 'core/interface' ).enableComplementaryArea(
				'core/edit-site',
				'edit-site/block-inspector'
			);
		}
	}, [ clientId ] );

	const defaultTemplate = [
		[ 'poocommerce/checkout-totals-block', {}, [] ],
		[ 'poocommerce/checkout-fields-block', {}, [] ],
	] as TemplateArray;

	const blockProps = useBlockPropsWithLocking();
	return (
		<div { ...blockProps }>
			<InspectorControls>
				<BlockSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>
			<EditorProvider
				isPreview={ !! isPreview }
				previewData={ {
					previewCart,
					previewSavedPaymentMethods,
					defaultFields,
				} }
			>
				<SlotFillProvider>
					<CheckoutProvider>
						<SidebarLayout
							className={ clsx( 'wc-block-checkout', {
								'has-dark-controls': hasDarkControls,
							} ) }
						>
							<CheckoutBlockContext.Provider
								value={ {
									showOrderNotes,
									showPolicyLinks,
									showReturnToCart,
									cartPageId,
									showRateAfterTaxName,
									showFormStepNumbers,
									defaultFields,
								} }
							>
								<InnerBlocks
									allowedBlocks={ ALLOWED_BLOCKS }
									template={ defaultTemplate }
									templateLock="insert"
								/>
							</CheckoutBlockContext.Provider>
						</SidebarLayout>
					</CheckoutProvider>
				</SlotFillProvider>
			</EditorProvider>
		</div>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div
			{ ...useBlockProps.save( {
				className: 'wc-block-checkout is-loading',
			} ) }
		>
			<InnerBlocks.Content />
		</div>
	);
};
