/**
 * External dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';
import { PLACEHOLDER_IMG_SRC } from '@poocommerce/settings';

interface ProductImageProps {
	image: { alt?: string; thumbnail?: string };
	fallbackAlt: string;
}
/**
 * Formats and returns an image element.
 *
 * @param {Object} props       Incoming props for the component.
 * @param {Object} props.image Image properties.
 */

const ProductImage = ( {
	image = {},
	fallbackAlt = '',
}: ProductImageProps ): JSX.Element => {
	const imageProps = image.thumbnail
		? {
				src: image.thumbnail,
				alt:
					decodeEntities( image.alt ) ||
					fallbackAlt ||
					'Product Image',
		  }
		: {
				src: PLACEHOLDER_IMG_SRC,
				alt: '',
		  };

	return <img { ...imageProps } alt={ imageProps.alt } />;
};

export default ProductImage;
