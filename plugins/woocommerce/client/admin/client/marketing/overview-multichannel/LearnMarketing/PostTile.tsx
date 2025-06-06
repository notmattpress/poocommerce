/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { Post } from './types';

type PostTileProps = {
	post: Post;
};

export const PostTile = ( { post }: PostTileProps ) => {
	return (
		<a
			className="poocommerce-marketing-learn-marketing-card__post"
			href={ post.link }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ () => {
				recordEvent( 'marketing_knowledge_article', {
					title: post.title,
				} );
			} }
		>
			<div className="poocommerce-marketing-learn-marketing-card__post-img">
				{ !! post.image && <img src={ post.image } alt="" /> }
			</div>
			<div className="poocommerce-marketing-learn-marketing-card__post-title">
				{ post.title }
			</div>
			<div className="poocommerce-marketing-learn-marketing-card__post-description">
				{
					// translators: %s: author's name.
					sprintf( __( 'By %s', 'poocommerce' ), post.author_name )
				}
				{ !! post.author_avatar && (
					<img
						src={ post.author_avatar.replace( 's=96', 's=32' ) }
						alt=""
					/>
				) }
			</div>
		</a>
	);
};
