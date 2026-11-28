import { runPackageBuilder } from '@poocommerce/internal-build';

await runPackageBuilder( { entryPoints: 'src/**/*.{ts,tsx,js,jsx}' } );
