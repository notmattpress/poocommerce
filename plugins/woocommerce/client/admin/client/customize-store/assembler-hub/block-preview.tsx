// Reference: https://github.com/WordPress/gutenberg/blob/release/16.4/packages/block-editor/src/components/block-preview/index.js

/* eslint-disable @poocommerce/dependency-group */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * External dependencies
 */
// @ts-ignore No types for this exist yet.
import { BlockEditorProvider, EditorSettings } from '@wordpress/block-editor';
import { memo, useContext } from '@wordpress/element';
import { BlockInstance } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	AutoHeightBlockPreview,
	ScaledBlockPreviewProps,
} from './auto-block-preview';
import { Toolbar } from './toolbar/toolbar';
import { isFullComposabilityFeatureAndAPIAvailable } from './utils/is-full-composability-enabled';
import { IsResizingContext } from './resizable-frame';
import { SelectedBlockContextProvider } from './context/selected-block-ref-context';

export const BlockPreview = ( {
	blocks,
	settings,
	useSubRegistry = true,
	onChange,
	isPatternPreview,
	...props
}: {
	blocks: BlockInstance | BlockInstance[];
	settings: EditorSettings;
	onChange: (
		blocks: BlockInstance[],
		options: Record< string, unknown >
	) => void;
	useSubRegistry?: boolean;
	isPatternPreview: boolean;
} & Omit< ScaledBlockPreviewProps, 'containerWidth' > ) => {
	const renderedBlocks = Array.isArray( blocks ) ? blocks : [ blocks ];

	const isResizing = useContext( IsResizingContext );

	return (
		<>
			<BlockEditorProvider
				value={ renderedBlocks }
				settings={ settings }
				// We need to set onChange for logo to work, but we don't want to trigger the onChange callback when highlighting blocks in the preview. It would persist the highlighted block and cause the opacity to be applied to block permanently.
				// @ts-expect-error The type is not up to date.
				onChange={ onChange }
				useSubRegistry={ useSubRegistry }
			>
				<SelectedBlockContextProvider>
					{ isFullComposabilityFeatureAndAPIAvailable() &&
						! isPatternPreview &&
						! isResizing && <Toolbar /> }
					<AutoHeightBlockPreview
						isPatternPreview={ isPatternPreview }
						settings={ settings }
						{ ...props }
					/>
				</SelectedBlockContextProvider>
			</BlockEditorProvider>
		</>
	);
};

export default memo( BlockPreview );
