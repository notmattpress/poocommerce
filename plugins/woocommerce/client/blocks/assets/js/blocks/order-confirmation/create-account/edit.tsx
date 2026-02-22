/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import type { TemplateArray, BlockAttributes } from '@wordpress/blocks';
import {
	InnerBlocks,
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { getSetting, ADMIN_URL } from '@poocommerce/settings';
import {
	Disabled,
	PanelBody,
	ToggleControl,
	ExternalLink,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';
import { SITE_TITLE } from '../../../settings/shared/default-constants';
import Form from './form';

const defaultTemplate = [
	[
		'core/heading',
		{
			level: 3,
			content: sprintf(
				/* translators: %s: site name */
				__( 'Create an account with %s', 'poocommerce' ),
				SITE_TITLE
			),
		},
	],
	[
		'core/list',
		{
			className: 'is-style-checkmark-list',
		},
		[
			[
				'core/list-item',
				{
					content: __( 'Faster future purchases', 'poocommerce' ),
				},
			],
			[
				'core/list-item',
				{
					content: __( 'Securely save payment info', 'poocommerce' ),
				},
			],
			[
				'core/list-item',
				{
					content: __(
						'Track orders & view shopping history',
						'poocommerce'
					),
				},
			],
		],
	],
] as TemplateArray;

type EditProps = {
	attributes: {
		hasDarkControls: boolean;
	};
	setAttributes: ( attrs: BlockAttributes ) => void;
};

export const Edit = ( {
	attributes,
	setAttributes,
}: EditProps ): JSX.Element | null => {
	const className = clsx( 'wc-block-order-confirmation-create-account', {
		'has-dark-controls': attributes.hasDarkControls,
	} );
	const blockProps = useBlockProps( {
		className,
	} );
	const isEnabled = getSetting( 'delayedAccountCreationEnabled', true );

	if ( ! isEnabled ) {
		return null;
	}

	const generatePassword = getSetting( 'registrationGeneratePassword', true );

	return (
		<div { ...blockProps }>
			<InnerBlocks
				allowedBlocks={ [
					'core/heading',
					'core/paragraph',
					'core/list',
					'core/list-item',
					'core/image',
				] }
				template={ defaultTemplate }
				templateLock={ false }
			/>
			<Disabled>
				<Form isEditor={ true } />
			</Disabled>
			{ ! generatePassword && (
				<InspectorControls>
					<ToolsPanel
						label={ __( 'Style', 'poocommerce' ) }
						resetAll={ () => {
							setAttributes( { hasDarkControls: false } );
						} }
					>
						<ToolsPanelItem
							hasValue={ () =>
								attributes.hasDarkControls === true
							}
							label={ __( 'Dark mode inputs', 'poocommerce' ) }
							onDeselect={ () =>
								setAttributes( { hasDarkControls: false } )
							}
							isShownByDefault
						>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Dark mode inputs',
									'poocommerce'
								) }
								help={ __(
									'Inputs styled specifically for use on dark background colors.',
									'poocommerce'
								) }
								checked={ attributes.hasDarkControls }
								onChange={ () =>
									setAttributes( {
										hasDarkControls:
											! attributes.hasDarkControls,
									} )
								}
							/>
						</ToolsPanelItem>
					</ToolsPanel>
				</InspectorControls>
			) }
			<InspectorControls>
				<PanelBody>
					<p>
						{ __(
							'Configure this feature in your store settings.',
							'poocommerce'
						) }
					</p>
					<ExternalLink
						href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=account` }
					>
						{ __( 'Manage account settings', 'poocommerce' ) }
					</ExternalLink>
				</PanelBody>
			</InspectorControls>
		</div>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<InnerBlocks.Content />
		</div>
	);
};

export default Edit;
