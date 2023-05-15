package tell_money_test;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public final class TellMoneyTest {
    final static String URL_PREFIX_FR = "https://chiffre-en-lettre.fr/ecrire-nombre-";
    final static String URL_ML = "https://math.tools/calculator/numbers/words?";
    final static long LIMIT = 999_999_999_999L;
    static File record;
    static PrintWriter output;
    static int count = 10;
    static String lang = "FR";//default lang

    public static void main(String[] args) throws Exception{
        parseArgs(args);
        record = defineRecordFile();
        output = new PrintWriter(new BufferedOutputStream(new FileOutputStream(record, true)));
        System.out.print("Processing"); //"console message"
        for(int i = 0; i < count; i++){
            final long NUM = getRandomNumber();
            final String JS_OUTPUT = launchScript(NUM).trim();
            final String[] JAVA_RESULT = getWebOutput(NUM);
            final String JAVA_OUTPUT = JAVA_RESULT[0];
            String compared = compareResults(JS_OUTPUT, JAVA_OUTPUT);
            if(compared.equals(" is ERROR\n") || JAVA_RESULT[1].equals("mem")){
                System.out.println("\n  js gave: " + JS_OUTPUT);
                System.out.println("JAVA gave: " + JAVA_OUTPUT + "\t is " + JAVA_RESULT[1] + "\t " + compared);
            }
            System.out.print(".");//"console message goes on"
        }
        output.close();
        System.out.println("Total items tested: " + count);
    }

    public static void parseArgs(String[] args){
        if(args.length > 0 && args[0] != ""){
            for(String arg : args){
                try{
                    count = Integer.parseInt(arg);
                }
                catch(Exception e){
                    arg = arg.toUpperCase();
                    if(arg.equals("RU") || arg.equals("FR") || arg.equals("EN")){
                        lang = arg;
                    }
                }
            }
        }
    }

    public static File defineRecordFile(){
        switch(lang){
            case "FR": return new File("records\\record_FR.txt");
            case "RU": return new File("records\\record_RU.txt");
            case "EN": return new File("records\\record_EN.txt");
            default: return null;
        }
    }

    public static String[] getWebOutput(long number) throws Exception {
        String entry = getFromMemory(number);
        String[] webOutput = new String[2];
        if(entry == ""){
            webOutput[0] = getNewEntry(number);
            webOutput[1] = "new";
        } else {
            webOutput[0] = entry;
            webOutput[1] = "mem";
        }
        return webOutput;
    }

    public static String compareResults(String s1, String s2){
        if(s1.equals(s2)){
            return " is ok\n";
        } else {
            return " is ERROR\n";
        }
    }

    public static String getTextFrench(long number) throws IOException{
        Document page = Jsoup.connect(URL_PREFIX_FR + number).get();
        Element tag = page.select("h6").first();
        String text = tag.text().toLowerCase();
        return text;
    }

    public static String getText_ML(long number) throws IOException{
        String lang_abbr = "";
        switch(lang){
            case "EN" : lang_abbr = "en_US"; break;
            case "RU" : lang_abbr = "ru";
        }
        Document page = Jsoup.connect(URL_ML + "number=" + number + "&lang=" + lang_abbr).get();
        Element form = page.getElementById("result");
        String text = form.text().trim().toLowerCase().replace("  ", " ");
        return text;
    }

    public static long getRandomNumber(){
        long rand = 1 + (long) (Math.random() * LIMIT);
        return rand;
    }

    public static String getFromMemory(long number) throws Exception{
        FileReader fileReader = new FileReader(record);
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        String line;
        while((line = bufferedReader.readLine()) != null) {
            String[] parts = line.split("    ");
            long digits = Long.parseLong(parts[0]);
            if(digits == number){
                bufferedReader.close();
                return parts[1];
            }
        }   
        bufferedReader.close();
        return "";
    }

    public static String launchScript(long number) throws Exception{
        String scriptPath = "tell_money.js";
        String arg1 = Long.toString(number);
        new ProcessBuilder("cscript.exe", scriptPath, arg1, lang).start().waitFor();
        return getMoneyFromFile();
    }

    public static String getMoneyFromFile() throws Exception{
        File moneyFile = new File("records\\money.txt");
        FileReader fileReader = new FileReader(moneyFile);
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        String line = bufferedReader.readLine().trim();
        bufferedReader.close();
        return line;
    }

    public static String getNewEntry(long number) throws Exception{
        String text = "";
        switch(lang){
            case "FR": text = getTextFrench(number); break;
            case "RU": text = getText_ML(number); break;
            case "EN": text = getText_ML(number);
        }
        String recordLine = number + "    " + text;
        output.println(recordLine);
        return text;
    }
}