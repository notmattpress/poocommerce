/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { TabPanel, Card, CardHeader, CardFooter } from '@wordpress/components';
import { get, xor } from 'lodash';
import {
	EllipsisMenu,
	MenuItem,
	MenuTitle,
	Link,
} from '@poocommerce/components';
import { useUserPreferences, pluginsStore } from '@poocommerce/data';
import { getNewPath } from '@poocommerce/navigation';
import { recordEvent } from '@poocommerce/tracks';
import { Text } from '@poocommerce/experimental';

/**
 * Internal dependencies
 */
import './style.scss';
import { DEFAULT_STATS, DEFAULT_HIDDEN_STATS } from './defaults';
import StatsList from './stats-list';
import { InstallJetpackCTA } from './install-jetpack-cta';
import { getAdminSetting } from '~/utils/admin-settings';

const { performanceIndicators = [] } = getAdminSetting( 'dataEndpoints', {
	performanceIndicators: [],
} );

const stats = performanceIndicators.filter( ( indicator ) => {
	return DEFAULT_STATS.includes( indicator.stat );
} );

const HeaderText = () => (
	<Text variant="title.small" size="20" lineHeight="28px">
		{ __( 'Stats overview', 'poocommerce' ) }
	</Text>
);

export const StatsOverview = () => {
	const { updateUserPreferences, ...userPrefs } = useUserPreferences();
	const hiddenStats = get(
		userPrefs,
		[ 'homepage_stats', 'hiddenStats' ],
		DEFAULT_HIDDEN_STATS
	);

	const jetPackIsConnectedAndActivated = useSelect( ( select ) => {
		const store = select( pluginsStore );
		return (
			store.isJetpackConnected() &&
			store.getPluginInstallState( 'jetpack' ) === 'activated'
		);
	}, [] );

	const homePageStats = userPrefs.homepage_stats || {};
	const userDismissedJetpackInstall = homePageStats.installJetpackDismissed;

	const toggleStat = ( stat ) => {
		const nextHiddenStats = xor( hiddenStats, [ stat ] );
		updateUserPreferences( {
			homepage_stats: { hiddenStats: nextHiddenStats },
		} );
		recordEvent( 'statsoverview_indicators_toggle', {
			indicator_name: stat,
			status: nextHiddenStats.includes( stat ) ? 'off' : 'on',
		} );
	};

	const activeStats = stats.filter(
		( item ) => ! hiddenStats.includes( item.stat )
	);

	return (
		<Card
			size="large"
			className="poocommerce-stats-overview poocommerce-homescreen-card"
		>
			<CardHeader size="medium">
				<HeaderText />
				<EllipsisMenu
					label={ __(
						'Choose which values to display',
						'poocommerce'
					) }
					renderContent={ () => (
						<Fragment>
							<MenuTitle>
								{ __( 'Display stats:', 'poocommerce' ) }
							</MenuTitle>
							{ stats.map( ( item ) => {
								const checked = ! hiddenStats.includes(
									item.stat
								);

								return (
									<MenuItem
										checked={ checked }
										isCheckbox
										isClickable
										key={ item.stat }
										onInvoke={ () =>
											toggleStat( item.stat )
										}
									>
										{ item.label }
									</MenuItem>
								);
							} ) }
						</Fragment>
					) }
				/>
			</CardHeader>
			<TabPanel
				className="poocommerce-stats-overview__tabs"
				onSelect={ ( period ) => {
					recordEvent( 'statsoverview_date_picker_update', {
						period,
					} );
				} }
				tabs={ [
					{
						title: __( 'Today', 'poocommerce' ),
						name: 'today',
					},
					{
						title: __( 'Week to date', 'poocommerce' ),
						name: 'week',
					},
					{
						title: __( 'Month to date', 'poocommerce' ),
						name: 'month',
					},
				] }
			>
				{ ( tab ) => (
					<Fragment>
						{ ! jetPackIsConnectedAndActivated &&
							! userDismissedJetpackInstall && (
								<InstallJetpackCTA />
							) }
						<StatsList
							query={ {
								period: tab.name,
								compare: 'previous_period',
							} }
							stats={ activeStats }
						/>
					</Fragment>
				) }
			</TabPanel>
			<CardFooter>
				<Link
					className="poocommerce-stats-overview__more-btn"
					href={ getNewPath( {}, '/analytics/overview' ) }
					type="wc-admin"
					onClick={ () => {
						recordEvent( 'statsoverview_indicators_click', {
							key: 'view_detailed_stats',
						} );
					} }
				>
					{ __( 'View detailed stats', 'poocommerce' ) }
				</Link>
			</CardFooter>
		</Card>
	);
};

export default StatsOverview;
