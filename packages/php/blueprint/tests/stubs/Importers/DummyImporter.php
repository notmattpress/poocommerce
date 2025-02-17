<?php

namespace Automattic\PooCommerce\Blueprint\Tests\stubs\Importers;

use Automattic\PooCommerce\Blueprint\StepProcessor;
use Automattic\PooCommerce\Blueprint\StepProcessorResult;
use Automattic\PooCommerce\Blueprint\Tests\stubs\Steps\DummyStep;

class DummyImporter implements StepProcessor{
	public function process( $schema ): StepProcessorResult {
		return StepProcessorResult::success( DummyStep::get_step_name() );
	}

	public function get_step_class(): string {
		return DummyStep::class;
	}
}
