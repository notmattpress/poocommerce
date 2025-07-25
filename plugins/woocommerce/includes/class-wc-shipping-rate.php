<?php
/**
 * PooCommerce Shipping Rate
 *
 * Simple Class for storing rates.
 *
 * @package PooCommerce\Classes\Shipping
 * @since   2.6.0
 */

declare( strict_types=1 );

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Enums\ProductTaxStatus;

/**
 * Shipping rate class.
 */
class WC_Shipping_Rate implements JsonSerializable {

	/**
	 * Stores data for this rate.
	 *
	 * @since 9.2.0 Added description and delivery_time.
	 * @var array
	 */
	protected $data = array(
		'id'            => '',
		'method_id'     => '',
		'instance_id'   => 0,
		'label'         => '',
		'cost'          => 0,
		'taxes'         => array(),
		'tax_status'    => ProductTaxStatus::TAXABLE,
		'description'   => '',
		'delivery_time' => '',
	);

	/**
	 * Stores meta data for this rate.
	 *
	 * @var array
	 */
	protected $meta_data = array();

	/**
	 * Constructor.
	 *
	 * @param string  $id            Shipping rate ID.
	 * @param string  $label         Shipping rate label.
	 * @param integer $cost          Cost.
	 * @param array   $taxes         Taxes applied to shipping rate.
	 * @param string  $method_id     Shipping method ID.
	 * @param int     $instance_id   Shipping instance ID.
	 * @param string  $tax_status    Tax status.
	 * @param string  $description   Shipping rate description.
	 * @param string  $delivery_time Shipping rate delivery time.
	 */
	public function __construct( $id = '', $label = '', $cost = 0, $taxes = array(), $method_id = '', $instance_id = 0, $tax_status = ProductTaxStatus::TAXABLE, $description = '', $delivery_time = '' ) {
		$this->set_id( $id );
		$this->set_label( $label );
		$this->set_cost( $cost );
		$this->set_taxes( $taxes );
		$this->set_method_id( $method_id );
		$this->set_instance_id( $instance_id );
		$this->set_tax_status( $tax_status );
		$this->set_description( $description );
		$this->set_delivery_time( $delivery_time );
	}

	/**
	 * Magic method to support direct access to data prop.
	 *
	 * @param string $key Key.
	 * @return bool
	 */
	public function __isset( $key ) {
		return isset( $this->data[ $key ] );
	}

	/**
	 * Magic methods to support direct access to props.
	 *
	 * @param string $key Key.
	 * @return mixed
	 */
	public function __get( $key ) {
		if ( is_callable( array( $this, "get_{$key}" ) ) ) {
			return $this->{"get_{$key}"}();
		}

		if ( isset( $this->data[ $key ] ) ) {
			return $this->data[ $key ];
		}

		return '';
	}

	/**
	 * Magic methods to support direct access to props.
	 *
	 * @since 3.2.0
	 * @param string $key   Key.
	 * @param mixed  $value Value.
	 */
	public function __set( $key, $value ) {
		if ( is_callable( array( $this, "set_{$key}" ) ) ) {
			$this->{"set_{$key}"}( $value );
		} else {
			$this->data[ $key ] = $value;
		}
	}

	/**
	 * When converted to JSON.
	 *
	 * @return object|array
	 */
	#[\ReturnTypeWillChange]
	public function jsonSerialize() {
		return array(
			'data'      => $this->data,
			'meta_data' => $this->meta_data,
		);
	}

	/**
	 * Set ID for the rate. This is usually a combination of the method and instance IDs.
	 *
	 * @since 3.2.0
	 * @param string $id Shipping rate ID.
	 */
	public function set_id( $id ) {
		$this->data['id'] = (string) $id;
	}

	/**
	 * Set shipping method ID the rate belongs to.
	 *
	 * @since 3.2.0
	 * @param string $method_id Shipping method ID.
	 */
	public function set_method_id( $method_id ) {
		$this->data['method_id'] = (string) $method_id;
	}

	/**
	 * Set instance ID the rate belongs to.
	 *
	 * @since 3.2.0
	 * @param int $instance_id Instance ID.
	 */
	public function set_instance_id( $instance_id ) {
		$this->data['instance_id'] = absint( $instance_id );
	}

	/**
	 * Set rate label.
	 *
	 * @since 3.2.0
	 * @param string $label Shipping rate label.
	 */
	public function set_label( $label ) {
		$this->data['label'] = (string) $label;
	}

	/**
	 * Set rate cost.
	 *
	 * @todo 4.0 Prevent negative value being set. #19293
	 * @since 3.2.0
	 * @param string $cost Shipping rate cost.
	 */
	public function set_cost( $cost ) {
		$this->data['cost'] = $cost;
	}

	/**
	 * Set rate taxes.
	 *
	 * @since 3.2.0
	 * @param array $taxes List of taxes applied to shipping rate.
	 */
	public function set_taxes( $taxes ) {
		$this->data['taxes'] = ! empty( $taxes ) && is_array( $taxes ) ? $taxes : array();
	}

	/**
	 * Set tax status.
	 *
	 * @since 9.6.0
	 * @param string $value Tax status.
	 */
	public function set_tax_status( $value ) {
		if ( in_array( $value, array( ProductTaxStatus::TAXABLE, ProductTaxStatus::NONE ), true ) ) {
			$this->data['tax_status'] = $value;
		}
	}

	/**
	 * Set rate description.
	 *
	 * @since 9.2.0
	 * @param string $description Shipping rate description.
	 */
	public function set_description( $description ) {
		$this->data['description'] = (string) $description;
	}

