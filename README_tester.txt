tell_money_tester_launcher.bat - is a BAT file for launching tell_money_tester.jar
tell_money_tester.jar - is Java console application which automatically tests the correct operation of tell_money.js
	When run through CLI, tell_money_tester.jar can accept 2 arguments:
	- an integer - quantity of runs-through
	- a string: "FR", "EN" or "RU" - language that will be tested
	By default the app executes 10 runs-through for FR (french language)
	The app's algorythm is briefly the following:
	1) generate a random number between 0 and 1x10^12 (exluded)
	2) check whether the number had already been processed (in record_lang.txt)
	3) take the output from the record_lang.txt or request the conversion web site
	4) launch tell_money.js
	5) compare the outputs and notify of any error
