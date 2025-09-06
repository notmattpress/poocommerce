#!/bin/sh

# Possible slugs: poocommerce-dev (live branches) and poocommerce (plugin build)
if [ -z "$PLUGIN_SLUG" ]; then
	PLUGIN_SLUG="poocommerce"
fi

PROJECT_PATH=$(pwd)
BUILD_PATH="${PROJECT_PATH}/build"
DEST_PATH="$BUILD_PATH/$PLUGIN_SLUG"
XDEBUG_MODE=off

echo "Generating build directory..."
rm -rf "$BUILD_PATH"
mkdir -p "$DEST_PATH"

echo "Cleaning up assets..."
find "$PROJECT_PATH/assets/css/." ! -name '.gitkeep' -type f -exec rm -f {} + && find "$PROJECT_PATH/assets/client/." ! -name '.gitkeep' -type f -exec rm -f {} + && find "$PROJECT_PATH/assets/js/." ! -name '.gitkeep' -type f -exec rm -f {} +

echo "Installing PHP and JS dependencies..."
pnpm install --frozen-lockfile

echo "Running JS Build..."
if [ -z "$NODE_ENV" ]; then
	export NODE_ENV=production
fi
pnpm --filter='@poocommerce/plugin-poocommerce' build || exit "$?"
echo "Cleaning up PHP dependencies..."
composer install --no-dev --quiet --optimize-autoloader || exit "$?"
echo "Run makepot..."
pnpm --filter=@poocommerce/plugin-poocommerce makepot || exit "$?"
echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

echo "Generating zip file..."
cd "$BUILD_PATH" || exit
zip -q -r -9 "${PLUGIN_SLUG}.zip" "$PLUGIN_SLUG/"

cd "$PROJECT_PATH" || exit
mv "$BUILD_PATH/${PLUGIN_SLUG}.zip" "$PROJECT_PATH"
echo "${PLUGIN_SLUG}.zip file generated!"

echo "Build done!"
