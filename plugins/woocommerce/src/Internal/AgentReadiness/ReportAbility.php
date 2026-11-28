<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Internal\AgentReadiness;

use Automattic\PooCommerce\Abilities\AbilityDefinition;

defined( 'ABSPATH' ) || exit;

/**
 * Ability that reads the readiness report, for AbilitiesLoader.
 *
 * @since 11.4.0
 */
class ReportAbility implements AbilityDefinition {

	use ReadinessAbility;

	public const NAME = 'poocommerce/get-agent-readiness';

	/**
	 * Ability name.
	 *
	 * @return string
	 */
	public static function get_name(): string {
		return self::NAME;
	}

	/**
	 * Registration arguments.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_registration_args(): array {
		return array(
			'label'               => __( 'Get agent readiness', 'poocommerce' ),
			'description'         => __( 'Read the last agent readiness check: store settings and pages that keep AI shopping agents from finding or buying products, and product problems per channel (ChatGPT, Google, Copilot), each with why it matters and what to change. Store settings are read now; product results come from the last background check.', 'poocommerce' ),
			'category'            => 'poocommerce',
			'input_schema'        => array(
				'type'                 => 'object',
				'default'              => array(),
				'additionalProperties' => false,
			),
			'output_schema'       => self::output_schema(),
			'execute_callback'    => array( self::class, 'execute' ),
			'permission_callback' => array( self::class, 'can_manage' ),
			'meta'                => array(
				'show_in_rest' => true,
				'mcp'          => array(
					'public' => true,
					'type'   => 'tool',
				),
				'annotations'  => array(
					'readonly'    => true,
					'idempotent'  => true,
					'destructive' => false,
				),
			),
		);
	}

	/**
	 * The stored report with store checks as they stand now, whether a scan is pending, and whether it has stalled.
	 *
	 * @param array<string, mixed> $input Ability input; this ability takes none.
	 * @return array<string, mixed> The report (left out before the first scan), scan_pending and scan_stalled.
	 */
	public static function execute( array $input ): array {
		unset( $input );
		$readiness = wc_get_container()->get( AgentReadiness::class );
		$scan      = wc_get_container()->get( ScheduledScan::class );
		$pending   = $scan->is_pending();
		return self::without_nulls(
			array(
				'report'       => $readiness->get_served_report(),
				'scan_pending' => $pending,
				'scan_stalled' => $pending && $scan->is_stalled(),
			)
		);
	}

