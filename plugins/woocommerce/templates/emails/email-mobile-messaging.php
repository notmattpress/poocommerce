<?php
/**
 * Email mobile messaging
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/emails/email-mobile-messaging.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates\Emails
 * @version 7.0
 */

use Automattic\PooCommerce\Internal\Orders\MobileMessagingHandler;

echo wp_kses_post( MobileMessagingHandler::prepare_mobile_message( $order, $blog_id, $now, $domain ) );
