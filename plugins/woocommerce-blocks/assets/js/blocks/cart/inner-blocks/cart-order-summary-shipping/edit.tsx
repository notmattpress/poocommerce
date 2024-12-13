/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ExternalLink } from '@wordpress/components';
import { ADMIN_URL, getSetting } from '@poocommerce/settings';
import Noninteractive from '@poocommerce/base-components/noninteractive';

/**
 * Internal dependencies
 */
import Block from './block';

export const Edit = ( {
	attributes,
}: {
	attributes: {
		className: string;
		lock: {
			move: boolean;
			remove: boolean;
		};
	};
} ): JSX.Element => {
	const { className } = attributes;
	const shippingEnabled = getSetting( 'shippingEnabled', true );
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<InspectorControls>
				{ !! shippingEnabled && (
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
				) }
			</InspectorControls>
			<Noninteractive>
				<Block className={ className } />
			</Noninteractive>
		</div>
	);
};

export const Save = (): JSX.Element => {
	return <div { ...useBlockProps.save() } />;
};
