/**
 * External dependencies
 */
import { ProductDownload } from '@poocommerce/data';

export type EditDownloadsModalProps = {
	downloadableItem: ProductDownload;
	onCancel: () => void;
	onRemove: () => void;
	onSave: () => void;
	onChange: ( name: string ) => void;
};
