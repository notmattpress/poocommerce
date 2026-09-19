/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { isNil } from 'lodash';

function HistoricalDataProgress( { label, progress, total } ) {
	/* translators: %s: label */
	const labelText = sprintf( __( 'Imported %(label)s', 'poocommerce' ), {
		label,
	} );

	const labelCounters = ! isNil( total )
		? /* translators: 1: progress, 2: total */
		  sprintf( __( '%(progress)s of %(total)s', 'poocommerce' ), {
				progress: progress || 0,
				total,
		  } )
		: null;

	return (
		<div className="poocommerce-settings-historical-data__progress">
			<span className="poocommerce-settings-historical-data__progress-label">
				{ labelText }
			</span>
			{ labelCounters && (
				<span className="poocommerce-settings-historical-data__progress-label">
					{ labelCounters }
				</span>
			) }
			<progress
				className="poocommerce-settings-historical-data__progress-bar"
				max={ total }
				value={ progress || 0 }
			/>
		</div>
	);
}

export default HistoricalDataProgress;
