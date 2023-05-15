/*
This Windows Script Host application written in JScript is designed for converting numbers (f.e. sums of money) 
into Russian, French and English languages.
For usage just type in the command line a number (999 999 999 999,99 is the maximum)
followed by a hyphen and two-letter abbreviation of language (en, fr or ru).
Delimiters such as dot, coma and space are allowed between the digits of the integer part.
Optionally, dot or coma can be used between the integer part and the fractional part.
After the initial setup of a language, no further setup of the same language is needed.
To quit the application type "q" or "quit" or "end" or "exit" or "0".
*/

// Define arrays for ONES, TENS, and TEENS (and HUNDREDS for RU)
var ONES_EN = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
var TENS_EN = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
var TEENS_EN = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
var ORDERS_EN = ["hundred", "thousand", "million", "billion"];

var ONES_FR = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
var TENS_FR = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];
var TEENS_FR = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
var ORDERS_FR = ["cent", "mille", "million", "milliard"];

var ONES_RU = ["", "один", "два", "три", "четыре", "п€ть", "шесть", "семь", "восемь", "дев€ть"];
var TENS_RU = ["", "", "двадцать", "тридцать", "сорок", "п€тьдес€т", "шестьдес€т", "семьдес€т", "восемьдес€т", "дев€носто"];
var TEENS_RU = ["дес€ть", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "п€тнадцать", "шестнадцать", "семнадцать", "восемнадцать", "дев€тнадцать"];
var HUNDREDS_RU = ["", "сто", "двести", "триста", "четыреста", "п€тьсот", "шестьсот", "семьсот", "восемьсот", "дев€тьсот"];
var ORDERS_RU = ["", "тыс€ч", "миллион", "миллиард"];

var ORDERS_NUM = [100, 1000, 1000000, 1000000000];
var DEFAULT_LANG = "FR";
var JOINT = {"RU" : " и ",    "FR" : " et ",    "EN" : " and "};
var LIMIT = 999999999999.99;
var LIMIT_PROMPT = "¬ведите число от 1 до 999,999,999.99";

function convertToWords(task) {// :String
    var parts = String(task).split(".");
    var integerPart = parseInt(parts[0]);
    var fractionalPart = parseInt(parts[1] || 0);
    return processInteger(integerPart) + convertFraction(fractionalPart);// :String
}

function convertFraction(fraction){// :int
    if (fraction > 0) {
        return JOINT[lang] + fraction + "/100";
    }
    return "";// :String
}

function processInteger(integer){// :int
    var result = "";
    for(var i = 3; i > 0; i--){
        var calc = Math.floor(integer / ORDERS_NUM[i]);
        if (integer >= ORDERS_NUM[i]) {
            result += convertInteger(calc, i) + " " + getOrderString(calc, i) + " ";
            integer %= ORDERS_NUM[i];
        }
    }
    result += convertInteger(integer, null);
    if(lang === "RU"){
        result = checkOutRu(result);
    }
    return result;// :String
}

function convertInteger(integer, orderIndex){// :int
    switch(lang){
        case "RU": return tellRussian(integer, orderIndex); break; // :String
        case "FR": return tellFrench(integer, orderIndex); break;
        case "EN": return tellEnglish(integer, orderIndex); break;
    }
}

function getOrderString(calc, orderIndex){// :int
    switch(lang){
        case "RU":  return ORDERS_RU[orderIndex] + appendForRu(calc, orderIndex);// :String
                    break;
        case "FR":  return ORDERS_FR[orderIndex] + appendForFr(calc, orderIndex);
                    break;
        case "EN":  return ORDERS_EN[orderIndex];
    }
}

//---------------------CONVERSION INTO FRENCH----------------------------

//Amends the result string according to FR grammar rules
function appendForFr(calc, orderIndex){
    if(calc > 1 && orderIndex > 1){
        return "s";
    }
    return "";
}

function tellFrench(integer, orderIndex){
    var result = "";
    if(integer === 1 && orderIndex === 1){
        //"one thousand" in FR - is just "mille", and not "un mille"
        return result ;
    }
    if (integer >= 100){
        result = "cent";
        if (integer === 100){
            //"one "hundred" in FR - is just "cent", and not "un cent"
            return result;
        }
        var calc = Math.floor(integer / 100);
        if(calc > 1) {
            result = ONES_FR[calc] + " " + result;
        }
        if (integer % 100 === 0){
            if (orderIndex > 1 || orderIndex == null){
                return result + "s";
            } else{
                return result;
            }
        }
        integer %= 100;
        result += " "
    }
    if (integer >= 10 && integer <= 19) {
        return result + TEENS_FR[integer - 10];
    }
    if (integer >= 20 && integer <= 70 || integer >= 80 && integer <= 90 || integer === 0){
        result += TENS_FR[Math.floor(integer / 10)];
        if(integer === 80 && orderIndex != 1){
            //"Quatre-vingts" in all digit groups except for thousands ("Quatre-vingt mille")
            return result + "s";
        }
        result += adaptForFr(integer);
        integer %= 10;
    } else if (integer >= 71 && integer <= 79 || integer >= 91 && integer <= 99 || integer === 0){
        result += TENS_FR[Math.floor(integer / 10 - 1)];
        result += adaptForFr(integer);
        integer %= 10;
        return result + TEENS_FR[integer];
    }
    return result + ONES_FR[integer];
}

