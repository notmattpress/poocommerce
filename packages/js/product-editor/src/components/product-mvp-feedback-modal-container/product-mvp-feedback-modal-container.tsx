/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { createElement } from '@wordpress/element';
import { STORE_KEY } from '@poocommerce/customer-effort-score';
import { recordEvent } from '@poocommerce/tracks';
import { getAdminLink, getSetting } from '@poocommerce/settings';
import { useFormContext } from '@poocommerce/components';
import { Product } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { ProductMVPFeedbackModal } from '../product-mvp-feedback-modal';

export const ProductMVPFeedbackModalContainer = ( {
	productId: _productId,
}: {
	productId?: number;
} ) => {
	const { values } = useFormContext< Product >();
	const { hideProductMVPFeedbackModal } = useDispatch( STORE_KEY );
	const { isProductMVPModalVisible } = useSelect( ( select ) => {
		const { isProductMVPFeedbackModalVisible } = select( STORE_KEY );
		return {
			// @ts-expect-error Selector is not typed
			isProductMVPModalVisible: isProductMVPFeedbackModalVisible(),
		};
	}, [] );

	const productId = _productId ?? values?.id;

	const { _feature_nonce } = getSetting< { _feature_nonce: string } >(
		'admin',
		{}
	);

	const classicEditorUrl = productId
		? getAdminLink(
				`post.php?post=${ productId }&action=edit&product_block_editor=0&_feature_nonce=${ _feature_nonce }`
		  )
		: getAdminLink(
				`post-new.php?post_type=product&product_block_editor=0&_feature_nonce=${ _feature_nonce }`
		  );

	const recordScore = (
		checked: string[],
		comments: string,
		email: string
	) => {
		recordEvent( 'product_mvp_feedback', {
			action: 'disable',
			checked,
			comments: comments || '',
			email,
		} );
		hideProductMVPFeedbackModal();
		window.location.href = `${ classicEditorUrl }&new-product-experience-disabled=true`;
	};

	const onCloseModal = () => {
		recordEvent( 'product_mvp_feedback', {
			action: 'cancel',
			checked: '',
			comments: '',
		} );
		hideProductMVPFeedbackModal();
	};

	const onSkipFeedback = () => {
		recordEvent( 'product_mvp_feedback', {
			action: 'disable',
			checked: '',
			comments: 'Feedback skipped',
		} );
		hideProductMVPFeedbackModal();
		window.location.href = classicEditorUrl;
	};

	if ( ! isProductMVPModalVisible ) {
		return null;
	}

	return (
		<ProductMVPFeedbackModal
			recordScoreCallback={ recordScore }
			onCloseModal={ onCloseModal }
			onSkipFeedback={ onSkipFeedback }
		/>
	);
};
