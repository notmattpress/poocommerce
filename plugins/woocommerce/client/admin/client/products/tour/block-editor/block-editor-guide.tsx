/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Guide from '../components/guide';
import './style.scss';

const PageContent = ( {
	page,
}: {
	page: {
		heading: string;
		text: string;
	};
} ) => (
	<>
		<h1 className="poocommerce-block-editor-guide__heading">
			{ page.heading }
		</h1>
		<p className="poocommerce-block-editor-guide__text">{ page.text }</p>
	</>
);

const PageImage = ( {
	page,
}: {
	page: {
		index: number;
	};
} ) => (
	<div
		className={ `poocommerce-block-editor-guide__header poocommerce-block-editor-guide__header-${
			page.index + 1
		}` }
	></div>
);

interface BlockEditorGuideProps {
	isNewUser?: boolean;
	onCloseGuide: ( currentPage: number, origin: 'close' | 'finish' ) => void;
}

const BlockEditorGuide = ( { onCloseGuide }: BlockEditorGuideProps ) => {
	const pagesConfig = [
		{
			heading: __( 'Fresh and modern interface', 'poocommerce' ),
			text: __(
				'Everything you need to create and sell your products, all in one place. From photos and descriptions to pricing and inventory, all of your product settings can be found here.',
				'poocommerce'
			),
		},
		{
			heading: __( 'Content-rich product descriptions', 'poocommerce' ),
			text: __(
				"Show off what's great about your products and engage your customers with content-rich product descriptions. Add images, videos, and any other content they might need to make a purchase.",
				'poocommerce'
			),
		},
		{
			heading: __( 'Lightning fast performance ', 'poocommerce' ),
			text: __(
				'Get your products listed and available for purchase in no time! Our modern technology ensures a reliable and streamlined experience.',
				'poocommerce'
			),
		},
		{
			heading: __( 'More features are on the way', 'poocommerce' ),
			text: __(
				"We're actively working on adding more features to the product form, including the ability to add digital products, variations, and more. Watch this space!",
				'poocommerce'
			),
		},
	];

	const pages = pagesConfig.map( ( page, index ) => ( {
		content: <PageContent page={ page } />,
		image: <PageImage page={ { ...page, index } } />,
	} ) );

	return (
		<Guide
			className="poocommerce-block-editor-guide"
			contentLabel=""
			finishButtonText={ __( 'Tell me more', 'poocommerce' ) }
			finishButtonLink="https://poocommerce.com/product-form-beta"
			onFinish={ onCloseGuide }
			pages={ pages }
		/>
	);
};

export default BlockEditorGuide;
