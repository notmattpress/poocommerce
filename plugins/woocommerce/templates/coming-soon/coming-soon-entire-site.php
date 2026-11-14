<?php
/**
 * Entire-site Coming Soon document for classic themes.
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/coming-soon/coming-soon-entire-site.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 11.4.0
 */

defined( 'ABSPATH' ) || exit;

?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php if ( ! current_theme_supports( 'title-tag' ) ) : ?>
		<title><?php echo esc_html( wp_get_document_title() ); ?></title>
	<?php endif; ?>
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'poocommerce-coming-soon-classic-page' ); ?>>
<?php wp_body_open(); ?>
<div class="poocommerce-coming-soon-classic poocommerce-coming-soon-classic--entire-site">
	<header class="poocommerce-coming-soon-classic__header">
		<div class="poocommerce-coming-soon-classic__identity">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php endif; ?>
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></a>
		</div>
		<a class="poocommerce-coming-soon-classic__login button" href="<?php echo esc_url( wp_login_url() ); ?>"><?php esc_html_e( 'Log in', 'poocommerce' ); ?></a>
	</header>
	<main class="poocommerce-coming-soon-classic__content">
		<h1 class="poocommerce-coming-soon-banner">
			<?php
			echo esc_html(
				sprintf(
					/* translators: %s is the site name. */
					__( '%s is coming soon', 'poocommerce' ),
					get_bloginfo( 'name' )
				)
			);
			?>
		</h1>
		<?php if ( get_bloginfo( 'description' ) ) : ?>
			<p><?php echo esc_html( get_bloginfo( 'description' ) ); ?></p>
		<?php endif; ?>
	</main>
</div>
<?php wp_footer(); ?>
</body>
</html>
