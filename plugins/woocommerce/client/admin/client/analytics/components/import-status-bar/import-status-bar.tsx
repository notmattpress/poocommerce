/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { dateI18n } from '@wordpress/date';
import { Button, Spinner } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useSettings } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { useImportStatus } from './use-import-status';
import './import-status-bar.scss';

/**
 * Analytics Import Status Bar Component
 *
 * Displays the current analytics import status including:
 * - Last processed date
 * - Next scheduled import time
 * - Manual "Update now" button
 *
 * Only displays in scheduled mode. Hidden in immediate mode.
 *
 * @return {JSX.Element|null} The status bar component or null if hidden
 */
export function ImportStatusBar(): JSX.Element | null {
	const { status, isLoading, triggerImport, isTriggeringImport } =
		useImportStatus();
	const { createNotice } = useDispatch( 'core/notices' );
	const { wcAdminSettings } = useSettings( 'wc_admin', [
		'wcAdminSettings',
	] ) as unknown as {
		wcAdminSettings: {
			poocommerce_analytics_scheduled_import: 'yes' | 'no';
		};
	};

	// Don't render if scheduled import is disabled (immediate mode)
	// Use the value from the settings hook rather than the status object; accessing settings is faster because they are preloaded.
	if (
		! wcAdminSettings?.poocommerce_analytics_scheduled_import ||
		wcAdminSettings.poocommerce_analytics_scheduled_import === 'no'
	) {
		return null;
	}

	/**
	 * Format a date string for display
	 *
	 * @param {string|null} date - Date string in 'Y-m-d H:i:s' format (site timezone)
	 * @return {string} Formatted date string or "Never"
	 */
	const formatLastProcessedDate = ( date: string | null ): string => {
		if ( ! date ) {
			return __( 'Never', 'poocommerce' );
		}
		return dateI18n( 'M j H:i', date, undefined );
	};

	const formatNextScheduledDate = ( date: string | null ): string => {
		if ( ! date ) {
			return __( 'Never', 'poocommerce' );
		}

		return dateI18n(
			/**
			 * translators: %s: formatted date and time in site timezone.
			 * Used to display the next scheduled time for the Analytics import, e.g. "Nov 21 at 12:00".
			 * "M j" shows the month and day, "at" as literal, "H:i" shows time (24-hour format).
			 */
			__( 'M j \\a\\t H:i', 'poocommerce' ),
			date,
			undefined
		);
	};

	/**
	 * Handle manual import trigger
	 */
	const handleTriggerImport = async (): Promise< void > => {
		try {
			await triggerImport();
			createNotice(
				'success',
				__(
					'Analytics import has started. Your store data will be updated soon.',
					'poocommerce'
				),
				{
					type: 'snackbar',
					isDismissible: true,
				}
			);
		} catch ( err ) {
			createNotice(
				'error',
				err instanceof Error
					? err.message
					: __(
							'Failed to trigger analytics update.',
							'poocommerce'
					  ),
				{
					isDismissible: true,
				}
			);
		}
	};

	const isBusy = status?.import_in_progress_or_due || isTriggeringImport;

	return (
		<div className="poocommerce-analytics-import-status-bar-wrapper">
			<div className="poocommerce-analytics-import-status-bar-wrapper__label">
				{ __( 'Data status:', 'poocommerce' ) }
			</div>
			<div
				className="poocommerce-analytics-import-status-bar"
				role="status"
				aria-live="polite"
				aria-atomic="true"
				aria-busy={ isLoading || isTriggeringImport }
			>
				<div className="poocommerce-analytics-import-status-bar__content">
					<span className="poocommerce-analytics-import-status-bar__item">
						<span className="poocommerce-analytics-import-status-bar__label">
							{ __( 'Last updated', 'poocommerce' ) }
						</span>
						<span className="poocommerce-analytics-import-status-bar__value">
							{ isLoading ? (
								<Spinner />
							) : (
								formatLastProcessedDate(
									status?.last_processed_date || null
								)
							) }
						</span>
					</span>
					<span className="poocommerce-analytics-import-status-bar__item">
						<span className="poocommerce-analytics-import-status-bar__label">
							{ __( 'Next update', 'poocommerce' ) }
						</span>
						<span className="poocommerce-analytics-import-status-bar__value">
							{ isLoading ? (
								<Spinner />
							) : (
								formatNextScheduledDate(
									status?.next_scheduled || null
								)
							) }
						</span>
					</span>
					<Button
						variant="tertiary"
						onClick={ handleTriggerImport }
						disabled={ isLoading || isBusy }
						aria-disabled={ isLoading || isBusy }
						aria-busy={ isBusy }
						className="poocommerce-analytics-import-status-bar__trigger"
						aria-label={
							isBusy
								? __(
										'Analytics data import in progress',
										'poocommerce'
								  )
								: __(
										'Manually trigger analytics data import',
										'poocommerce'
								  )
						}
					>
						{ isBusy ? (
							<Spinner />
						) : (
							__( 'Update now', 'poocommerce' )
						) }
					</Button>
				</div>
			</div>
		</div>
	);
}
