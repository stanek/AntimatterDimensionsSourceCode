var FormatList = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qt', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QtDc', 'SxDc', 'SpDc', 'ODc', 'NDc', 'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QtVg', 'SxVg', 'SpVg', 'OVg', 'NVg', 'Tg', 'UTg', 'DTg', 'TTg', 'QaTg', 'QtTg', 'SxTg', 'SpTg', 'OTg', 'NTg', 'Qd', 'UQd', 'DQd', 'TQd', 'QaQd', 'QtQd', 'SxQd', 'SpQd', 'OQd', 'NQd', 'Qi', 'UQi', 'DQi', 'TQi', 'QaQi', 'QtQi', 'SxQi', 'SpQi', 'OQi', 'NQi', 'Se', 'USe', 'DSe', 'TSe', 'QaSe', 'QtSe', 'SxSe', 'SpSe', 'OSe', 'NSe', 'St', 'USt', 'DSt', 'TSt', 'QaSt', 'QtSt', 'SxSt', 'SpSt', 'OSt', 'NSt', 'Og', 'UOg', 'DOg', 'TOg', 'QaOg', 'QtOg', 'SxOg', 'SpOg', 'OOg', 'NOg', 'Nn', 'UNn', 'DNn', 'TNn', 'QaNn', 'QtNn', 'SxNn', 'SpNn', 'ONn', 'NNn', 'Ce',];
const commaRegexp = /\B(?=(\d{3})+(?!\d))/g;

function letter(power,str) {
    const len = str.length;
    function lN(n) {
        let result = 1;
        for (var j = 0; j < n; ++j) result = len*result+1;
        return result;
    }
    if (power <= 5) return str[0];
    power = Math.floor(power / 3);
    let i=0;
    while (power >= lN(++i));
    if (i==1) return str[power-1];
    power -= lN(i-1);
    let ret = '';
    while (i>0) ret += str[Math.floor(power/Math.pow(len,--i))%len]
    return ret;
}

function getAbbreviation(e) {
    const prefixes = [
    ['', 'U', 'D', 'T', 'Qa', 'Qt', 'Sx', 'Sp', 'O', 'N'],
    ['', 'Dc', 'Vg', 'Tg', 'Qd', 'Qi', 'Se', 'St', 'Og', 'Nn'],
    ['', 'Ce', 'Dn', 'Tc', 'Qe', 'Qu', 'Sc', 'Si', 'Oe', 'Ne']]
    const prefixes2 = ['', 'MI-', 'MC-', 'NA-', 'PC-', 'FM-']
    e = Math.floor(e/3)-1;
    let index2 = 0;
    let prefix = [prefixes[0][e%10]];
    while (e >= 10) {
        e = Math.floor(e/10);
        prefix.push(prefixes[(++index2)%3][e%10])
    }
    index2 = Math.floor(index2/3)
    while (prefix.length%3 != 0) prefix.push("");
    let ret = "";
    while (index2 >= 0) ret += prefix[index2*3] + prefix[index2*3+1] + prefix[index2*3+2] + prefixes2[index2--];
    if (ret.endsWith("-")) ret = ret.slice(0,ret.length-1)
    return ret.replace("UM","M").replace("UNA","NA").replace("UPC","PC").replace("UFM","FM")
}

var formatPostBreak = false;

