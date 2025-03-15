/**
 * External dependencies
 */
import { createElement, Component, Fragment } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import { Icon, upload } from '@wordpress/icons';

class ImageUpload extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			frame: false,
		};
		this.openModal = this.openModal.bind( this );
		this.handleImageSelect = this.handleImageSelect.bind( this );
		this.removeImage = this.removeImage.bind( this );
	}

	openModal() {
		if ( this.state.frame ) {
			this.state.frame.open();
			return;
		}

		const frame = wp.media( {
			title: __( 'Select or upload image', 'poocommerce' ),
			button: {
				text: __( 'Select', 'poocommerce' ),
			},
			library: {
				type: 'image',
			},
			multiple: false,
		} );

		frame.on( 'select', this.handleImageSelect );
		frame.open();

		this.setState( { frame } );
	}

	handleImageSelect() {
		const { onChange } = this.props;
		const attachment = this.state.frame
			.state()
			.get( 'selection' )
			.first()
			.toJSON();
		onChange( attachment );
	}

	removeImage() {
		const { onChange } = this.props;
		onChange( null );
	}

	render() {
		const { className, image } = this.props;
		return (
			<Fragment>
				{ !! image && (
					<div
						className={ classNames(
							'poocommerce-image-upload',
							'has-image',
							className
						) }
					>
						<div className="poocommerce-image-upload__image-preview">
							<img src={ image.url } alt="" />
						</div>
						<Button
							isSecondary
							className="poocommerce-image-upload__remove-image"
							onClick={ this.removeImage }
						>
							{ __( 'Remove image', 'poocommerce' ) }
						</Button>
					</div>
				) }
				{ ! image && (
					<div
						className={ classNames(
							'poocommerce-image-upload',
							'no-image',
							className
						) }
					>
						<Button
							className="poocommerce-image-upload__add-image"
							onClick={ this.openModal }
							isSecondary
						>
							<Icon icon={ upload } />
							{ __( 'Add an image', 'poocommerce' ) }
						</Button>
					</div>
				) }
			</Fragment>
		);
	}
}

export default ImageUpload;
