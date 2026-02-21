<?php
/**
 * The template to display the reviewers meta data (name, verified owner, review date)
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/single-product/review-meta.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 3.4.0
 */

defined( 'ABSPATH' ) || exit;

global $comment;
$verified = wc_review_is_from_verified_owner( $comment->comment_ID );

if ( '0' === $comment->comment_approved ) { ?>

	<p class="meta">
		<em class="poocommerce-review__awaiting-approval">
			<?php esc_html_e( 'Your review is awaiting approval', 'poocommerce' ); ?>
		</em>
	</p>

<?php } else { ?>

	<p class="meta">
		<strong class="poocommerce-review__author"><?php comment_author(); ?> </strong>
		<?php
		if ( 'yes' === get_option( 'poocommerce_review_rating_verification_label' ) && $verified ) {
			echo '<em class="poocommerce-review__verified verified">(' . esc_attr__( 'verified owner', 'poocommerce' ) . ')</em> ';
		}

		?>
		<span class="poocommerce-review__dash">&ndash;</span> <time class="poocommerce-review__published-date" datetime="<?php echo esc_attr( get_comment_date( 'c' ) ); ?>"><?php echo esc_html( get_comment_date( wc_date_format() ) ); ?></time>
	</p>

	<?php
}
