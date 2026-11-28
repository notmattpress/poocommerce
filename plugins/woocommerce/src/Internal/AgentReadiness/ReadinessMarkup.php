<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Internal\AgentReadiness;

defined( 'ABSPATH' ) || exit;

/**
 * The wording of setup steps that AI shopping's Setup checklist and Sales readiness share: what each
 * open step asks, why it matters and where to fix it.
 *
 * @since 11.4.0
 */
trait ReadinessMarkup {

	/**
	 * A setup step that passed or couldn't run: its step title and why it matters, as in the AI shopping checklist.
	 *
	 * @param array{id:string,name:string,ok?:bool|null,label?:string,why:string,fix?:string,fix_url:string} $check Store condition.
	 * @return array{0:string,1:string} The title and why.
	 */
	private static function passed_step( array $check ): array {
		// The connection URL step's label and why describe its failure, so a passed one says what it needs.
		if ( 'ucp_discovery' === $check['id'] ) {
			return array( $check['name'], __( 'Any structure except Plain lets AI assistants reach your store.', 'poocommerce' ) );
		}
		$action = self::check_action( $check );
		return array( $action[0], $action[1] );
	}

	/**
	 * What an open check asks the merchant to do: the action, why it matters and where to do it.
	 * A policy page that is chosen but not published links to its editor; a published store page asks for another page.
	 *
	 * @param array{id:string,ok?:bool|null,label?:string,why:string,fix?:string,fix_url:string} $check Store condition.
	 * @return array{0:string,1:string,2:string,3:string,4:string} The action, why, where to do it, the link text when the URL alone doesn't say it, and the fix line.
	 */
	private static function check_action( array $check ): array {
		// The connection URL step names its cause in the fix line: Plain permalinks, or a file in the way.
		if ( 'ucp_discovery' === $check['id'] ) {
			return array( $check['label'] ?? '', $check['why'], $check['fix_url'], '' !== $check['fix_url'] ? __( 'Change permalinks', 'poocommerce' ) : '', (string) ( $check['fix'] ?? '' ) );
		}
		// The privacy field is a WordPress setting. A user who can open this page but not manage
		// privacy options would otherwise get a Review link to a field this page does not render.
		if ( 'privacy_page' === $check['id'] && empty( $check['ok'] ) && ! current_user_can( 'manage_privacy_options' ) ) {
			$page_id = (int) get_option( AgenticCommerceSettings::PRIVACY_PAGE_OPTION );
			$draft   = $page_id > 0 && get_post( $page_id ) && 'publish' !== get_post_status( $page_id ) && current_user_can( 'edit_post', $page_id );
			if ( ! $draft ) {
				return array(
					__( 'Choose a privacy policy page', 'poocommerce' ),
					__( 'Someone who can manage privacy options needs to select a published privacy policy page under Settings > Privacy.', 'poocommerce' ),
					'',
					'',
					'',
				);
			}
		}
		$policies = array(
			'privacy_page'         => array( AgenticCommerceSettings::PRIVACY_PAGE_OPTION, __( 'Publish your privacy policy page', 'poocommerce' ), __( 'Choose a privacy policy page', 'poocommerce' ), __( 'Shoppers can read how you handle their information before they buy.', 'poocommerce' ), __( 'Edit privacy policy', 'poocommerce' ), __( 'A privacy policy needs to be published for AI assistants to share it with shoppers.', 'poocommerce' ) ),
			'terms_page'           => array( AgenticCommerceSettings::TERMS_PAGE_OPTION, __( 'Publish your terms and conditions page', 'poocommerce' ), __( 'Choose a terms and conditions page', 'poocommerce' ), __( 'Terms and conditions set out what shoppers agree to when they place an order.', 'poocommerce' ), __( 'Edit terms and conditions', 'poocommerce' ), __( 'Terms and conditions need to be published for AI assistants to share them with shoppers.', 'poocommerce' ) ),
			'refund_returns_page'  => array( AgenticCommerceSettings::REFUND_RETURNS_PAGE_OPTION, __( 'Publish your refund and returns policy page', 'poocommerce' ), __( 'Choose a refund and returns policy page', 'poocommerce' ), __( 'Shoppers can check whether they can return an item before they buy.', 'poocommerce' ), __( 'Edit refund policy', 'poocommerce' ), __( 'A refund policy needs to be published for AI assistants to share it with shoppers.', 'poocommerce' ) ),
			'shipping_policy_page' => array( AgenticCommerceSettings::SHIPPING_POLICY_PAGE_OPTION, __( 'Publish your shipping policy page', 'poocommerce' ), __( 'Choose a shipping policy page', 'poocommerce' ), __( 'AI assistants share it so shoppers can check how and when you deliver before they buy.', 'poocommerce' ), __( 'Edit shipping policy', 'poocommerce' ), __( 'A shipping policy needs to be published for AI assistants to share it with shoppers.', 'poocommerce' ) ),
		);
		if ( isset( $policies[ $check['id'] ] ) ) {
			$policy  = $policies[ $check['id'] ];
			$page_id = (int) get_option( $policy[0] );
			$edit    = $page_id > 0 && get_post( $page_id ) && 'publish' !== get_post_status( $page_id ) ? (string) get_edit_post_link( $page_id, 'raw' ) : '';
			return '' !== $edit
				? array( $policy[1], $policy[5], $edit, $policy[4], '' )
				: array( $policy[2], $policy[3], $check['fix_url'], '', '' );
		}
		// The action and why, then the fix line where the step names a setting to change.
		$actions = array(
			'launched'       => array( __( 'Make your store live', 'poocommerce' ), __( 'AI assistants can only find your products when your store is live.', 'poocommerce' ) ),
			'https'          => array( __( 'Use a secure connection (HTTPS)', 'poocommerce' ), __( 'AI assistants only connect to stores with a secure connection.', 'poocommerce' ) ),
			'search_visible' => array( __( 'Let search engines index your store', 'poocommerce' ), __( 'AI assistants use search engines to find stores and products.', 'poocommerce' ), (string) ( $check['fix'] ?? '' ) ),
			'guest_checkout' => array( __( 'Allow guest checkout', 'poocommerce' ), __( 'Guest checkout lets shoppers from AI assistants pay without creating an account.', 'poocommerce' ) ),
			'order_emails'   => array( __( 'Turn on order confirmation emails', 'poocommerce' ), __( 'An email lets customers know their order went through.', 'poocommerce' ) ),
			'payment_method' => array( __( 'Set up payments', 'poocommerce' ), __( 'A payment method is needed so shoppers can pay on your checkout.', 'poocommerce' ) ),
		);
		$action  = $actions[ $check['id'] ] ?? array( $check['label'] ?? '', $check['why'] );
		// Site Health says how to move to HTTPS, and offers to do it where the host allows.
		return array( $action[0], $action[1], 'https' === $check['id'] ? admin_url( 'site-health.php' ) : $check['fix_url'], '', $action[2] ?? '' );
	}

