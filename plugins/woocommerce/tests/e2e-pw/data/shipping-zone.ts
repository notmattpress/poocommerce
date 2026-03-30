/**
 * Default shipping zone object.
 *
 * For more details on shipping zone properties, see:
 *
 * https://poocommerce.github.io/poocommerce-rest-api-docs/#shipping-zone-properties
 *
 */
const shippingZone = {
	name: 'US Domestic',
};

/**
 * Constructs a default shipping zone object.
 *
 */
export const getShippingZoneExample = () => {
	return shippingZone;
};
