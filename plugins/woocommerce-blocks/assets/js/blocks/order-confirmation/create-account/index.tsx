/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { Icon, people } from '@wordpress/icons';
import { ExternalLink } from '@wordpress/components';
import { ADMIN_URL } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { Save, Edit } from './edit';

registerBlockType( metadata, {
	apiVersion: 3,
	description: (
		<>
			{ metadata.description }
			<br />
			<ExternalLink
				href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=account` }
			>
				{ __( 'Manage account settings', 'poocommerce' ) }
			</ExternalLink>
		</>
	),
	icon: {
		src: (
			<Icon
				icon={ people }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	attributes: {
		...metadata.attributes,
	},
	edit: Edit,
	save: Save,
} );
