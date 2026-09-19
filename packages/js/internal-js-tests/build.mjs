import { runPackageBuilder } from '@poocommerce/internal-build';

await runPackageBuilder( {
	entryPoints: 'src/**/*.{ts,tsx,js,jsx}',
	ignore: [ 'src/setup-*.js', 'src/mocks/**' ],
} );