	/**
	 * A setup step's button, as in the design: where it goes, or Review. Policy steps repeat the same
	 * button, so screen readers also hear which policy it is for.
	 *
	 * @param string $id   Store condition ID.
	 * @param string $link The link text check_action() gives when the URL alone doesn't say it, such as Change permalinks.
	 * @return array{0:string,1:string} The button text, and the policy it is for, or ''.
	 */
	private static function step_button( string $id, string $link ): array {
		// Policy buttons repeat, so each one's accessible name says which page it is for.
		$policies = array(
			'privacy_page'         => array( __( 'Choose a privacy policy page', 'poocommerce' ), __( 'Edit your privacy policy page', 'poocommerce' ) ),
			'terms_page'           => array( __( 'Choose a terms and conditions page', 'poocommerce' ), __( 'Edit your terms and conditions page', 'poocommerce' ) ),
			'refund_returns_page'  => array( __( 'Choose a refund and returns policy page', 'poocommerce' ), __( 'Edit your refund and returns policy page', 'poocommerce' ) ),
			'shipping_policy_page' => array( __( 'Choose a shipping policy page', 'poocommerce' ), __( 'Edit your shipping policy page', 'poocommerce' ) ),
		);
		if ( isset( $policies[ $id ] ) ) {
			// A policy page that is still a draft opens its editor.
			return '' !== $link ? array( __( 'Edit page', 'poocommerce' ), $policies[ $id ][1] ) : array( __( 'Choose page', 'poocommerce' ), $policies[ $id ][0] );
		}
		$labels = array(
			'https'          => __( 'View Site Health', 'poocommerce' ),
			'launched'       => __( 'Change site visibility', 'poocommerce' ),
			'guest_checkout' => __( 'View account settings', 'poocommerce' ),
			'payment_method' => __( 'View payment settings', 'poocommerce' ),
			'order_emails'   => __( 'View email settings', 'poocommerce' ),
			'search_visible' => __( 'Change Reading settings', 'poocommerce' ),
			// Change permalinks, and only when permalinks are one of the fixes.
			'ucp_discovery'  => $link,
		);
		$label  = $labels[ $id ] ?? '';
		return array( '' !== $label ? $label : __( 'Review', 'poocommerce' ), '' );
	}
}
