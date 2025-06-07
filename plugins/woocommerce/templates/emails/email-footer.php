<?php
/**
 * Email Footer
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/emails/email-footer.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates\Emails
 * @version 9.6.0
 */

defined( 'ABSPATH' ) || exit;
?>
																		</div>
																	</td>
																</tr>
															</table>
															<!-- End Content -->
														</td>
													</tr>
												</table>
												<!-- End Body -->
											</td>
										</tr>
									</table>
								</td>
							</tr>
							<tr>
								<td align="center" valign="top">
									<!-- Footer -->
									<table border="0" cellpadding="10" cellspacing="0" width="100%" id="template_footer">
										<tr>
											<td valign="top">
												<table border="0" cellpadding="10" cellspacing="0" width="100%">
													<tr>
														<td colspan="2" valign="middle" id="credit">
															<?php
															$email_footer_text = get_option( 'poocommerce_email_footer_text' );
															/**
															 * This filter is documented in templates/emails/email-styles.php
															 *
															 * @since 9.6.0
															 */
															if ( apply_filters( 'poocommerce_is_email_preview', false ) ) {
																$text_transient    = get_transient( 'poocommerce_email_footer_text' );
																$email_footer_text = false !== $text_transient ? $text_transient : $email_footer_text;
															}
															echo wp_kses_post(
																wpautop(
																	wptexturize(
																		/**
																		 * Provides control over the email footer text used for most order emails.
																		 *
																		 * @since 4.0.0
																		 *
																		 * @param string $email_footer_text
																		 */
																		apply_filters( 'poocommerce_email_footer_text', $email_footer_text )
																	)
																)
															);
															?>
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
									<!-- End Footer -->
								</td>
							</tr>
						</table>
					</div>
				</td>
				<td><!-- Deliberately empty to support consistent sizing and layout across multiple email clients. --></td>
			</tr>
		</table>
	</body>
</html>
