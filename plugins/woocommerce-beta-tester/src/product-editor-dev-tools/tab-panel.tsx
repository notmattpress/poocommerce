export function TabPanel( {
	isSelected,
	children,
}: {
	isSelected: boolean;
	children: React.ReactNode;
} ) {
	return (
		<div
			className="poocommerce-product-editor-dev-tools-bar__tab-panel"
			style={ isSelected ? {} : { display: 'none' } }
		>
			{ children }
		</div>
	);
}
