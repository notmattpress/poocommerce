<?php

namespace Automattic\PooCommerce\Blueprint;

use Automattic\PooCommerce\Blueprint\Cli\ExportCli;
use Automattic\PooCommerce\Blueprint\Cli\ImportCli;

$autoload_path = __DIR__ . '/../vendor/autoload.php';
if ( file_exists( $autoload_path ) ) {
	require_once $autoload_path;
}
/**
 * Class Cli.
 *
 * This class is included and execute from WC_CLI(class-wc-cli.php) to register
 * WP CLI commands.
 */
class Cli {
	/**
	 * Register WP CLI commands.
	 *
	 * @return void
	 */
	public static function register_commands() {
		\WP_CLI::add_command(
			'wc blueprint import',
			function ( $args, $assoc_args ) {
				$import = new ImportCli( $args[0] );
				$import->run( $assoc_args );
			},
			array(
				'synopsis' => array(
					array(
						'type'     => 'positional',
						'name'     => 'schema-path',
						'optional' => false,
					),
					array(
						'type'     => 'assoc',
						'name'     => 'show-messages',
						'optional' => true,
						'options'  => array( 'all', 'error', 'info', 'debug' ),
					),
				),
				'when'     => 'after_wp_load',
			)
		);

		\WP_CLI::add_command(
			'wc blueprint export',
			function ( $args, $assoc_args ) {
				$export = new ExportCli( $args[0] );
				$steps  = array();

				if ( isset( $assoc_args['steps'] ) ) {
					$steps = array_map(
						function ( $step ) {
							return trim( $step );
						},
						explode( ',', $assoc_args['steps'] )
					);
				}
				$export->run(
					array(
						'steps'  => $steps,
						'format' => 'json',
					)
				);
			},
			array(
				'synopsis' => array(
					array(
						'type'     => 'positional',
						'name'     => 'save-to',
						'optional' => false,
					),
					array(
						'type'     => 'assoc',
						'name'     => 'steps',
						'optional' => true,
					),
				),
				'when'     => 'after_wp_load',
			)
		);
	}
}
