<?php
function wc_export_args( $order ) {
    $args = array( 'id' => $order->get_id(), 'state' => $order->get_status() );
    return apply_filters( 'poocommerce_export_args', $args, $order );
}

add_filter( 'poocommerce_export_args', static function ( $args, $order ) {
    $args['include_in_export'] = 'pending' === $args['status'];
    return $args;
}, 10, 2 );
