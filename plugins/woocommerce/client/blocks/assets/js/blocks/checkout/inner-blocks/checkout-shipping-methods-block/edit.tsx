/**
 * External dependencies
 */
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ExternalLink } from '@wordpress/components';
import { shipping } from '@wordpress/icons';
import { ADMIN_URL, getSetting } from '@poocommerce/settings';
import ExternalLinkCard from '@poocommerce/editor-components/external-link-card';
import { innerBlockAreas } from '@poocommerce/blocks-checkout';
import { useCheckoutAddress } from '@poocommerce/base-context/hooks';
import Noninteractive from '@poocommerce/base-components/noninteractive';

/**
 * Internal dependencies
 */
import {
	FormStepBlock,
	AdditionalFields,
	AdditionalFieldsContent,
} from '../../form-step';
import ConfigurePlaceholder from '../../configure-placeholder';
import Block from './block';
import './editor.scss';

type shippingAdminLink = {
	id: number;
	title: string;
	description: string;
};

export const Edit = ( {
	attributes,
	setAttributes,
}: {
	attributes: {
		title: string;
		description: string;
		showStepNumber: boolean;
		className: string;
	};
	setAttributes: ( attributes: Record< string, unknown > ) => void;
} ): JSX.Element | null => {
	const globalShippingMethods = getSetting(
		'globalShippingMethods'
	) as shippingAdminLink[];
	const activeShippingZones = getSetting(
		'activeShippingZones'
	) as shippingAdminLink[];

	const { showShippingMethods } = useCheckoutAddress();

	if ( ! showShippingMethods ) {
		return null;
	}

	return (
		<FormStepBlock
			attributes={ attributes }
			setAttributes={ setAttributes }
			className={ clsx(
				'wc-block-checkout__shipping-option',
				attributes?.className
			) }
		>
			<InspectorControls>
				<PanelBody
					title={ __( 'Shipping Calculations', 'poocommerce' ) }
				>
					<p className="wc-block-checkout__controls-text">
						{ __(
							'Options that control shipping can be managed in your store settings.',
							'poocommerce'
						) }
					</p>
					<ExternalLink
						href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=shipping&section=options` }
					>
						{ __( 'Manage shipping options', 'poocommerce' ) }
					</ExternalLink>{ ' ' }
				</PanelBody>
				{ globalShippingMethods.length > 0 && (
					<PanelBody title={ __( 'Methods', 'poocommerce' ) }>
						<p className="wc-block-checkout__controls-text">
							{ __(
								'The following shipping integrations are active on your store.',
								'poocommerce'
							) }
						</p>
						{ globalShippingMethods.map( ( method ) => {
							return (
								<ExternalLinkCard
									key={ method.id }
									href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=shipping&section=${ method.id }` }
									title={ method.title }
									description={ method.description }
								/>
							);
						} ) }
						<ExternalLink
							href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=shipping` }
						>
							{ __( 'Manage shipping methods', 'poocommerce' ) }
						</ExternalLink>
					</PanelBody>
				) }
				{ activeShippingZones.length && (
					<PanelBody title={ __( 'Shipping Zones', 'poocommerce' ) }>
						<p className="wc-block-checkout__controls-text">
							{ __(
								'Shipping Zones can be made managed in your store settings.',
								'poocommerce'
							) }
						</p>
						{ activeShippingZones.map( ( zone ) => {
							return (
								<ExternalLinkCard
									key={ zone.id }
									href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=shipping&zone_id=${ zone.id }` }
									title={ zone.title }
									description={ zone.description }
								/>
							);
						} ) }
					</PanelBody>
				) }
			</InspectorControls>
			<Noninteractive>
				<Block
					noShippingPlaceholder={
						<ConfigurePlaceholder
							icon={ shipping }
							label={ __( 'Shipping options', 'poocommerce' ) }
							description={ __(
								'Your store does not have any Shipping Options configured. Once you have added your Shipping Options they will appear here.',
								'poocommerce'
							) }
							buttonLabel={ __(
								'Configure Shipping Options',
								'poocommerce'
							) }
							buttonHref={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=shipping` }
						/>
					}
				/>
			</Noninteractive>
			<AdditionalFields block={ innerBlockAreas.SHIPPING_METHODS } />
		</FormStepBlock>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<AdditionalFieldsContent />
		</div>
	);
};
