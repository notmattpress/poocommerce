/**
 * External dependencies
 */
import {
	Panel,
	PanelBody,
	PanelRow,
	DropdownMenu,
	MenuItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { Icon, layout, moreVertical } from '@wordpress/icons';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { storeName } from '../../store';
import { TemplateRevertModal } from './template-revert-modal';

export function TemplateInfo() {
	const template = useSelect(
		( select ) => select( storeName ).getCurrentTemplate(),
		[]
	);
	const [ isResetConfirmOpen, setResetConfirmOpen ] = useState( false );

	// @ts-expect-error Todo template type is not defined
	const description = template?.description || '';

	return (
		<>
			<Panel className="poocommerce-email-sidebar-email-type-info">
				<PanelBody>
					<PanelRow>
						<span className="poocommerce-email-type-info-icon">
							<Icon icon={ layout } />
						</span>
						<div className="poocommerce-email-type-info-content">
							<div className="poocommerce-email-type-info-content-heading">
								<h2>
									{ template?.title ||
										__( 'Template', 'poocommerce' ) }
								</h2>
								<DropdownMenu
									icon={ moreVertical }
									label={ __(
										'Template actions',
										'poocommerce'
									) }
								>
									{ ( { onClose } ) => (
										<MenuItem
											onClick={ () => {
												setResetConfirmOpen( true );
												onClose();
											} }
											info={ __(
												'Reset to default to clear all customizations',
												'poocommerce'
											) }
										>
											{ __( 'Reset', 'poocommerce' ) }
										</MenuItem>
									) }
								</DropdownMenu>
							</div>
							{ description && <p>{ description || '' }</p> }
							<p>
								{ __(
									'Edit this template to be used across multiple emails.',
									'poocommerce'
								) }
							</p>
						</div>
					</PanelRow>
				</PanelBody>
			</Panel>
			{ isResetConfirmOpen && (
				<TemplateRevertModal
					close={ () => {
						setResetConfirmOpen( false );
					} }
				/>
			) }
		</>
	);
}
