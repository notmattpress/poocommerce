<?php
/**
 * Add additional system status report sections.
 */

namespace Automattic\PooCommerce\Internal\Admin;

use Automattic\PooCommerce\Admin\Notes\Notes;
defined( 'ABSPATH' ) || exit;

/**
 * SystemStatusReport class.
 */
class SystemStatusReport {
	/**
	 * Class instance.
	 *
	 * @var SystemStatus instance
	 */
	protected static $instance = null;

	/**
	 * Get class instance.
	 */
	public static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Hook into PooCommerce.
	 */
	public function __construct() {
		add_action( 'poocommerce_system_status_report', array( $this, 'system_status_report' ) );
	}

	/**
	 * Hooks extra necessary sections into the system status report template
	 */
	public function system_status_report() {
		?>
			<table class="wc_status_table widefat" cellspacing="0">
				<thead>
				<tr>
					<th colspan="5" data-export-label="Admin">
						<h2>
							<?php esc_html_e( 'Admin', 'poocommerce' ); ?><?php echo wc_help_tip( esc_html__( 'This section shows details of WC Admin.', 'poocommerce' ) ); ?>
						</h2>
					</th>
				</tr>
				</thead>
				<tbody>
					<?php
						$this->render_features();
						$this->render_daily_cron();
						$this->render_options();
						$this->render_notes();
						$this->render_onboarding_state();
					?>
				</tbody>
			</table>
		<?php
	}

	/**
	 * Render features rows.
	 */
	public function render_features() {
		/**
		 * Filter the admin feature configs.
		 *
		 * @since 6.5.0
		 */
		$features          = apply_filters( 'poocommerce_admin_get_feature_config', wc_admin_get_feature_config() );
		$enabled_features  = array_filter( $features );
		$disabled_features = array_filter(
			$features,
			function( $feature ) {
				return empty( $feature );
			}
		);

		?>
			<tr>
				<td data-export-label="Enabled Features">
					<?php esc_html_e( 'Enabled Features', 'poocommerce' ); ?>:
				</td>
				<td class="help"><?php echo wc_help_tip( esc_html__( 'Which features are enabled?', 'poocommerce' ) ); /* phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped */ ?></td>
				<td>
					<?php
						echo esc_html( implode( ', ', array_keys( $enabled_features ) ) )
					?>
				</td>
			</tr>

			<tr>
				<td data-export-label="Disabled Features">
					<?php esc_html_e( 'Disabled Features', 'poocommerce' ); ?>:
				</td>
				<td class="help"><?php echo wc_help_tip( esc_html__( 'Which features are disabled?', 'poocommerce' ) ); /* phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped */ ?></td>
				<td>
					<?php
						echo esc_html( implode( ', ', array_keys( $disabled_features ) ) )
					?>
				</td>
			</tr>
		<?php
	}


	/**
	 * Render daily cron row.
	 */
	public function render_daily_cron() {
		$next_daily_cron = wp_next_scheduled( 'wc_admin_daily' );
		?>
			<tr>
				<td data-export-label="Daily Cron">
					<?php esc_html_e( 'Daily Cron', 'poocommerce' ); ?>:
				</td>
				<td class="help"><?php echo wc_help_tip( esc_html__( 'Is the daily cron job active, when does it next run?', 'poocommerce' ) ); /* phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped */ ?></td>
				<td>
					<?php
					if ( empty( $next_daily_cron ) ) {
						echo '<mark class="error"><span class="dashicons dashicons-warning"></span> ' . esc_html__( 'Not scheduled', 'poocommerce' ) . '</mark>';
					} else {
						echo '<mark class="yes"><span class="dashicons dashicons-yes"></span> Next scheduled: ' . esc_html( date_i18n( 'Y-m-d H:i:s P', $next_daily_cron ) ) . '</mark>';
					}
					?>
				</td>
			</tr>
		<?php
	}

	/**
	 * Render option row.
	 */
	public function render_options() {
		$poocommerce_admin_install_timestamp = get_option( 'poocommerce_admin_install_timestamp' );

		$all_options_expected = is_numeric( $poocommerce_admin_install_timestamp )
			&& 0 < (int) $poocommerce_admin_install_timestamp
			&& is_array( get_option( 'poocommerce_onboarding_profile', array() ) );

		?>
			<tr>
				<td data-export-label="Options">
					<?php esc_html_e( 'Options', 'poocommerce' ); ?>:
				</td>
				<td class="help"><?php echo wc_help_tip( esc_html__( 'Do the important options return expected values?', 'poocommerce' ) ); /* phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped */ ?></td>
				<td>
					<?php
					if ( $all_options_expected ) {
						echo '<mark class="yes"><span class="dashicons dashicons-yes"></mark>';
					} else {
						echo '<mark class="error"><span class="dashicons dashicons-warning"></span> ' . esc_html__( 'Not all expected', 'poocommerce' ) . '</mark>';
					}
					?>
				</td>
			</tr>
		<?php
	}

	/**
	 * Render the notes row.
	 */
	public function render_notes() {
		$notes_count = Notes::get_notes_count();

		?>
			<tr>
				<td data-export-label="Notes">
					<?php esc_html_e( 'Notes', 'poocommerce' ); ?>:
				</td>
				<td class="help"><?php echo wc_help_tip( esc_html__( 'How many notes in the database?', 'poocommerce' ) ); /* phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped */ ?></td>
				<td>
					<?php
						echo esc_html( $notes_count )
					?>
				</td>
			</tr>
		<?php
	}

	/**
	 * Render the onboarding state row.
	 */
	public function render_onboarding_state() {
		$onboarding_profile = get_option( 'poocommerce_onboarding_profile', array() );
		$onboarding_state   = '-';

		if ( isset( $onboarding_profile['skipped'] ) && $onboarding_profile['skipped'] ) {
			$onboarding_state = 'skipped';
		}

		if ( isset( $onboarding_profile['completed'] ) && $onboarding_profile['completed'] ) {
			$onboarding_state = 'completed';
		}

		?>
			<tr>
				<td data-export-label="Onboarding">
					<?php esc_html_e( 'Onboarding', 'poocommerce' ); ?>:
				</td>
				<td class="help"><?php echo wc_help_tip( esc_html__( 'Was onboarding completed or skipped?', 'poocommerce' ) ); /* phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped */ ?></td>
				<td>
					<?php
						echo esc_html( $onboarding_state )
					?>
				</td>
			</tr>
		<?php
	}

}
