<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Internal\AgentReadiness;

use Automattic\PooCommerce\Internal\ComingSoon\ComingSoonHelper;
use Automattic\PooCommerce\Internal\Ucp\UcpDiscovery;
use Automattic\PooCommerce\StoreApi\Utilities\Ucp\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Store settings that stop agents finding or buying the store's products,
 * whatever the product data. The readiness report and the Agentic commerce
 * settings page both read this list, so they never disagree.
 *
 * `ok` says whether the store is clear of the problem the label names, or is
 * null when it couldn't be checked (StoreOutputChecks); `name` is the check
 * worded as its passing state. `group` is the merchant question the check
 * answers on Sales readiness, as for the store output checks.
 * `blocks` says what a failing condition stops: `listing` hides every product
 * on every channel, `ucp` hides the catalog from agents that use UCP,
 * `checkout` stops or weakens agent orders. A failing `required` condition
 * keeps UCP from being turned on; a failing `recommended` one is a warning.
 *
 * @since 11.4.0
 */
class StoreConditions {

	public const LEVEL_REQUIRED = 'required';

	/**
	 * Recommended conditions shown as Required, which don't keep AI shopping from being turned on:
	 * AI assistants read the catalog through the API whatever search engines are told, with no
	 * payment method no sale goes through, customers learn their order went through from its email,
	 * and AI assistants share the policy pages with shoppers before they buy. The rules file's
	 * `store_checks` can change any of them (RemoteRules).
	 */
	public const SHOWN_REQUIRED = array( 'search_visible', 'payment_method', 'order_emails', 'privacy_page', 'terms_page', 'refund_returns_page' );

	public const LEVEL_RECOMMENDED = 'recommended';

	/**
	 * Coming soon mode helper.
	 *
	 * @var ComingSoonHelper
	 */
	private ComingSoonHelper $coming_soon_helper;

	/**
	 * Initialize dependencies.
	 *
	 * @internal
	 *
	 * @param ComingSoonHelper $coming_soon_helper Coming soon mode helper.
	 */
	final public function init( ComingSoonHelper $coming_soon_helper ): void {
		$this->coming_soon_helper = $coming_soon_helper;
	}

