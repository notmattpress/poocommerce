/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { CoreProfilerStateMachineContext } from '../../index';
import {
	PluginsLearnMoreLinkClickedEvent,
	PluginsInstallationRequestedEvent,
	PluginsPageSkippedEvent,
} from '../../events';
import { Heading } from '../../components/heading/heading';
import { Navigation } from '../../components/navigation/navigation';
import { PluginCard } from './components/plugin-card/plugin-card';
import { PluginErrorBanner } from './components/plugin-error-banner/PluginErrorBanner';

/** Page to be shown when the user does not have permissions to install plugins */
export const NoPermissionsError = ( {
	context,
	navigationProgress,
	sendEvent,
}: {
	context: Pick<
		CoreProfilerStateMachineContext,
		'pluginsAvailable' | 'currentUser'
	>;
	sendEvent: (
		payload:
			| PluginsInstallationRequestedEvent
			| PluginsPageSkippedEvent
			| PluginsLearnMoreLinkClickedEvent
	) => void;
	navigationProgress: number;
} ) => {
	const skipPluginsPage = () => {
		return sendEvent( {
			type: 'PLUGINS_PAGE_SKIPPED',
		} );
	};

	const pluginsCardRowCount = Math.ceil(
		context.pluginsAvailable.length / 2
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
						'Enhance your store by installing these free business features. No commitment required – you can remove them at any time.',
						'poocommerce'
					) }
				/>

				<PluginErrorBanner
					pluginsInstallationPermissionsFailure={ true }
				/>

				<div
					className={ clsx(
						'poocommerce-profiler-plugins__list',
						`rows-${ pluginsCardRowCount }`
					) }
				>
					{ context.pluginsAvailable.map( ( plugin ) => {
						const {
							key: pluginSlug,
							learn_more_link: learnMoreLink,
						} = plugin;
						return (
							<PluginCard
								key={ pluginSlug }
								plugin={ plugin }
								checked={ false }
								disabled={ true }
							>
								{ learnMoreLink && (
									<PluginCard.LearnMoreLink
										onClick={ () => {
											sendEvent( {
												type: 'PLUGINS_LEARN_MORE_LINK_CLICKED',
												payload: {
													plugin: pluginSlug,
													learnMoreLink,
												},
											} );
										} }
									/>
								) }
							</PluginCard>
						);
					} ) }
				</div>
				<div
					className={ clsx(
						'poocommerce-profiler-plugins__footer',
						`rows-${ pluginsCardRowCount }`
					) }
				>
					<div className="poocommerce-profiler-plugins-continue-button-container">
						<Button
							className="poocommerce-profiler-plugins-continue-button"
							variant="primary"
							onClick={ skipPluginsPage }
						>
							{ __( 'Continue', 'poocommerce' ) }
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
