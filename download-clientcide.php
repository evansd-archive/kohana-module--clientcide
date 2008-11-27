<?php

$output_folder = realpath(dirname(__FILE__).'/javascript/clientcide/';

$clientcide = "http://cnetjavascript.googlecode.com/svn/trunk/Source/";


header('Content-Type: text/plain');

echo "From: $clientcide\n";
echo "To: $output_folder\n";

// Get a list of the Mootools files, Core and More
$mootools = array();
foreach(array('core'=>'1.2.1', 'more'=>'1.2') as $type => $version)
{
	$url = "http://github.com/mootools/mootools-$type/tree/$version/Source/scripts.json?raw=true";

	foreach(json_decode(file_get_contents($url), TRUE) as $folder => $files)
	{
		foreach(array_keys($files) as $file)
		{
			$mootools[] = $file;
		}
	}
}


$json = file_get_contents($clientcide.'scripts.json');
$json = json_decode($json, true);

foreach($json as $folder => $files) {

	foreach($files as $file => $details) {

		echo "Downloading $file\n";
		$script = file_get_contents($clientcide.$folder.'/'.$file.'.js');

		$php = '';
		foreach($details['deps'] as $dependency) {

			$module = in_array($dependency, $mootools) ? 'mootools' : 'clientcide';

			$php .= "\t\$this->requires('$module/$dependency.js');\n";

		}

		if($php) {

			$php =
				"/* <?php echo '*','/';\n\n".
				$php.
				"\necho '/*';?> */\n\n";

			$script = $php.$script;

		}

		file_put_contents($output_folder.DIRECTORY_SEPARATOR.$file.'.js', $script);


	}

}