	/**
	 * Output schema, following the report format in this directory's README.
	 *
	 * @return array<string, mixed>
	 */
	private static function output_schema(): array {
		$channel_map = self::channel_map_schema();
		return array(
			'type'       => 'object',
			'properties' => array(
				'report'       => array(
					'type'        => 'object',
					'description' => __( 'The last agent readiness check. Left out before the first one.', 'poocommerce' ),
					'properties'  => array(
						'generated_at'        => array(
							'type'   => 'string',
							'format' => 'date-time',
						),
						'products'            => array(
							'type'        => 'integer',
							'description' => __( 'Published simple and variable products checked.', 'poocommerce' ),
						),
						'available'           => array(
							'type'        => 'integer',
							'description' => __( 'Published products agents can see, including any past the check\'s limit.', 'poocommerce' ),
						),
						'hidden_from_catalog' => array(
							'type'        => 'integer',
							'description' => __( 'Products not checked because the merchant set them to Hidden.', 'poocommerce' ),
						),
						'unsupported_types'   => array(
							'type'        => 'integer',
							'description' => __( 'Products not checked because agents can\'t buy their type through UCP yet.', 'poocommerce' ),
						),
						'store_checks'        => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'id'         => array( 'type' => 'string' ),
									'ok'         => array(
										'type'        => 'boolean',
										'description' => __( 'True when the store passes, false when it fails. Left out when the check could not run.', 'poocommerce' ),
									),
									'group'      => array(
										'type'        => 'string',
										'enum'        => array( 'access', 'find', 'understand', 'buy', '' ),
										'description' => __( 'The question the check answers: access (can agents get in), find (can they find the store), understand (do they understand the products) or buy (can they buy). Empty in a report from before checks had a group.', 'poocommerce' ),
									),
									'blocks'     => array(
										'type'        => 'string',
										'description' => __( 'What a failure stops: listing (every product everywhere), discovery (harder for agents to find and read the store), ucp (agents using UCP) or checkout (agent orders).', 'poocommerce' ),
									),
									'level'      => array(
										'type' => 'string',
										'enum' => array( StoreConditions::LEVEL_REQUIRED, StoreConditions::LEVEL_RECOMMENDED ),
									),
									'name'       => array( 'type' => 'string' ),
									'label'      => array( 'type' => 'string' ),
									'why'        => array( 'type' => 'string' ),
									'fix'        => array( 'type' => 'string' ),
									'fix_url'    => array( 'type' => 'string' ),
									'conflict'   => array(
										'type'        => 'boolean',
										'description' => __( 'On output checks: true only when the check failed and the store is set to send this, so something else is likely replacing it.', 'poocommerce' ),
									),
									'pending'    => array(
										'type'        => 'boolean',
										'description' => __( 'On output checks: true for a check of output a coming PooCommerce update builds; it does not run yet.', 'poocommerce' ),
									),
									'skipped'    => array(
										'type'        => 'boolean',
										'description' => __( 'On output checks: true when none of the products checked has the detail, such as a barcode, so there was nothing to check.', 'poocommerce' ),
									),
									'no_product' => array(
										'type'        => 'boolean',
										'description' => __( 'On output checks: true when the check reads a product page and the store had no product it could check, so it did not run.', 'poocommerce' ),
									),
									'seen_at'    => array(
										'type'        => 'string',
										'description' => __( 'On a likely conflict: the address where it was seen. On a broken llms.txt link: that link. On a UCP endpoint check that didn\'t pass: the catalog search address that answered.', 'poocommerce' ),
									),
									'source'     => array(
										'type'        => 'string',
										'description' => __( 'On a failed UCP version check: the version the store serves. On a UCP endpoint check that didn\'t pass: the status and content type catalog search answered with, such as 403 text/html. On the llms.txt check: poocommerce, file or other when served; disabled or not_reached when not. Otherwise empty.', 'poocommerce' ),
									),
									'product'    => array(
										'type'        => 'integer',
										'description' => __( 'On a failed check of product pages: the ID of the product whose page failed. The check reads up to five product pages, the best seller first, and stops at the first that fails. Otherwise 0.', 'poocommerce' ),
									),
								),
							),
						),
						'channels'            => array(
							'type'                 => 'object',
							'additionalProperties' => array(
								'type'       => 'object',
								'properties' => array(
									'name'         => array( 'type' => 'string' ),
									'listable'     => array( 'type' => 'integer' ),
									'not_listable' => array( 'type' => 'integer' ),
									'with_gaps'    => array( 'type' => 'integer' ),
									'complete'     => array( 'type' => 'integer' ),
								),
							),
						),
						'checks'              => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'id'          => array( 'type' => 'string' ),
									'label'       => array( 'type' => 'string' ),
									'why'         => array( 'type' => 'string' ),
									'fix'         => array( 'type' => 'string' ),
									'channels'    => $channel_map,
									'count'       => array( 'type' => 'integer' ),
									'product_ids' => array(
										'type'        => 'array',
										'description' => __( 'Up to 10 failing products, in the order they were checked.', 'poocommerce' ),
										'items'       => array( 'type' => 'integer' ),
									),
									'sales_share' => array(
										'type'        => 'number',
										'description' => __( 'Share of the store\'s net sales, from 0 to 1, on the products that fail this check, over the period in sales. Left out when Analytics is off or the period has fewer than 20 orders, too few to rank by.', 'poocommerce' ),
									),
									'fix_url'     => array( 'type' => 'string' ),
								),
							),
						),
						'declared'            => array(
							'type'        => 'array',
							'description' => __( 'Protocols and files the store declares to agents. Information only: found or not found, never a problem.', 'poocommerce' ),
							'items'       => array(
								'type'       => 'object',
								'properties' => array(
									'id'    => array( 'type' => 'string' ),
									'name'  => array( 'type' => 'string' ),
									'found' => array(
										'type'        => 'boolean',
										'description' => __( 'Whether the store declares it. Left out when it could not be checked.', 'poocommerce' ),
									),
								),
							),
						),
						'truncated'           => array( 'type' => 'boolean' ),
						'bestsellers_first'   => array(
							'type'        => 'boolean',
							'description' => __( 'On a truncated check: whether the products checked start with bestsellers. False when they are the most recently modified only.', 'poocommerce' ),
						),
						'bestsellers_count'   => array(
							'type'        => 'integer',
							'description' => __( 'How many of the checked products are bestsellers placed ahead of the most recently modified. Equal to the check limit when those bestsellers fill it. Zero when the check is the most recently modified only.', 'poocommerce' ),
						),
						'pages_best_seller'   => array(
							'type'        => 'boolean',
							'description' => __( 'Whether the up to five product pages the page checks read start with the best seller. False when they start with the newest product.', 'poocommerce' ),
						),
						'sales'               => array(
							'type'        => 'object',
							'description' => __( 'The sales the shares compare: the last days, from Analytics, how many orders, and whether Analytics has imported the store\'s orders for that period. Left out while Analytics is off.', 'poocommerce' ),
							'properties'  => array(
								'days'     => array( 'type' => 'integer' ),
								'orders'   => array( 'type' => 'integer' ),
								'imported' => array( 'type' => 'boolean' ),
							),
						),
					),
				),
				'scan_pending' => array(
					'type'        => 'boolean',
					'description' => __( 'Whether a requested check has not finished yet.', 'poocommerce' ),
				),
				'scan_stalled' => array(
					'type'        => 'boolean',
					'description' => __( 'Whether the requested check has not started because scheduled actions are not running on the store. It stays queued and runs once they do; until then the report does not change.', 'poocommerce' ),
				),
			),
		);
	}
}