	/**
	 * Every condition with its current state.
	 *
	 * @return array<int, array{id:string,ok:bool,blocks:string,group:string,level:string,name:string,label:string,why:string,fix:string,fix_url:string}>
	 */
	public function all(): array {
		$settings_url = static fn( string $tab ): string => admin_url( 'admin.php?page=wc-settings&tab=' . $tab );
		$policy_page  = static fn( string $id, string $option, string $name, string $label, string $why ): array => array(
			'id'      => $id,
			'ok'      => self::is_policy_page( (int) get_option( $option ) ),
			'blocks'  => 'checkout',
			'group'   => 'buy',
			'level'   => self::LEVEL_RECOMMENDED,
			'name'    => $name,
			'label'   => $label,
			'why'     => $why,
			'fix'     => __( 'Choose a published page under PooCommerce > Settings > AI tools > AI shopping.', 'poocommerce' ),
			'fix_url' => AgenticCommerceSettings::url( AgenticCommerceSettings::SHOPPING_SECTION ) . '#' . $option,
		);

		$conditions = array(
			array(
				'id'      => 'launched',
				'ok'      => $this->coming_soon_helper->is_site_live(),
				'blocks'  => 'listing',
				'group'   => 'access',
				'level'   => self::LEVEL_REQUIRED,
				'name'    => __( 'Store is launched', 'poocommerce' ),
				'label'   => __( 'Store is in coming soon mode', 'poocommerce' ),
				'why'     => __( 'Visitors, crawlers and shopping agents see a holding page instead of your products.', 'poocommerce' ),
				'fix'     => __( 'Launch the store under PooCommerce > Settings > Site visibility.', 'poocommerce' ),
				'fix_url' => $settings_url( 'site-visibility' ),
			),
			array(
				'id'      => 'search_visible',
				'ok'      => '0' !== (string) get_option( 'blog_public', '1' ),
				'blocks'  => 'listing',
				// In Store access, where the noindex check it causes sits.
				'group'   => 'access',
				'level'   => self::LEVEL_RECOMMENDED,
				'name'    => __( 'Search engines can index the store', 'poocommerce' ),
				'label'   => __( 'Store is hidden from search engines', 'poocommerce' ),
				'why'     => __( '"Discourage search engines" asks crawlers, including AI shopping crawlers, to skip your store.', 'poocommerce' ),
				'fix'     => __( 'Clear “Discourage search engines from indexing this site” under Settings > Reading.', 'poocommerce' ),
				'fix_url' => admin_url( 'options-reading.php' ),
			),
			array(
				'id'      => 'ucp_on',
				'ok'      => Utils::is_enabled(),
				'blocks'  => 'ucp',
				'group'   => 'access',
				'level'   => self::LEVEL_RECOMMENDED,
				'name'    => __( 'Universal Commerce Protocol (UCP) is on', 'poocommerce' ),
				'label'   => __( 'Universal Commerce Protocol (UCP) is off', 'poocommerce' ),
				'why'     => __( 'Shopping agents that use UCP cannot read your catalog.', 'poocommerce' ),
				'fix'     => __( 'Turn on "Allow AI assistants to shop your store" under PooCommerce > Settings > AI tools > AI shopping.', 'poocommerce' ),
				'fix_url' => AgenticCommerceSettings::url( AgenticCommerceSettings::SHOPPING_SECTION ),
			),
			array(
				'id'      => 'https',
				'ok'      => wc_site_is_https(),
				'blocks'  => 'ucp',
				'group'   => 'access',
				'level'   => self::LEVEL_REQUIRED,
				'name'    => __( 'Site uses HTTPS', 'poocommerce' ),
				'label'   => __( 'Site does not use HTTPS', 'poocommerce' ),
				'why'     => __( 'Agents only send shoppers to a secure checkout.', 'poocommerce' ),
				'fix'     => __( 'Move the site to HTTPS; your hosting provider can usually turn it on.', 'poocommerce' ),
				'fix_url' => wp_get_update_https_url(),
			),
			self::ucp_discovery( UcpDiscovery::serve_status() ),
			$policy_page(
				'privacy_page',
				AgenticCommerceSettings::PRIVACY_PAGE_OPTION,
				__( 'Privacy policy page is selected', 'poocommerce' ),
				__( 'No privacy policy page', 'poocommerce' ),
				__( 'Agents will be able to link shoppers to your privacy policy before they buy.', 'poocommerce' )
			),
			$policy_page(
				'terms_page',
				AgenticCommerceSettings::TERMS_PAGE_OPTION,
				__( 'Terms and conditions page is selected', 'poocommerce' ),
				__( 'No terms and conditions page', 'poocommerce' ),
				__( 'Agents will be able to link shoppers to your terms before they buy.', 'poocommerce' )
			),
			$policy_page(
				'refund_returns_page',
				AgenticCommerceSettings::REFUND_RETURNS_PAGE_OPTION,
				__( 'Refund and returns page is selected', 'poocommerce' ),
				__( 'No refund and returns page', 'poocommerce' ),
				__( 'Agents will be able to link shoppers to your return terms before they buy.', 'poocommerce' )
			),
			$policy_page(
				'shipping_policy_page',
				AgenticCommerceSettings::SHIPPING_POLICY_PAGE_OPTION,
				__( 'Shipping policy page is selected', 'poocommerce' ),
				__( 'No shipping policy page', 'poocommerce' ),
				__( 'Shoppers ask agents about delivery times and costs.', 'poocommerce' )
			),
			array(
				'id'      => 'payment_method',
				'ok'      => $this->payment_method_enabled(),
				'blocks'  => 'checkout',
				'group'   => 'buy',
				'level'   => self::LEVEL_RECOMMENDED,
				'name'    => __( 'A payment method is turned on', 'poocommerce' ),
				'label'   => __( 'No payment method is turned on', 'poocommerce' ),
				'why'     => __( 'Shoppers sent by an agent cannot pay for their order.', 'poocommerce' ),
				'fix'     => __( 'Turn on a payment method under PooCommerce > Settings > Payments.', 'poocommerce' ),
				'fix_url' => $settings_url( 'checkout' ),
			),
			array(
				'id'      => 'guest_checkout',
				'ok'      => ! $this->registration_required(),
				'blocks'  => 'checkout',
				'group'   => 'buy',
				'level'   => self::LEVEL_RECOMMENDED,
				'name'    => __( 'Guest checkout is allowed', 'poocommerce' ),
				'label'   => __( 'Guest checkout is off', 'poocommerce' ),
				'why'     => __( 'With guest checkout off, an AI assistant can check out only when the shopper creates an account at checkout. If account creation at checkout is off too, it can\'t. It can still find your products and build carts.', 'poocommerce' ),
				'fix'     => __( 'Tick "Enable guest checkout" under PooCommerce > Settings > Accounts & Privacy.', 'poocommerce' ),
				'fix_url' => $settings_url( 'account' ),
			),
			array(
				'id'      => 'order_emails',
				'ok'      => $this->order_confirmation_email_enabled(),
				'blocks'  => 'checkout',
				'group'   => 'buy',
				'level'   => self::LEVEL_RECOMMENDED,
				'name'    => __( 'Order confirmation emails are on', 'poocommerce' ),
				'label'   => __( 'Order confirmation emails are off', 'poocommerce' ),
				'why'     => __( 'Shoppers who buy through an agent get no confirmation from your store.', 'poocommerce' ),
				'fix'     => __( 'Turn on the Processing or Completed order email under PooCommerce > Settings > Emails.', 'poocommerce' ),
				'fix_url' => $settings_url( 'email&section=wc_email_customer_processing_order' ),
			),
		);
		return array_values( array_filter( $conditions, static fn( array $condition ): bool => ! self::is_off( $condition['id'], $condition['level'] ) ) );
	}

