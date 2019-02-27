<?php
class Performance
{
	public $start;

	function start()
	{
		$this->start = microtime(true);
	}

	function end()
	{
		$end = microtime(true);
		return round(($end - $this->start), 2) . " seconds";
	}
}