<?php
/**
 * AdminSettingsHandler class file.
 */

declare( strict_types=1 );

namespace Automattic\PooCommerce\Internal\FraudProtection;

defined( 'ABSPATH' ) || exit;

/**
 * Handles admin settings for fraud protection.
 *
 * @since 10.5.0
 */
class AdminSettingsHandler {

	/**
	 * Jetpack connection manager instance.
	 *
	 * @var JetpackConnectionManager
	 */
	private $connection_manager;

	/**
	 * Register hooks.
	 */
	public function register(): void {
		add_filter( 'poocommerce_get_settings_advanced', array( $this, 'add_jetpack_connection_field' ), 100, 2 );
		add_action( 'poocommerce_admin_field_jetpack_connection', array( $this, 'handle_output_jetpack_connection_field' ), 10, 1 );
	}


	/**
	 * Initialize the class with dependencies.
	 *
	 * @internal
	 *
	 * @param JetpackConnectionManager $connection_manager Jetpack connection manager instance.
	 * @return void
	 */
	final public function init( JetpackConnectionManager $connection_manager ): void {
		$this->connection_manager = $connection_manager;
	}

	/**
	 * Add Jetpack connection field to fraud protection settings.
	 *
	 * @internal
	 *
	 * @param array  $settings Existing settings.
	 * @param string $current_section Current section name.
	 * @return array Modified settings.
	 */
	public function add_jetpack_connection_field( $settings, $current_section ): array {
		// Only add on the features section.
		if ( 'features' !== $current_section ) {
			return $settings;
		}

		// Check if field already exists to prevent duplicates.
		foreach ( $settings as $setting ) {
			if ( isset( $setting['id'] ) && 'poocommerce_fraud_protection_jetpack_connection' === $setting['id'] ) {
				return $settings;
			}
		}

		// Find the fraud_protection field and add Jetpack connection field after it.
		$new_settings = array();
		foreach ( $settings as $setting ) {
			$new_settings[] = $setting;

			// Add Jetpack connection field after fraud_protection checkbox.
			if ( isset( $setting['id'] ) && 'poocommerce_feature_fraud_protection_enabled' === $setting['id'] ) {
				$new_settings[] = array(
					'id'    => 'poocommerce_fraud_protection_jetpack_connection',
					'type'  => 'jetpack_connection',
					'title' => __( 'Jetpack Connection', 'poocommerce' ),
					'desc'  => __( 'Connect your site to Jetpack to enable fraud protection features.', 'poocommerce' ),
				);
			}
		}

		return $new_settings;
	}

	/**
	 * Output the Jetpack connection field.
	 *
	 * @internal
	 *
	 * @param array $value Field configuration.
	 * @return void
	 */
	public function handle_output_jetpack_connection_field( $value ): void { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		// Only show Jetpack connection when fraud protection is enabled.
		if ( 'yes' !== get_option( 'poocommerce_feature_fraud_protection_enabled', 'no' ) ) {
			return;
		}

		$this->output_jetpack_connection_status();
	}

	/**
	 * Output the Jetpack connection status and button.
	 *
	 * @internal
	 *
	 * @return void
	 */
	private function output_jetpack_connection_status(): void {
		// Get connection status from connection manager.
		$connection_status = $this->connection_manager->get_connection_status();
		?>
		<tr valign="top">
			<th scope="row" class="titledesc">
				<label><?php esc_html_e( 'Jetpack Connection', 'poocommerce' ); ?></label>
			</th>
			<td class="forminp forminp-button">
				<?php if ( ! $connection_status['connected'] ) : ?>
					<?php
					// Get authorization URL for connecting.
					$redirect_url   = admin_url( 'admin.php?page=wc-settings&tab=advanced&section=features' );
					$connection_url = $this->connection_manager->get_authorization_url( $redirect_url );

					// If we couldn't get authorization URL, show error message.
					if ( ! $connection_url ) :
						?>
						<p class="description" style="color: #dc3232;">
							<?php echo esc_html( $connection_status['error'] ); ?>
						</p>
					<?php else : ?>
						<a href="<?php echo esc_url( $connection_url ); ?>" class="button button-secondary jetpack_connection_button">
							<?php esc_html_e( 'Connect to Jetpack', 'poocommerce' ); ?>
						</a>
						<p class="description">
							<?php esc_html_e( 'Connect your site to Jetpack to enable fraud protection features.', 'poocommerce' ); ?>
						</p>
					<?php endif; ?>
				<?php else : ?>
					<span class="dashicons dashicons-yes-alt" style="color: #46b450;"></span>
					<span><?php esc_html_e( 'Connected to Jetpack', 'poocommerce' ); ?></span>
					<p class="description">
						<?php
						printf(
							/* translators: %d: Blog ID */
							esc_html__( 'Site ID: %d', 'poocommerce' ),
							(int) $connection_status['blog_id']
						);
						?>
					</p>
				<?php endif; ?>
			</td>
		</tr>
		<?php
	}
}
