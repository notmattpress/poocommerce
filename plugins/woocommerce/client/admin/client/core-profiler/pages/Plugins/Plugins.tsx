/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { Extension, ExtensionList } from '@poocommerce/data';
import { useState, useMemo } from '@wordpress/element';
import { useMediaQuery } from '@wordpress/compose';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { CoreProfilerStateMachineContext } from '../../index';
import {
	PluginsLearnMoreLinkClickedEvent,
	PluginsInstallationRequestedEvent,
	PluginsPageSkippedEvent,
	PluginsPageCompletedWithoutSelectingPluginsEvent,
} from '../../events';
import { Heading } from '../../components/heading/heading';
import { Navigation } from '../../components/navigation/navigation';
import { PluginCard } from './components/plugin-card/plugin-card';
import { getAdminSetting } from '~/utils/admin-settings';
import { PluginErrorBanner } from './components/plugin-error-banner/PluginErrorBanner';
import { PluginsTermsOfService } from './components/plugin-terms-of-service/PluginsTermsOfService';

const currentLocale = (
	getAdminSetting( 'locale' )?.siteLocale || 'en_US'
).replaceAll( '_', '-' );

export const joinWithAnd = (
	items: string[],
	locale: string = currentLocale
) => {
	try {
		return new Intl.ListFormat( locale, {
			style: 'long',
			type: 'conjunction',
		} ).formatToParts( items );
	} catch ( error ) {
		// Fallback to English
		return new Intl.ListFormat( 'en-US', {
			style: 'long',
			type: 'conjunction',
		} ).formatToParts( items );
	}
};

export const composeListFormatParts = ( part: {
	type: string;
	value: string;
} ) => {
	if ( part.type === 'element' ) {
		return '{{span}}' + part.value + '{{/span}}';
	}
	return part.value;
};

export const computePluginsSelection = (
	availablePlugins: Extension[],
	selectedPlugins: Set< Extension >
) => {
	const selectedPluginSlugs = Array.from( selectedPlugins ).map( ( plugin ) =>
		plugin.key.replace( ':alt', '' )
	);

	const pluginsShown: string[] = [];
	const pluginsUnselected: string[] = [];

	availablePlugins.forEach( ( plugin ) => {
		const pluginSlug = plugin.key.replace( ':alt', '' );
		pluginsShown.push( pluginSlug );

		if (
			! plugin.is_activated &&
			! selectedPluginSlugs.includes( pluginSlug )
		) {
			pluginsUnselected.push( pluginSlug );
		}
	} );

	return { pluginsShown, pluginsUnselected, selectedPluginSlugs };
};

export const Plugins = ( {
	context,
	navigationProgress,
	sendEvent,
}: {
	context: Pick<
		CoreProfilerStateMachineContext,
		'pluginsAvailable' | 'pluginsInstallationErrors' | 'pluginsSelected'
	>;
	sendEvent: (
		payload:
			| PluginsInstallationRequestedEvent
			| PluginsPageSkippedEvent
			| PluginsPageCompletedWithoutSelectingPluginsEvent
			| PluginsLearnMoreLinkClickedEvent
	) => void;
	navigationProgress: number;
} ) => {
	const [ selectedPlugins, setSelectedPlugins ] = useState<
		Set< ExtensionList[ 'plugins' ][ number ] >
	>(
		new Set(
			context.pluginsAvailable.filter(
				context.pluginsInstallationErrors.length
					? ( plugin ) =>
							context.pluginsSelected.includes( plugin.key ) // if there was previously an error, retrieve previous selection
					: ( plugin ) => ! plugin.is_activated // initialise selection with all plugins that haven't been installed
			)
		)
	);

	const setSelectedPlugin = ( plugin: Extension ) => {
		if ( selectedPlugins.has( plugin ) ) {
			selectedPlugins.delete( plugin );
		} else {
			selectedPlugins.add( plugin );
		}
		setSelectedPlugins( new Set( selectedPlugins ) );
	};

	const skipPluginsPage = () => {
		return sendEvent( {
			type: 'PLUGINS_PAGE_SKIPPED',
		} );
	};

	const completedPluginsPageWithoutSelectingPlugins = () => {
		return sendEvent( {
			type: 'PLUGINS_PAGE_COMPLETED_WITHOUT_SELECTING_PLUGINS',
		} );
	};

	const submitInstallationRequest = () => {
		const { pluginsShown, pluginsUnselected, selectedPluginSlugs } =
			computePluginsSelection(
				context.pluginsAvailable,
				selectedPlugins
			);

		return sendEvent( {
			type: 'PLUGINS_INSTALLATION_REQUESTED',
			payload: {
				pluginsShown,
				pluginsSelected: selectedPluginSlugs,
				pluginsUnselected,
			},
		} );
	};

	const pluginsCardRowCount = Math.ceil(
		context.pluginsAvailable.length / 2
	);

	const pluginsSlugToName = useMemo(
		() =>
			context.pluginsAvailable.reduce( ( acc, plugin ) => {
				acc[ plugin.key ] = plugin.name;
				return acc;
			}, {} as Record< string, string > ),
		[ context.pluginsAvailable ]
	);

	const baseHeight = 350;
	const rowHeight = 100; // include the gap between the cards
	const listHeight = baseHeight + rowHeight * pluginsCardRowCount;
	const shouldShowStickyFooter = useMediaQuery(
		`(max-height: ${ listHeight }px)`
	);

	return (
		<div
			className="poocommerce-profiler-plugins"
			data-testid="core-profiler-plugins"
		>
			<Navigation
				percentage={ navigationProgress }
				onSkip={ skipPluginsPage }
			/>
			<div className="poocommerce-profiler-page__content poocommerce-profiler-plugins__content">
				<Heading
					className="poocommerce-profiler__stepper-heading"
					title={ __(
						'Get a boost with our free features',
						'poocommerce'
					) }
					subTitle={ __(
						'No commitment required – you can remove them at any time.',
						'poocommerce'
					) }
				/>
				{ context.pluginsInstallationErrors.length > 0 && (
					<PluginErrorBanner
						pluginsInstallationErrors={
							context.pluginsInstallationErrors
						}
						pluginsSlugToName={ pluginsSlugToName }
						onClick={ submitInstallationRequest }
					/>
				) }
				<div
					className={ clsx( 'poocommerce-profiler-plugins__list', {
						'sticky-footer': shouldShowStickyFooter,
					} ) }
				>
					{ context.pluginsAvailable.map( ( plugin ) => {
						const { key: pluginSlug } = plugin;
						return (
							<PluginCard
								key={ pluginSlug }
								plugin={ plugin }
								onChange={ () => {
									if ( ! plugin.is_activated ) {
										setSelectedPlugin( plugin );
									}
								} }
								checked={ selectedPlugins.has( plugin ) }
							></PluginCard>
						);
					} ) }
				</div>
				<div
					className={ clsx( 'poocommerce-profiler-plugins__footer', {
						'sticky-footer': shouldShowStickyFooter,
					} ) }
				>
					<div className="poocommerce-profiler-plugins-continue-button-container">
						<Button
							className="poocommerce-profiler-plugins-continue-button"
							variant="primary"
							onClick={
								selectedPlugins.size > 0
									? submitInstallationRequest
									: completedPluginsPageWithoutSelectingPlugins
							}
						>
							{ __( 'Continue', 'poocommerce' ) }
						</Button>
					</div>
					<PluginsTermsOfService
						selectedPlugins={ Array.from( selectedPlugins ) }
					/>
				</div>
			</div>
		</div>
	);
};