function adaptForFr(calc){
    var integer = calc % 10;
    if (calc < 80){
        if (integer === 1) {
            return JOINT[lang];
        } else if (integer > 1) {
            return "-";
        } else{
            return "";
        }
    } else{
        if (integer > 0) {
            return "-";
        } else{
            return "";
        }
    }
}

//---------------------CONVERSION INTO RUSSIAN----------------------------
function tellRussian(integer, orderIndex){
    var result = "";
    if (integer >= 100) {
        result += HUNDREDS_RU[Math.floor(integer / 100)] + " ";
        integer %= 100;
    }
    if (integer >= 10 && integer <= 19) {
        result += TEENS_RU[integer - 10] + " ";
        integer = 0;
    } else if (integer >= 20) {
        result += TENS_RU[Math.floor(integer / 10)] + " ";
        integer %= 10;
    }
    if (integer > 0) {
        result += ONES_RU[integer] + " ";
    }
    return trimEnd(result);
  }
  
    //Amends the result string according to RU grammar rules
    function appendForRu(integer, orderIndex){
        integer %= 100;
        if(integer > 10 && integer < 20){
            if(orderIndex > 1){
                return "ов";
            } else{
                return "";
            }
        }
        var minDigit = integer % 10;
        if(orderIndex > 1){
            if(minDigit > 1 && minDigit < 5){
                return "а";
            } else if(minDigit >= 5 || minDigit === 0) {
                return "ов";
            }
        } else{
            if(minDigit === 1){
                return "а";
            } else if(minDigit > 1 && minDigit < 5){
                return "и";
            }
        }
        return "";
    }
  
  //Additionally amends the result string according to RU grammar rules
  function checkOutRu(result){
      result = result.replace("один тыс€ча", "одна тыс€ча");
      result = result.replace("два тыс€чи", "две тыс€чи");
      return result;
  }
  
//---------------------CONVERSION INTO ENGLISH----------------------------
function tellEnglish(integer){
    var result = "";
    if (integer >= 100) {
        result += ONES_EN[Math.floor(integer / 100)] + " hundred ";
        integer %= 100;
    }
    if (integer >= 10 && integer <= 19) {
        result += TEENS_EN[integer - 10] + " ";
        integer = 0;
    } else if (integer >= 20 || integer === 0){
        result += TENS_EN[Math.floor(integer / 10)];
        integer %= 10;
        if (integer > 0) {
            result += "-";
        }
    }
    if (integer > 0) {
        result += ONES_EN[integer];
    }
    return trimEnd(result);
}

//---------------------MAIN----------------------------
function getInput(){
    var input = "";
    while (input === "") {
        input = WScript.StdIn.ReadLine();
        input = input.replace(/\s+/g, "");
        var args = input.split("-");
        input = args[0];
        if(input==="q" || input==="quit" || input==="end" || input==="exit" || input==="0"){
            WScript.Quit();
        }
        input = checkInput(input);
        //Language set up
        if(input != ""){
            if(args.length > 1){
                lang = args[1].toUpperCase();
            }
            return input;
        }                
    }
}

function checkInput(input){
    if(input.match(/[^,\.0-9]/)){
        WScript.StdErr.WriteLine("ќЎ»Ѕ ј: не число - " + LIMIT_PROMPT);
        return "";
    }
    if(input.match(/[,\.]\d{2}$/)){//if a coma or a dot is followed by any to chyphers at the end of the string
        var sub = input.substring(input.length-2);//put aside the two tail digits
        input = input.replace(/[,\.]\d{2}$/, "@") + sub;//replace end coma or dot followed by any to digits with a "@"
        input = input.replace(/[,\.]+/g, "").replace("@", ".");
    } else{
        input = input.replace(/[,\.]+/g, "");
    }
    input = parseFloat(input);
    if (input > LIMIT) {
        WScript.StdErr.WriteLine("ќЎ»Ѕ ј: слишком большое число" + LIMIT_PROMPT);
        return "";
    }
    return input;
}

function main(){
    WScript.Echo(LIMIT_PROMPT);
    var output = convertToWords(getInput());
    var sh = WScript.CreateObject("WScript.Shell");
    sh.Run("cmd /c \"echo " + output + " | clip\"");
    WScript.Echo(output + "\n");
    main();
}

function main_java_tester(){
    var output = convertToWords(inputNumber);
    var FSO = WScript.CreateObject("Scripting.FileSystemObject");
    FSO.CreateTextFile("records\\money.txt").WriteLine(output);
    WScript.Echo("See result in records\\money.txt");
}

var ARGS = WScript.Arguments;
var inputNumber, lang;
try{
	inputNumber = ARGS(0);
	lang = ARGS(1);
	main_java_tester();
} catch(error){//No arguments
	lang = DEFAULT_LANG;
	main();
}

function trimEnd(s) {
    return s.replace(/( )+$/g, '');
}