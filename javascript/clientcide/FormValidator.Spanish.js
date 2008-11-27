/* <?php echo '*','/';

	$this->requires('clientcide/FormValidator.js');

echo '/*';?> */

/*
Script: FormValidator.Spanish.js
	FormValidator messages in Spanish. Thanks Miquel Hudin.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
FormValidator.resources.ESP= {
	required:'Este campo es obligatorio.',
	minLength:'Por favor escribe como mnimo {minLength} caracteres (has escrito {length} caracteres).',
	maxLength:'Por favor no escribas ms de {maxLength} caracteres (has escrito {length} caracteres).',
	integer:'Por favor escribe un nmero entero. Los nmeros con decimales (p.ej. 1\'25) no estn permitidos.',
	numeric:'Por favor escribe tan slo valores nmericos en este campo (p.ej. "1" or "1\'1" or "-1" or "-1\'1").',
	digits:'Por favor utiliza nmeros y signos de puntuacin tan slo en este campo (por ejemplo, un nmero de telfono con guiones est permitido).',
	alpha:'Por favor utiliza slo letras (a-z) en este campo. Los espacios u otros caracteres no estn permitidos.',
	alphanum:'Por favor utiliza slo letras (a-z) o nmeros en este campo. Los espacios u otros caracteres no estn permitidos.',
	dateSuchAs:'Por favor escribe una fecha vlida, como {date}',
	dateInFormatMDY:'Por favor escribe una fecha vlida, como DD/MM/AAAA (p.ej. "31/11/1999")',
	email:'Por favor escribe una direccin de correo electrnico vlida. Por ejemplo "fred@domain.com".',
	url:'Por favor escribe una URL vlida, como http://www.google.com.',
	currencyDollar:'Por favor escribe una cantidad vlida. Por ejemplo $100.00 .',
	oneRequired:'Por favor selecciona al menos una de estas opciones.',
	errorPrefix: 'Error: ',
	warningPrefix: 'Aviso: '
};
if (Date.$culture == "US") {
	try {
		console.log("WARNING: this validator (Spanish) is designed to use European style formatting, but Date.$culture is set to US. Consider changing this value to 'GB' for DD/MM/YYYY.")
	} catch(e){}
}