	/**
	 * Set rate delivery time.
	 *
	 * @since 9.2.0
	 * @param string $delivery_time Shipping rate delivery time.
	 */
	public function set_delivery_time( $delivery_time ) {
		$this->data['delivery_time'] = (string) $delivery_time;
	}

	/**
	 * Get ID for the rate. This is usually a combination of the method and instance IDs.
	 *
	 * @since 3.2.0
	 * @return string
	 */
	public function get_id() {
		/**
		 * Filter the shipping rate ID.
		 *
		 * @since 3.2.0
		 * @param string $id The shipping rate ID.
		 * @param WC_Shipping_Rate $this The shipping rate object.
		 */
		return apply_filters( 'poocommerce_shipping_rate_id', $this->data['id'], $this );
	}

	/**
	 * Get shipping method ID the rate belongs to.
	 *
	 * @since 3.2.0
	 * @return string
	 */
	public function get_method_id() {
		/**
		 * Filter the shipping method ID.
		 *
		 * @since 3.2.0
		 * @param string $method_id The shipping method ID.
		 * @param WC_Shipping_Rate $this The shipping rate object.
		 */
		return apply_filters( 'poocommerce_shipping_rate_method_id', $this->data['method_id'], $this );
	}

	/**
	 * Get instance ID the rate belongs to.
	 *
	 * @since 3.2.0
	 * @return int
	 */
	public function get_instance_id() {
		/**
		 * Filter the shipping rate instance ID.
		 *
		 * @since 3.2.0
		 * @param int $instance_id The shipping rate instance ID.
		 * @param WC_Shipping_Rate $this The shipping rate object.
		 */
		return apply_filters( 'poocommerce_shipping_rate_instance_id', $this->data['instance_id'], $this );
	}

	/**
	 * Get rate label.
	 *
	 * @return string
	 */
	public function get_label() {
		/**
		 * Filter the shipping rate label.
		 *
		 * @since 3.2.0
		 * @param string $label The shipping rate label.
		 * @param WC_Shipping_Rate $this The shipping rate object.
		 */
		return apply_filters( 'poocommerce_shipping_rate_label', $this->data['label'], $this );
	}

	/**
	 * Get rate cost.
	 *
	 * @since 3.2.0
	 * @return string
	 */
	public function get_cost() {
		/**
		 * Filter the shipping rate cost.
		 *
		 * @since 3.2.0
		 * @param string $cost The shipping rate cost.
		 * @param WC_Shipping_Rate $this The shipping rate object.
		 */
		return apply_filters( 'poocommerce_shipping_rate_cost', $this->data['cost'], $this );
	}

	/**
	 * Get rate taxes.
	 *
	 * @since 3.2.0
	 * @return array
	 */
	public function get_taxes() {
		/**
		 * Filter the shipping rate taxes.
		 *
		 * @since 3.2.0
		 * @param array $taxes The shipping rate taxes.
		 * @param WC_Shipping_Rate $this The shipping rate object.
		 */
		return apply_filters( 'poocommerce_shipping_rate_taxes', $this->data['taxes'], $this );
	}

	/**
	 * Get shipping tax.
	 *
	 * @return float
	 */
	public function get_shipping_tax() {
		$taxes = $this->get_taxes();

		/**
		 * Filter the shipping rate taxes.
		 *
		 * @since 3.2.0
		 * @param array $taxes The shipping rate taxes.
		 * @param WC_Shipping_Rate $this The shipping rate object.
		 */
		return apply_filters( 'poocommerce_get_shipping_tax', count( $taxes ) > 0 && ! WC()->customer->get_is_vat_exempt() ? (float) array_sum( $taxes ) : 0.0, $this );
	}

	/**
	 * Get tax status.
	 *
	 * @return string
	 */
	public function get_tax_status() {
		/**
		 * Filter to allow tax status to be overridden for a shipping rate.
		 *
		 * @since 9.9.0
		 * @param string $tax_status Tax status.
		 * @param WC_Shipping_Rate $this Shipping rate object.
		 */
		return apply_filters( 'poocommerce_shipping_rate_tax_status', $this->data['tax_status'], $this );
	}

	/**
	 * Get rate description.
	 *
	 * @since 9.2.0
	 * @return string
	 */
	public function get_description() {
		/**
		 * Filter the shipping rate description.
		 *
		 * @since 9.2.0
		 *
		 * @param string            $description The current description.
		 * @param WC_Shipping_Rate  $this        The shipping rate.
		 */
		return apply_filters( 'poocommerce_shipping_rate_description', $this->data['description'], $this );
	}

	/**
	 * Get rate delivery time.
	 *
	 * @since 9.2.0
	 * @return string
	 */
	public function get_delivery_time() {
		/**
		 * Filter the shipping rate delivery time.
		 *
		 * @since 9.2.0
		 *
		 * @param string            $delivery_time The current description.
		 * @param WC_Shipping_Rate  $this          The shipping rate.
		 */
		return apply_filters( 'poocommerce_shipping_rate_delivery_time', $this->data['delivery_time'], $this );
	}

	/**
	 * Add some meta data for this rate.
	 *
	 * @since 2.6.0
	 * @param string $key   Key.
	 * @param string $value Value.
	 */
	public function add_meta_data( $key, $value ) {
		$this->meta_data[ wc_clean( $key ) ] = wc_clean( $value );
	}

	/**
	 * Get all meta data for this rate.
	 *
	 * @since 2.6.0
	 * @return array
	 */
	public function get_meta_data() {
		return $this->meta_data;
	}
}
