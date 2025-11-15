/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';
import { noticeContexts, useEditorContext } from '@poocommerce/base-context';
import { StoreNoticesContainer } from '@poocommerce/blocks-components';
import { useDispatch, useSelect } from '@wordpress/data';
import { checkoutStore } from '@poocommerce/block-data';
import { ORDER_FORM_KEYS } from '@poocommerce/block-settings';
import { Form } from '@poocommerce/base-components/cart-checkout';
import Noninteractive from '@poocommerce/base-components/noninteractive';
import type { OrderFormValues } from '@poocommerce/settings';

const Block = () => {
	const { additionalFields } = useSelect( ( select ) => {
		const store = select( checkoutStore );
		return {
			additionalFields: store.getAdditionalFields(),
		};
	}, [] );
	const { isEditor } = useEditorContext();
	const { setAdditionalFields } = useDispatch( checkoutStore );

	const onChangeForm = ( additionalValues: OrderFormValues ) => {
		setAdditionalFields( additionalValues );
	};

	const additionalFieldValues = {
		...additionalFields,
	};

	const WrapperComponent = isEditor ? Noninteractive : Fragment;

	return (
		<>
			<StoreNoticesContainer
				context={ noticeContexts.ORDER_INFORMATION }
			/>
			<WrapperComponent>
				<Form
					id="order"
					addressType="order"
					onChange={ onChangeForm }
					fields={ ORDER_FORM_KEYS }
					values={ additionalFieldValues }
				/>
			</WrapperComponent>
		</>
	);
};

export default Block;
