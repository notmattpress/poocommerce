/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { getAdminLink } from '@poocommerce/settings';
import { recordEvent } from '@poocommerce/tracks';
import { Text } from '@poocommerce/experimental';
import { Pill } from '@poocommerce/components';

/**
 * Internal dependencies
 */
import './Plugin.scss';

export type PluginProps = {
	isActive: boolean;
	isBusy?: boolean;
	isBuiltByWC: boolean;
	isDisabled?: boolean;
	isInstalled: boolean;
	description?: string;
	installAndActivate?: ( slug: string ) => void;
	onManage?: ( slug: string ) => void;
	imageUrl?: string;
	manageUrl?: string;
	name: string;
	slug: string;
};

export const Plugin: React.FC< PluginProps > = ( {
	description,
	imageUrl,
	installAndActivate = () => {},
	onManage = () => {},
	isActive,
	isBusy,
	isBuiltByWC,
	isDisabled,
	isInstalled,
	manageUrl,
	name,
	slug,
} ) => {
	return (
		<div className="poocommerce-plugin-list__plugin">
			{ imageUrl && (
				<div className="poocommerce-plugin-list__plugin-logo">
					<img
						src={ imageUrl }
						alt={ sprintf(
							/* translators: %s = name of the plugin */
							__( '%s logo', 'poocommerce' ),
							name
						) }
					/>
				</div>
			) }
			<div className="poocommerce-plugin-list__plugin-text">
				<Text variant="subtitle.small" as="h4">
					{ name }
					{ isBuiltByWC && (
						<Pill>
							{ __( 'Built by PooCommerce', 'poocommerce' ) }
						</Pill>
					) }
				</Text>
				<Text variant="subtitle.small">{ description }</Text>
			</div>
			<div className="poocommerce-plugin-list__plugin-action">
				{ isActive && manageUrl && (
					<Button
						disabled={ isDisabled }
						isBusy={ isBusy }
						isSecondary
						href={ getAdminLink( manageUrl ) }
						onClick={ () => {
							recordEvent( 'marketing_manage', {
								extension_name: slug,
							} );
							onManage( slug );
						} }
					>
						{ __( 'Manage', 'poocommerce' ) }
					</Button>
				) }
				{ isInstalled && ! isActive && (
					<Button
						disabled={ isDisabled }
						isBusy={ isBusy }
						isSecondary
						onClick={ () => installAndActivate( slug ) }
					>
						{ __( 'Activate', 'poocommerce' ) }
					</Button>
				) }
				{ ! isInstalled && (
					<Button
						disabled={ isDisabled }
						isBusy={ isBusy }
						isSecondary
						onClick={ () => installAndActivate( slug ) }
					>
						{ __( 'Get started', 'poocommerce' ) }
					</Button>
				) }
			</div>
		</div>
	);
};
