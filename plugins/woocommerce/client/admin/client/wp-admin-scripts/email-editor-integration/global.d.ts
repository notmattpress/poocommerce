interface Window {
	PooCommerceEmailEditor: {
		current_post_type: string;
		current_post_id: string;
		email_types: {
			value: string;
			label: string;
			id: string;
		}[];
		block_preview_url: string;
		sender_settings: {
			from_name: string;
			from_address: string;
		};
	};
}