const inflog = Math.log10(Number.MAX_VALUE)
function formatValue(notation, value, places, placesUnder1000) {
    if (typeof value === "number" && !Number.isFinite(value)) return "Infinite";
    if ((value <= Number.MAX_VALUE || formatPostBreak || (player.break && (player.currentChallenge == "" || !new Decimal(Number.MAX_VALUE).equals(player.challengeTarget)) )) && (value >= 1000)) {
      let power, mantissa;
      if (value instanceof Decimal) {
         power = value.e
         mantissa = value.mantissa
      } else {
          mantissa = value / Math.pow(10, Math.floor(Math.log10(value)));
          power = Math.floor(Math.log10(value));
      }
      if (power >= 1000000000 && notation !== "Infinity") {
        var commas = false
      } else {
        var commas = player.options.commas;
      }
      if ((notation === "Mixed scientific" && power >= 33) || notation === "Scientific") {
            mantissa = mantissa.toFixed(places)
            if (mantissa >= 10) {
                mantissa /= 10;
                power++;
            }
            if (power > 100000  && !commas) return (mantissa + "e" + formatValue(notation, power, 3, 3))
            if (power > 100000  && commas) return (mantissa + "e" + formatWithCommas(power));
            return (mantissa + "e" + power);
        }
        if (notation === "Infinity") {
            const pow = Decimal.log10(value)
            if (pow / inflog < 1000) var infPlaces = 4
            else var infPlaces = 3
            if (commas) return (pow / inflog).toFixed(Math.max(infPlaces, places)).toString().split(".")[0].replace(commaRegexp, ",")+"."+(pow / inflog).toFixed(Math.max(infPlaces, places)).toString().split(".")[1]+"∞"
            else return (pow / inflog).toFixed(Math.max(infPlaces, places))+"∞"
        }
        if (notation !== undefined && (notation.includes("engineering") || notation.includes("Engineering"))) pow = power - (power % 3)
        else pow = power

        if (power > 100000  && !commas) pow = formatValue(notation, pow, 3, 3)
        if (power > 100000  && commas) pow = formatWithCommas(pow);

        if (notation === "Logarithm") {
            if (power > 100000  && !commas) return "ee"+Math.log10(Decimal.log10(value)).toFixed(3)
            if (power > 100000  && commas) return "e" + formatWithCommas(Decimal.log10(value).toFixed(places));
            else return "e"+Decimal.log10(value).toFixed(Math.max(places, 1))
        }

        if (notation === "Brackets") {
          let table = [")", "[", "{", "]", "(", "}"];
          let log6 = Math.LN10 / Math.log(6) * Decimal.log10(value);
          let wholePartOfLog = Math.floor(log6);
          let decimalPartOfLog = log6 - wholePartOfLog;
          //Easier to convert a number between 0-35 to base 6 than messing with fractions and shit
          let decimalPartTimes36 = Math.floor(decimalPartOfLog * 36);
          let string = "";
          while (wholePartOfLog >= 6) {
            let remainder = wholePartOfLog % 6;
            wholePartOfLog -= remainder;
            wholePartOfLog /= 6;
            string = table[remainder] + string;
          }
          string = "e" + table[wholePartOfLog] + string + ".";
          string += table[Math.floor(decimalPartTimes36 / 6)];
          string += table[decimalPartTimes36 % 6];
          return string;
        }

        mantissa = (mantissa * Decimal.pow(10, power % 3)).toFixed(places)
        if (mantissa >= 1000) {
            mantissa /= 1000;
            power++;
        }

        if (notation === "Standard" || notation === "Mixed scientific") {
            if (power <= 303) return mantissa + " " + FormatList[(power - (power % 3)) / 3];
            else return mantissa + " " + getAbbreviation(power);
        } else if (notation === "Mixed engineering") {
            if (power <= 33) return mantissa + " " + FormatList[(power - (power % 3)) / 3];
            else return (mantissa + "e" + pow);
        } else if (notation === "Engineering") {
            return (mantissa + "e" + pow);
        } else if (notation === "Letters") {
            return mantissa + letter(power,'abcdefghijklmnopqrstuvwxyz');
        } else if (notation === "Cancer") {
            return mantissa + letter(power,['😠', '🎂', '🎄', '💀', '🍆', '👪', '🌈', '💯', '🍦', '🎃', '💋', '😂', '🌙', '⛔', '🐙', '💩', '❓', '☢', '🙈', '👍', '☂', '✌', '⚠', '❌', '😋', '⚡'])
        }

        else {
            if (power > 100000  && commas) power = formatWithCommas(power);
            return "1337 H4CK3R"
        }
    } else if (value < 1000) {
        return (value).toFixed(placesUnder1000);
    } else {
        return "Infinite";
    }
}

function shortenRateOfChange(money) {
  return shorten(money, 2, 2);
}

function shortenCosts(money) {
  return shorten(money, 0, 0);
}

function shortenDimensions(money) {
  return shorten(money, 2, 0);
}

function shortenMoney(money) {
  return shorten(money, 2, 1);
}

function shortenGlyphEffect(money) {
  return shorten(money, 2, 3);
}

function shortenMultiplier(money) {
  return shorten(money, 1, 1);
}

function shortenAutobuyerInput(money) {
  return formatValue("Scientific", money, 2, 0);
}

function shorten(value, places, placesUnder1000) {
    return formatValue(Notation.current().name, value, places, placesUnder1000);
}

function formatX(value, places, placesUnder1000) {
  return shorten(value, places, placesUnder1000) + "x";
}

function formatPercents(value, places) {
  const placesOOM = Math.pow(10, places);
  return Math.round(value * 100 * placesOOM) / placesOOM + "%";
}

function timeDisplay(ms) {
  return TimeSpan.fromMilliseconds(ms).toString();
}

function timeDisplayNoDecimals(ms) {
  return TimeSpan.fromMilliseconds(ms).toStringNoDecimals();
}

function timeDisplayShort(ms) {
  return TimeSpan.fromMilliseconds(ms).toStringShort();
}

function formatWithCommas(value) {
  return value.toString().replace(commaRegexp, ",");
}