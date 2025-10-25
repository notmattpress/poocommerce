/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment, useState } from '@wordpress/element';
import PropTypes from 'prop-types';
import { SelectControl } from '@wordpress/components';

import {
	EllipsisMenu,
	MenuItem,
	MenuTitle,
	SectionHeader,
} from '@poocommerce/components';
import { useUserPreferences } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import Leaderboard from '../../analytics/components/leaderboard';
import { getAdminSetting } from '~/utils/admin-settings';
import './style.scss';

const renderLeaderboardToggles = ( {
	allLeaderboards,
	hiddenBlocks,
	onToggleHiddenBlock,
} ) => {
	return allLeaderboards.map( ( leaderboard ) => {
		const checked = ! hiddenBlocks.includes( leaderboard.id );
		return (
			<MenuItem
				checked={ checked }
				isCheckbox
				isClickable
				key={ leaderboard.id }
				onInvoke={ () => {
					onToggleHiddenBlock( leaderboard.id )();
					recordEvent( 'dash_leaderboards_toggle', {
						status: checked ? 'off' : 'on',
						key: leaderboard.id,
					} );
				} }
			>
				{ leaderboard.label }
			</MenuItem>
		);
	} );
};

const renderLeaderboards = ( {
	allLeaderboards,
	hiddenBlocks,
	query,
	rowsPerTable,
	filters,
} ) => {
	return allLeaderboards.map( ( leaderboard ) => {
		if ( hiddenBlocks.includes( leaderboard.id ) ) {
			return undefined;
		}

		return (
			<Leaderboard
				headers={ leaderboard.headers }
				id={ leaderboard.id }
				key={ leaderboard.id }
				query={ query }
				title={ leaderboard.label }
				totalRows={ rowsPerTable }
				filters={ filters }
			/>
		);
	} );
};

const Leaderboards = ( props ) => {
	const {
		allLeaderboards,
		controls: Controls,
		isFirst,
		isLast,
		hiddenBlocks,
		onMove,
		onRemove,
		onTitleBlur,
		onTitleChange,
		onToggleHiddenBlock,
		query,
		title,
		titleInput,
		filters,
	} = props;
	const { updateUserPreferences, ...userPrefs } = useUserPreferences();
	const [ rowsPerTable, setRowsPerTableState ] = useState(
		parseInt( userPrefs.dashboard_leaderboard_rows || 5, 10 )
	);

	const setRowsPerTable = ( rows ) => {
		setRowsPerTableState( parseInt( rows, 10 ) );
		const userDataFields = {
			dashboard_leaderboard_rows: parseInt( rows, 10 ),
		};
		updateUserPreferences( userDataFields );
	};

	const renderMenu = () => (
		<EllipsisMenu
			label={ __(
				'Choose which leaderboards to display and other settings',
				'poocommerce'
			) }
			placement={ 'bottom-end' }
			renderContent={ ( { onToggle } ) => (
				<Fragment>
					<MenuTitle>
						{ __( 'Leaderboards', 'poocommerce' ) }
					</MenuTitle>
					{ renderLeaderboardToggles( {
						allLeaderboards,
						hiddenBlocks,
						onToggleHiddenBlock,
					} ) }
					<MenuItem>
						<SelectControl
							className="poocommerce-dashboard__dashboard-leaderboards__select"
							label={ __( 'Rows per table', 'poocommerce' ) }
							value={ rowsPerTable }
							options={ Array.from(
								{ length: 20 },
								( v, key ) => ( {
									v: key + 1,
									label: key + 1,
								} )
							) }
							onChange={ setRowsPerTable }
						/>
					</MenuItem>
					<Controls
						onToggle={ onToggle }
						onMove={ onMove }
						onRemove={ onRemove }
						isFirst={ isFirst }
						isLast={ isLast }
						onTitleBlur={ onTitleBlur }
						onTitleChange={ onTitleChange }
						titleInput={ titleInput }
					/>
				</Fragment>
			) }
		/>
	);

	return (
		<Fragment>
			<div className="poocommerce-dashboard__dashboard-leaderboards">
				<SectionHeader
					title={ title || __( 'Leaderboards', 'poocommerce' ) }
					menu={ renderMenu() }
				/>
				<div className="poocommerce-dashboard__columns">
					{ renderLeaderboards( {
						allLeaderboards,
						hiddenBlocks,
						query,
						rowsPerTable,
						filters,
					} ) }
				</div>
			</div>
		</Fragment>
	);
};

Leaderboards.propTypes = {
	query: PropTypes.object.isRequired,
};

export default ( ownProps ) => {
	const { leaderboards } = getAdminSetting( 'dataEndpoints', {
		leaderboards: [],
	} );
	return <Leaderboards { ...ownProps } allLeaderboards={ leaderboards } />;
};
