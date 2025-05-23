/**
 * Internal dependencies
 */

export type SettingDefinition = {
	default: string;
	description: string;
	id: string;
	label: string;
	options?: Record< string, Record< string, string > >;
	placeholder: string;
	tip: string;
	type: string;
	value: string | string[];
	is_dismissed: string;
};

export type PaymentGateway< TSettings = Record< string, SettingDefinition > > =
	{
		id: string;
		title: string;
		description: string;
		order: number | '';
		enabled: boolean;
		method_title: string;
		method_description: string;
		method_supports: string[];
		settings: TSettings;
		settings_url: string;
		needs_setup?: boolean;
	};

export type PaymentGatewayUpdatePayload = PaymentGateway<
	Record< string, string | string[] >
>;

export type PluginsState = {
	paymentGateways: PaymentGateway[];
	isUpdating: boolean;
	errors: Record< string, unknown >;
};
