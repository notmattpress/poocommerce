/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { __, sprintf } from '@wordpress/i18n';
import { box, plus, settings } from '@wordpress/icons';
import { useEffect, useMemo, useRef } from '@wordpress/element';
import { dispatch, useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { addQueryArgs } from '@wordpress/url';
import { recordEvent, queueRecordEvent } from '@poocommerce/tracks';
import { store as commandsStore } from '@wordpress/commands';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import { registerCommandWithTracking } from './register-command-with-tracking';
import { useEditedPostType } from './use-edited-post-type';

const registerPooCommerceSettingsCommand = ( { label, tab, origin } ) => {
	registerCommandWithTracking( {
		name: `poocommerce/settings-${ tab }`,
		label: sprintf(
			// translators: %s is the title of the Settings Tab. This is used as a command in the Command Palette.
			__( 'PooCommerce Settings: %s', 'poocommerce' ),
			label
		),
		icon: settings,
		callback: () => {
			document.location = addQueryArgs( 'admin.php', {
				page: 'wc-settings',
				tab,
			} );
		},
		origin,
	} );
};

// Code adapted from the equivalent in Gutenberg:
// https://github.com/WordPress/gutenberg/blob/8863b49b7e686f555e8b8adf70cc588c4feebfbf/packages/core-commands/src/site-editor-navigation-commands.js#L36C7-L36C44
function useProductCommandLoader( { search } ) {
	const { editedPostType } = useEditedPostType();
	const origin = editedPostType ? editedPostType + '-editor' : null;
	// Track searched values. We add a 300 ms delay to avoid tracking while typing.
	const trackingSearchTimeout = useRef( null );
	useEffect( () => {
		if ( search !== '' ) {
			clearTimeout( trackingSearchTimeout.current );
			trackingSearchTimeout.current = setTimeout( () => {
				recordEvent( 'poocommerce_command_palette_search', {
					value: search,
					origin,
				} );
			}, 300 );
		}
		return () => {
			clearTimeout( trackingSearchTimeout.current );
		};
	}, [ search, origin ] );

	const postType = 'product';
	const { records, isLoading } = useSelect(
		( select ) => {
			const { getEntityRecords } = select( coreStore );
			const query = {
				search: !! search ? search : undefined,
				per_page: 10,
				orderby: search ? 'relevance' : 'date',
				status: [ 'publish', 'future', 'draft', 'pending', 'private' ],
			};
			return {
				records: getEntityRecords( 'postType', postType, query ),
				isLoading: ! select( coreStore ).hasFinishedResolution(
					'getEntityRecords',
					[ 'postType', postType, query ]
				),
			};
		},
		[ search ]
	);

	const commands = useMemo( () => {
		return ( records ?? [] ).map( ( record ) => {
			const command = {
				name: postType + '-' + record.id,
				searchLabel: record.title?.rendered + ' ' + record.id,
				label: record.title?.rendered
					? decodeEntities( record.title?.rendered )
					: __( '(no title)', 'poocommerce' ),
				icon: box,
			};
			return {
				...command,
				callback: ( { close } ) => {
					queueRecordEvent( 'poocommerce_command_palette_submit', {
						name: 'poocommerce/product',
						origin,
					} );

					const args = {
						post: record.id,
						action: 'edit',
					};
					const targetUrl = addQueryArgs( 'post.php', args );
					document.location = targetUrl;
					close();
				},
			};
		} );
	}, [ records, origin ] );

	return {
		commands,
		isLoading,
	};
}

const PooCommerceCommands = () => {
	const { editedPostType } = useEditedPostType();
	const origin = editedPostType ? editedPostType + '-editor' : null;
	const { isCommandPaletteOpen } = useSelect( ( select ) => {
		const { isOpen } = select( commandsStore );
		return {
			isCommandPaletteOpen: isOpen(),
		};
	}, [] );
	const wasCommandPaletteOpen = useRef( false );

	useEffect( () => {
		if ( isCommandPaletteOpen && ! wasCommandPaletteOpen.current ) {
			recordEvent( 'poocommerce_command_palette_open', {
				origin,
			} );
		}
		wasCommandPaletteOpen.current = isCommandPaletteOpen;
	}, [ isCommandPaletteOpen, origin ] );

	useEffect( () => {
		registerCommandWithTracking( {
			name: 'poocommerce/add-new-product',
			label: __( 'Add new product', 'poocommerce' ),
			icon: plus,
			callback: () => {
				document.location = addQueryArgs( 'post-new.php', {
					post_type: 'product',
				} );
			},
			origin,
		} );
		registerCommandWithTracking( {
			name: 'poocommerce/add-new-order',
			label: __( 'Add new order', 'poocommerce' ),
			icon: plus,
			callback: () => {
				document.location = addQueryArgs( 'admin.php', {
					page: 'wc-orders',
					action: 'new',
				} );
			},
			origin,
		} );
		registerCommandWithTracking( {
			name: 'poocommerce/view-products',
			label: __( 'Products', 'poocommerce' ),
			icon: box,
			callback: () => {
				document.location = addQueryArgs( 'edit.php', {
					post_type: 'product',
				} );
			},
			origin,
		} );
		registerCommandWithTracking( {
			name: 'poocommerce/view-orders',
			label: __( 'Orders', 'poocommerce' ),
			icon: box,
			callback: () => {
				document.location = addQueryArgs( 'admin.php', {
					page: 'wc-orders',
				} );
			},
			origin,
		} );
		dispatch( commandsStore ).registerCommandLoader( {
			name: 'poocommerce/product',
			hook: useProductCommandLoader,
		} );

		if (
			window.hasOwnProperty( 'wcCommandPaletteSettings' ) &&
			window.wcCommandPaletteSettings.hasOwnProperty( 'settingsTabs' ) &&
			Array.isArray( window.wcCommandPaletteSettings.settingsTabs )
		) {
			const settingsCommands =
				window.wcCommandPaletteSettings.settingsTabs;

			settingsCommands.forEach( ( settingsCommand ) => {
				registerPooCommerceSettingsCommand( {
					label: settingsCommand.label,
					tab: settingsCommand.key,
					origin,
				} );
			} );
		}
	}, [ origin ] );

	return null;
};

registerPlugin( 'poocommerce-commands-registration', {
	render: PooCommerceCommands,
} );
