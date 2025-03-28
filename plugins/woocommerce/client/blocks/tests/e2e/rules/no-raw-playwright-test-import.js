module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'advise using @poocommerce/e2e-utils for importing test or expect functions',
			category: 'Possible Errors',
			recommended: true,
		},
		fixable: 'code',
		schema: [],
		messages: {
			unexpected:
				"Prefer importing { test, expect } from '@poocommerce/e2e-utils'.",
		},
	},
	create( context ) {
		return {
			ImportDeclaration( node ) {
				if ( node.source.value === '@playwright/test' ) {
					const functionsNotAllowedToImportFromPlaywright = [
						'test',
						'expect',
					];
					const testSpecifier = node.specifiers.find(
						( specifier ) =>
							specifier.imported &&
							functionsNotAllowedToImportFromPlaywright.includes(
								specifier.imported.name
							)
					);

					if ( testSpecifier ) {
						context.report( {
							node,
							message:
								'Import test or expect from @poocommerce/e2e-utils instead of @playwright/test for additional utilities.',
							fix( fixer ) {
								return [
									fixer.replaceText(
										node.source,
										"'@poocommerce/e2e-utils'"
									),
								];
							},
						} );
					}
				}
			},
		};
	},
};
