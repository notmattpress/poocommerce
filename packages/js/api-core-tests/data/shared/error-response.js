/**
 * API error response format
 *
 * https://poocommerce.github.io/poocommerce-rest-api-docs/#errors
 */
const errorResponse = {
	code: '',
	message: '',
	data: {
		status: 400,
	},
};

module.exports = { errorResponse };
