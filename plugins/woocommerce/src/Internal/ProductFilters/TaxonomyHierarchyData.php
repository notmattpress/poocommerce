<?php

declare(strict_types=1);

namespace Automattic\PooCommerce\Internal\ProductFilters;

defined( 'ABSPATH' ) || exit;

/**
 * Class for managing taxonomy hierarchy data with performance optimization.
 *
 * @internal For exclusive usage of PooCommerce core, backwards compatibility not guaranteed.
 */
class TaxonomyHierarchyData {

	/**
	 * Cache group for taxonomy hierarchy data.
	 */
	private const CACHE_GROUP = 'wc_taxonomy_hierarchy';

	/**
	 * In-memory cache for hierarchy maps.
	 *
	 * @var array
	 */
	private $hierarchy_data = array();

	/**
	 * Get optimized hierarchy map for a taxonomy.
	 *
	 * @param string $taxonomy The taxonomy name.
	 * @return array Hierarchy map structure optimized for the taxonomy size.
	 */
	public function get_hierarchy_map( string $taxonomy ): array {
		if ( ! is_taxonomy_hierarchical( $taxonomy ) ) {
			return array();
		}

		// Check in-memory cache first.
		if ( isset( $this->hierarchy_data[ $taxonomy ] ) ) {
			return $this->hierarchy_data[ $taxonomy ];
		}

		// Check option cache.
		$cache_key  = self::CACHE_GROUP . '_' . $taxonomy;
		$cached_map = null;

		if ( ! ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ) {
			$cached_map = get_option( $cache_key );
		}

		if ( ! empty( $cached_map ) ) {
			// Cache in memory and return.
			$this->hierarchy_data[ $taxonomy ] = $cached_map;
			return $cached_map;
		}

		// Build the complete hierarchy map with all descendants pre-computed.
		$map = $this->build_full_hierarchy_map( $taxonomy );

		// Cache the map in options and memory.
		if ( ! ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ) {
			update_option( $cache_key, $map, false );
		}

		$this->hierarchy_data[ $taxonomy ] = $map;

		return $map;
	}


	/**
	 * Build complete hierarchy map with all relationships pre-computed.
	 *
	 * Pre-computes all descendants for maximum query speed, which is essential
	 * for product filtering where parent category filters must include all
	 * subcategory products regardless of hierarchy depth.
	 *
	 * @param string $taxonomy The taxonomy name.
	 * @return array Complete hierarchy map with parents, children, and descendants.
	 */
	private function build_full_hierarchy_map( string $taxonomy ): array {
		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'fields'     => 'id=>parent',
			)
		);

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return array();
		}

		$map = array(
			'parents'     => array(),
			'children'    => array(),
			'descendants' => array(),
		);

		// Build basic parent-child relationships.
		foreach ( $terms as $term_id => $parent_id ) {
			$map['parents'][ $term_id ] = $parent_id;

			if ( ! isset( $map['children'][ $parent_id ] ) ) {
				$map['children'][ $parent_id ] = array();
			}
			$map['children'][ $parent_id ][] = $term_id;
		}

		// Pre-compute all descendants for each term.
		foreach ( array_keys( $map['parents'] ) as $term_id ) {
			$map['descendants'][ $term_id ] = $this->compute_descendants( $term_id, $map['children'] );
		}

		return $map;
	}


	/**
	 * Compute all descendants of a term.
	 *
	 * @param int   $term_id  The term ID.
	 * @param array $children Children relationships map.
	 * @return array Array of descendant term IDs.
	 */
	private function compute_descendants( int $term_id, array $children ): array {
		$descendants = array();

		if ( ! isset( $children[ $term_id ] ) ) {
			return $descendants;
		}

		foreach ( $children[ $term_id ] as $child_id ) {
			$descendants[] = $child_id;
			$descendants   = array_merge( $descendants, $this->compute_descendants( $child_id, $children ) );
		}

		return array_unique( $descendants );
	}

	/**
	 * Get parent term ID for a given term.
	 *
	 * @param int    $term_id  The term ID.
	 * @param string $taxonomy The taxonomy name.
	 * @return int The parent term ID (0 if root level).
	 */
	public function get_parent( int $term_id, string $taxonomy ): int {
		$map = $this->get_hierarchy_map( $taxonomy );
		return $map['parents'][ $term_id ] ?? 0;
	}

	/**
	 * Get all descendants for a term.
	 *
	 * @param int    $term_id  The term ID.
	 * @param string $taxonomy The taxonomy name.
	 * @return array Array of all descendant term IDs.
	 */
	public function get_descendants( int $term_id, string $taxonomy ): array {
		$map = $this->get_hierarchy_map( $taxonomy );
		return $map['descendants'][ $term_id ] ?? array();
	}

	/**
	 * Clear hierarchy cache for a taxonomy.
	 *
	 * @param string $taxonomy The taxonomy name.
	 */
	public function clear_cache( string $taxonomy ): void {
		// Clear in-memory cache for this taxonomy.
		unset( $this->hierarchy_data[ $taxonomy ] );

		// Clear only the specific taxonomy's option cache.
		$cache_key = self::CACHE_GROUP . '_' . $taxonomy;
		delete_option( $cache_key );
	}
}
