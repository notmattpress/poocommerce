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
	const [ error, setError ] = useState( null );

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

	const exportBlueprint = async ( _steps ) => {
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
		} catch ( e ) {
			setError( e.message );
		}

		setExportEnabled( true );
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
			{ error && (
				<Notice
					status="error"
					onRemove={ () => {
						setError( null );
					} }
					isDismissible
				>
					{ error }
				</Notice>
			) }
			<h3>{ __( 'Blueprint', 'poocommerce' ) }</h3>
			<p className="blueprint-settings-intro-text">
				{ createInterpolateElement(
					__(
						'Blueprints are setup files that contain all the installation instructions, including plugins, themes, and setting. Ease the setup process, allow teams to apply each others’ changes and much more. <docLink />',
						'poocommerce'
					),
					{
						docLink: (
							<a
								href="#tba"
								className="poocommerce-admin-inline-documentation-link"
							>
								{ __( 'Learn more', 'poocommerce' ) }
							</a>
						),
					}
				) }
			</p>
			<h4>{ __( 'Import', 'poocommerce' ) }</h4>
			<p>
				{ __(
					'Import .json file, max size 50 MB. Only one Blueprint can be imported at a time.',
					'poocommerce'
				) }
			</p>
			<BlueprintUploadDropzone />
			<h4>{ __( 'Export', 'poocommerce' ) }</h4>
			<p className="blueprint-settings-export-intro">
				{ __(
					'Choose what you want to include, and export it as a .json file.',
					'poocommerce'
				) }
			</p>
			{ blueprintStepGroups.map( ( group, index ) => (
				<div key={ index } className="blueprint-settings-export-group">
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
