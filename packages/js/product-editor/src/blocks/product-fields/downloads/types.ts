/**
 * External dependencies
 */
import { ProductDownload } from '@poocommerce/data';
import { BlockAttributes } from '@wordpress/blocks';

export interface UploadsBlockAttributes extends BlockAttributes {
	name: string;
}

export type DownloadableFileItem = {
	key: string;
	download: ProductDownload;
	uploading?: boolean;
};
