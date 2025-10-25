/**
 * External dependencies
 */
import {
	createSlotFill,
	Button,
	Notice,
	ToggleControl,
	Icon,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { useState, createInterpolateElement } from '@wordpress/element';
import { registerPlugin, getPlugin } from '@wordpress/plugins';
import { __, sprintf } from '@wordpress/i18n';
import { CollapsibleContent } from '@poocommerce/components';
import { settings, plugins, layout } from '@wordpress/icons';
import { recordEvent } from '@poocommerce/tracks';
import { useUser } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { SETTINGS_SLOT_FILL_CONSTANT } from '../../settings/settings-slots';
import { BlueprintUploadDropzone } from '../components/BlueprintUploadDropzone';
import './style.scss';

const { Fill } = createSlotFill( SETTINGS_SLOT_FILL_CONSTANT );
const PLUGIN_ID = 'poocommerce-admin-blueprint-settings-slotfill';

const icons = {
	plugins,
	settings,
	layout,
};

const Blueprint = () => {
	const [ exportEnabled, setExportEnabled ] = useState( true );
	const [ exportError, setExportError ] = useState( null );

	const blueprintStepGroups =
		window.wcSettings?.admin?.blueprint_step_groups || [];

	const [ checkedState, setCheckedState ] = useState(
		blueprintStepGroups.reduce( ( acc, group ) => {
			acc[ group.id ] = group.items.reduce( ( groupAcc, item ) => {
				groupAcc[ item.id ] = item.checked ?? false;
				return groupAcc;
			}, {} );
			return acc;
		}, {} )
	);

	const { currentUserCan } = useUser();

	const exportBlueprint = async ( _steps ) => {
		setExportError( null );
		setExportEnabled( false );

		const linkContainer = document.getElementById(
			'download-link-container'
		);
		linkContainer.innerHTML = '';

		try {
			const response = await apiFetch( {
				path: '/wc-admin/blueprint/export',
				method: 'POST',
				data: {
					steps: _steps,
				},
			} );

			const link = document.createElement( 'a' );
			let url = null;

			if ( response.type === 'zip' ) {
				link.href = response.data;
				link.target = '_blank';
			} else {
				// Create a link element and trigger the download
				url = window.URL.createObjectURL(
					new Blob( [ JSON.stringify( response.data, null, 2 ) ] )
				);
				link.href = url;
				link.setAttribute( 'download', 'woo-blueprint.json' );
			}

			linkContainer.appendChild( link );

			link.click();
			if ( url ) {
				window.URL.revokeObjectURL( url );
			}

			recordEvent( 'blueprint_export_success', {
				has_plugins: _steps.plugins?.length > 0,
				has_themes: _steps.themes?.length > 0,
				has_settings: _steps.settings?.length > 0,
				settings_exported: _steps.settings,
			} );
		} catch ( e ) {
			recordEvent( 'blueprint_export_error', {
				error_message: e.message || 'unknown',
			} );

			setExportError( e.message );

			switch ( true ) {
				case e instanceof Error:
					setExportError( e.message );
					break;
				case typeof e === 'string':
					setExportError( e );
					break;
				case e.errors &&
					e.errors.wooblueprint_insufficient_permissions &&
					e.errors.wooblueprint_insufficient_permissions.length > 0:
					setExportError(
						__(
							'Sorry, you are not allowed to export the selected settings.',
							'poocommerce'
						)
					);
					break;
				default:
					setExportError(
						__(
							'An unknown error occurred while exporting the settings.',
							'poocommerce'
						)
					);
					break;
			}
		} finally {
			setExportEnabled( true );
		}
	};

	// Handle checkbox change
	const handleOnChange = ( groupId, itemId ) => {
		setCheckedState( ( prevState ) => ( {
			...prevState,
			[ groupId ]: {
				...prevState[ groupId ],
				[ itemId ]: ! prevState[ groupId ][ itemId ], // Toggle the checkbox state
			},
		} ) );
	};

	return (
		<div className="blueprint-settings-slotfill">
			<h3>{ __( 'Blueprint', 'poocommerce' ) }</h3>
			<p className="blueprint-settings-intro-text">
				{ createInterpolateElement(
					__(
						'Blueprints are setup files containing PooCommerce settings, plugins, and themes. Simplify setup, streamline team collaboration, and <docLink />.',
						'poocommerce'
					),
					{
						docLink: (
							<a
								href="https://poocommerce.com/document/poocommerce-blueprints/"
								target="_blank"
								className="poocommerce-admin-inline-documentation-link"
								rel="noreferrer"
								onClick={ () => {
									recordEvent( 'blueprint_learn_more_click' );
								} }
							>
								{ __( 'more', 'poocommerce' ) }
							</a>
						),
					}
				) }
			</p>
			{ currentUserCan( 'manage_options' ) && (
				<>
					<h4>{ __( 'Import', 'poocommerce' ) }</h4>
					<p>
						{ __(
							'Import a .json file. You can import only one Blueprint at a time.',
							'poocommerce'
						) }
					</p>
					<BlueprintUploadDropzone />
				</>
			) }
			<h4>{ __( 'Export', 'poocommerce' ) }</h4>
			<p className="blueprint-settings-export-intro">
				{ __(
					'Select the settings, plugins, and themes to export as a .json file.',
					'poocommerce'
				) }
			</p>
			{ exportError && (
				<Notice
					className="blueprint-export-error"
					status="error"
					onRemove={ () => {
						setExportError( null );
					} }
					isDismissible
				>
					{ exportError }
				</Notice>
			) }
			{ blueprintStepGroups.map( ( group, index ) => (
				<div
					key={ index }
					className="blueprint-settings-export-group wc-settings-prevent-change-event"
				>
					<Icon
						icon={ icons[ group.icon ] ?? icons.settings }
						alt={ sprintf(
							// translators: %s: icon name. Does not need to be translated.
							__( 'Blueprint setting icon - %s', 'poocommerce' ),
							group.icon
						) }
					/>
					<span className="blueprint-settings-export-group-item-count">
						{
							Object.values( checkedState[ group.id ] ).filter(
								( checked ) => checked
							).length
						}
					</span>

					<CollapsibleContent
						key={ index }
						toggleText={ group.label }
						initialCollapsed={ true }
					>
						{ group.items.map( ( step ) => (
							<ToggleControl
								__nextHasNoMarginBottom
								key={ step.id }
								label={ step.label }
								checked={ checkedState[ group.id ][ step.id ] }
								onChange={ () => {
									handleOnChange( group.id, step.id );
								} }
								help={ step.description }
							/>
						) ) }
					</CollapsibleContent>
				</div>
			) ) }

			<div id="download-link-container"></div>
			<Button
				className="blueprint-settings-export-button"
				variant="primary"
				onClick={ () => {
					const selectedSteps = Object.entries( checkedState ).reduce(
						( acc, [ groupId, groupState ] ) => {
							acc[ groupId ] = Object.keys( groupState ).filter(
								( itemId ) => groupState[ itemId ]
							);
							return acc;
						},
						{}
					);
					exportBlueprint( selectedSteps );
				} }
				disabled={ ! exportEnabled }
				isBusy={ ! exportEnabled }
			>
				{ __( 'Export', 'poocommerce' ) }
			</Button>
		</div>
	);
};

const BlueprintSlotfill = () => {
	return (
		<Fill>
			<Blueprint />
		</Fill>
	);
};

export const registerBlueprintSlotfill = () => {
	if ( getPlugin( PLUGIN_ID ) ) {
		return;
	}
	registerPlugin( PLUGIN_ID, {
		scope: 'poocommerce-blueprint-settings',
		render: BlueprintSlotfill,
	} );
};
