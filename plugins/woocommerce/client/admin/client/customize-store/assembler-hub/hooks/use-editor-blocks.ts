/* eslint-disable @poocommerce/dependency-group */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * External dependencies
 */
// @ts-ignore No types for this exist yet.
import { useEntityBlockEditor } from '@wordpress/core-data';
import { BlockInstance } from '@wordpress/blocks';

type InputHandler = ( blocks: BlockInstance[] ) => void;
type ChangeHandler = (
	blocks: BlockInstance[],
	options: Record< string, unknown >
) => void;

// Note, must be used within BlockEditorProvider. This allows shared access of blocks currently
// being edited in the BlockEditor.
export const useEditorBlocks = (
	templateType: 'wp_template' | 'wp_template_part',
	templateId: string
): [ BlockInstance[], InputHandler, ChangeHandler ] => {
	// @ts-ignore Types are not up to date.
	const [ blocks, onInput, onChange ]: [
		BlockInstance[] | undefined,
		InputHandler,
		ChangeHandler
	] = useEntityBlockEditor( 'postType', templateType, {
		id: templateId,
	} );

	return [ blocks ?? [], onInput, onChange ];
};