	/**
	 * Whether a store check is shown as Required: a required one, or one the rules file marks
	 * `required`, else one in SHOWN_REQUIRED.
	 *
	 * @param array{id:string,level:string} $check Store condition or output check.
	 */
	public static function shows_required( array $check ): bool {
		if ( self::LEVEL_REQUIRED === $check['level'] ) {
			return true;
		}
		return RemoteRules::store_check( $check['id'] )['required'] ?? in_array( $check['id'], self::SHOWN_REQUIRED, true );
	}

	/**
	 * Whether the rules file turns a store check off. A required one always runs.
	 *
	 * @param string $id    Store condition or output check id.
	 * @param string $level Its level; output checks are recommended.
	 */
	public static function is_off( string $id, string $level = self::LEVEL_RECOMMENDED ): bool {
		return self::LEVEL_REQUIRED !== $level && true === ( RemoteRules::store_check( $id )['off'] ?? false );
	}

	/**
	 * Whether this PooCommerce has the UCP checkout routes.
	 */
	public static function serves_ucp_checkout(): bool {
		return defined( Utils::class . '::CAPABILITY_CHECKOUT' );
	}

	/**
	 * The UCP address condition, with the fix for why the address doesn't serve the profile.
	 *
	 * @param string $status A status from UcpDiscovery::serve_status().
	 * @return array{id:string,ok:bool,blocks:string,group:string,level:string,name:string,label:string,why:string,fix:string,fix_url:string}
	 */
	private static function ucp_discovery( string $status ): array {
		return array(
			'id'      => 'ucp_discovery',
			'ok'      => 'ok' === $status,
			'blocks'  => 'ucp',
			'group'   => 'access',
			'level'   => self::LEVEL_REQUIRED,
			'name'    => __( 'Use a readable permalink structure', 'poocommerce' ),
			// Without a file in the way, Plain permalinks are why the connection URL doesn't load.
			'label'   => 'no_file' === $status ? __( 'Use a readable permalink structure', 'poocommerce' ) : __( 'Fix your connection URL', 'poocommerce' ),
			'why'     => 'no_file' === $status ? __( 'Any structure except Plain lets AI assistants reach your store.', 'poocommerce' ) : __( 'AI assistants use your connection URL to find your products, so it needs to load your store’s details.', 'poocommerce' ),
			'fix'     => UcpDiscovery::discovery_fix( $status ),
			// Permalinks are one fix only when nothing is serving the address. A file in the way is removed on disk.
			'fix_url' => 'no_file' === $status ? admin_url( 'options-permalink.php' ) : '',
		);
	}

	/**
	 * Ids of the required conditions that fail.
	 *
	 * @param array<int, array{id:string,ok:bool|null,level:string}>|null $conditions Conditions from all(), or null to check them now.
	 * @return array<int, string>
	 */
	public function failing_required( ?array $conditions = null ): array {
		$ids = array();
		foreach ( $conditions ?? $this->all() as $condition ) {
			if ( self::LEVEL_REQUIRED === $condition['level'] && false === $condition['ok'] ) {
				$ids[] = $condition['id'];
			}
		}
		return $ids;
	}

	/**
	 * Whether a page id is a published page other than the cart, checkout, shop or My account page.
	 *
	 * @param int $page_id Page id.
	 */
	public static function is_policy_page( int $page_id ): bool {
		return $page_id > 0 && 'page' === get_post_type( $page_id ) && 'publish' === get_post_status( $page_id ) && ! in_array( $page_id, self::store_page_ids(), true );
	}

	/**
	 * The cart, checkout, shop and My account pages, which can't be a policy page.
	 * Advanced > Page setup leaves them out of its terms and refund fields too.
	 *
	 * @return array<int, int>
	 */
	public static function store_page_ids(): array {
		return array_values(
			array_filter(
				array_map( 'wc_get_page_id', array( 'cart', 'checkout', 'shop', 'myaccount' ) ),
				static fn ( $page_id ) => $page_id > 0
			)
		);
	}

	/**
	 * Whether checkout requires an account, as WC_Checkout::is_registration_required()
	 * answers it, without starting the checkout in a background scan.
	 */
	private function registration_required(): bool {
		// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment -- Core's hook, documented in WC_Checkout.
		return (bool) apply_filters( 'poocommerce_checkout_registration_required', 'yes' !== get_option( 'poocommerce_enable_guest_checkout' ) );
	}

	/**
	 * Whether any payment gateway is turned on. Whether it can take a given order
	 * depends on the cart, so this reads the setting, not is_available().
	 */
	private function payment_method_enabled(): bool {
		foreach ( WC()->payment_gateways()->payment_gateways() as $gateway ) {
			if ( $gateway instanceof \WC_Payment_Gateway && 'yes' === $gateway->enabled ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Whether a shopper gets an order email after checkout. Virtual orders skip
	 * processing and are confirmed by the Completed order email instead.
	 */
	private function order_confirmation_email_enabled(): bool {
		$emails = WC()->mailer()->get_emails();
		foreach ( array( 'WC_Email_Customer_Processing_Order', 'WC_Email_Customer_Completed_Order' ) as $id ) {
			$email = $emails[ $id ] ?? null;
			if ( $email instanceof \WC_Email && $email->is_enabled() ) {
				return true;
			}
		}
		return false;
	}
}
