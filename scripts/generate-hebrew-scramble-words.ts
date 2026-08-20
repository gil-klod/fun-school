/**
 * Generates src/lib/data/hebrew-scramble-words.ts — 300 kid-friendly Hebrew scramble words.
 *
 * Requirements: exactly 300 unique words, 3–7 Hebrew letters each, no Latin in word field.
 *
 * Run from repo root:
 *   npx tsx scripts/generate-hebrew-scramble-words.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";

type WordDef = [word: string, hintHe: string, hintEn: string, categoryHe: string, categoryEn: string];

const EXPECTED_COUNT = 300;
const MIN_LEN = 3;
const MAX_LEN = 7;

/** [word, hintHe, hintEn, categoryHe, categoryEn] */
const RAW: WordDef[] = [
  // בית / home (20)
  ["בית", "המקום שגרים בו", "Where you live", "בית", "home"],
  ["דלת", "פותחים אותה כדי להיכנס", "You open it to enter", "בית", "home"],
  ["חלון", "רואים דרכו החוצה", "You look outside through it", "בית", "home"],
  ["מיטה", "ישנים עליה", "You sleep on it", "בית", "home"],
  ["שולחן", "אוכלים עליו", "You eat on it", "בית", "home"],
  ["כיסא", "יושבים עליו", "You sit on it", "בית", "home"],
  ["מנורה", "מאירה בחושך", "Lights up the dark", "בית", "home"],
  ["מקרר", "שומר אוכל קר", "Keeps food cold", "בית", "home"],
  ["תנור", "אופים בו", "Used for baking", "בית", "home"],
  ["מפתח", "פותחים דלת", "Opens a door", "בית", "home"],
  ["מראה", "רואים בה את עצמנו", "You see yourself in it", "בית", "home"],
  ["שטיח", "על הרצפה", "On the floor", "בית", "home"],
  ["כרית", "שמים על הספה", "On the sofa", "בית", "home"],
  ["שמיכה", "מתכסים בה", "You cover yourself with it", "בית", "home"],
  ["ארון", "שומרים בגדים", "Stores clothes", "בית", "home"],
  ["מגב", "מייבשים ידיים", "Dries your hands", "בית", "home"],
  ["סבון", "שוטפים איתו ידיים", "For washing hands", "בית", "home"],
  ["כוס", "שותים ממנה", "You drink from it", "בית", "home"],
  ["צלחת", "שמים עליה אוכל", "You put food on it", "בית", "home"],
  ["מטבח", "מבשלים בו", "Where you cook", "בית", "home"],

  // בית ספר / school (20)
  ["ספר", "משהו שקוראים", "Something you read", "בית ספר", "school"],
  ["מורה", "מלמד בכיתה", "Teaches in class", "בית ספר", "school"],
  ["תלמיד", "לומד בכיתה", "Learns in class", "בית ספר", "school"],
  ["כיתה", "חדר הלימוד", "The classroom", "בית ספר", "school"],
  ["לוח", "כותבים עליו", "You write on it", "בית ספר", "school"],
  ["עפרון", "כותבים איתו", "For writing", "בית ספר", "school"],
  ["מחק", "מוחק כתיבה", "Erases writing", "בית ספר", "school"],
  ["מחברת", "כותבים בה", "You write in it", "בית ספר", "school"],
  ["תיק", "נושאים ספרים", "Carries books", "בית ספר", "school"],
  ["מילון", "מחפשים מילים", "Look up words", "בית ספר", "school"],
  ["מדעים", "לומדים על הטבע", "Learning about nature", "בית ספר", "school"],
  ["שיעור", "זמן לימוד", "A lesson", "בית ספר", "school"],
  ["בחינה", "מבחן בלימודים", "A test", "בית ספר", "school"],
  ["ציון", "תוצאה של מבחן", "A grade", "בית ספר", "school"],
  ["מחשב", "מכונה חכמה", "A computer", "בית ספר", "school"],
  ["מספר", "ספרות", "A number", "בית ספר", "school"],
  ["מילה", "יחידת שפה", "A word", "בית ספר", "school"],
  ["משפט", "קבוצת מילים", "A sentence", "בית ספר", "school"],
  ["סרגל", "מודדים קווים", "Measures lines", "בית ספר", "school"],
  ["תרגיל", "עבודה בכיתה", "Class exercise", "בית ספר", "school"],

  // בעלי חיים / animals (26)
  ["כלב", "חיה שמנבחת", "A pet that barks", "בעלי חיים", "animals"],
  ["חתול", "חיה שמיילת", "A pet that meows", "בעלי חיים", "animals"],
  ["סוס", "רץ מהר", "Runs fast", "בעלי חיים", "animals"],
  ["פרה", "נותנת חלב", "Gives milk", "בעלי חיים", "animals"],
  ["תרנגול", "קורא בבוקר", "Crows in the morning", "בעלי חיים", "animals"],
  ["אריה", "מלך החיות", "King of animals", "בעלי חיים", "animals"],
  ["נמר", "חיה מפוספסת", "Striped animal", "בעלי חיים", "animals"],
  ["דוב", "חיה גדולה וחזקה", "Big strong animal", "בעלי חיים", "animals"],
  ["ארנב", "קופץ גבוה", "Jumps high", "בעלי חיים", "animals"],
  ["עכבר", "קטן ואפור", "Small and gray", "בעלי חיים", "animals"],
  ["ציפור", "עפה בשמיים", "Flies in the sky", "בעלי חיים", "animals"],
  ["נחש", "זוחל על הארץ", "Slithers on the ground", "בעלי חיים", "animals"],
  ["פיל", "גדול עם חדק", "Big with a trunk", "בעלי חיים", "animals"],
  ["גמל", "חיה במדבר", "Lives in the desert", "בעלי חיים", "animals"],
  ["כבש", "עם צמר לבן", "Has white wool", "בעלי חיים", "animals"],
  ["חזיר", "חיה ורודה", "Pink farm animal", "בעלי חיים", "animals"],
  ["ברווז", "שוחה במים", "Swims in water", "בעלי חיים", "animals"],
  ["תרנגולת", "מטילה ביצים", "Lays eggs", "בעלי חיים", "animals"],
  ["דבורה", "מייצרת דבש", "Makes honey", "בעלי חיים", "animals"],
  ["נמלה", "עובדת קשה", "Works hard", "בעלי חיים", "animals"],
  ["פרפר", "עף בין פרחים", "Flies among flowers", "בעלי חיים", "animals"],
  ["עטלף", "עף בלילה", "Flies at night", "בעלי חיים", "animals"],
  ["סנאי", "אוסף אגוזים", "Collects nuts", "בעלי חיים", "animals"],
  ["שועל", "חיה חכמה", "Clever animal", "בעלי חיים", "animals"],
  ["זאב", "דומה לכלב", "Looks like a dog", "בעלי חיים", "animals"],
  ["חמור", "חיה שעובדת", "A working animal", "בעלי חיים", "animals"],

  // טבע / nature (26)
  ["שמש", "זורחת בשמיים", "Shines in the sky", "טבע", "nature"],
  ["ירח", "מאיר בלילה", "Lights up the night", "טבע", "nature"],
  ["כוכב", "נוצץ בלילה", "Twinkles at night", "טבע", "nature"],
  ["מים", "שותים את זה", "You drink this", "טבע", "nature"],
  ["פרח", "גדל בגינה", "Grows in a garden", "טבע", "nature"],
  ["עצים", "גדלים ביער", "Grow in the forest", "טבע", "nature"],
  ["גשם", "יורד מהשמיים", "Falls from the sky", "טבע", "nature"],
  ["שלג", "לבן וקר", "White and cold", "טבע", "nature"],
  ["רוח", "נושבת בחוץ", "Blows outside", "טבע", "nature"],
  ["ענן", "לבן בשמיים", "White in the sky", "טבע", "nature"],
  ["נהר", "זורם לאט", "Flows slowly", "טבע", "nature"],
  ["אגם", "מים שקטים", "Still water", "טבע", "nature"],
  ["יער", "מלא עצים", "Full of trees", "טבע", "nature"],
  ["דשא", "ירוק על האדמה", "Green on the ground", "טבע", "nature"],
  ["עלה", "על העץ", "On the tree", "טבע", "nature"],
  ["אדמה", "עליה הולכים", "You walk on it", "טבע", "nature"],
  ["חול", "על החוף", "On the beach", "טבע", "nature"],
  ["אבן", "קשה וחזקה", "Hard and strong", "טבע", "nature"],
  ["קשת", "צבעונית אחרי גשם", "Colorful after rain", "טבע", "nature"],
  ["ברק", "אור בזמן סערה", "Light during a storm", "טבע", "nature"],
  ["רעמים", "קול בזמן סערה", "Sound during a storm", "טבע", "nature"],
  ["נחל", "מים קטנים", "A small stream", "טבע", "nature"],
  ["שמיים", "כחולים ביום", "Blue during the day", "טבע", "nature"],
  ["גינה", "מגדלים בה פרחים", "You grow flowers there", "טבע", "nature"],
  ["מדבר", "חם ויבש", "Hot and dry", "טבע", "nature"],
  ["נמל", "ספינות עוגנות", "Ships anchor there", "טבע", "nature"],

  // אוכל / food (26)
  ["לחם", "אוכלים בבוקר", "Eaten in the morning", "אוכל", "food"],
  ["חלב", "לבן וטעים", "White and tasty", "אוכל", "food"],
  ["גבינה", "מוצר חלב", "A dairy product", "אוכל", "food"],
  ["ביצה", "מטגנים אותה", "You fry it", "אוכל", "food"],
  ["תפוח", "פרי אדום או ירוק", "Red or green fruit", "אוכל", "food"],
  ["בננה", "פרי צהוב", "Yellow fruit", "אוכל", "food"],
  ["תפוז", "פרי כתום", "Orange fruit", "אוכל", "food"],
  ["עגבניה", "אדומה בסלט", "Red in salad", "אוכל", "food"],
  ["מלפפון", "ירוק וקר", "Green and cool", "אוכל", "food"],
  ["גזר", "כתום ובריא", "Orange and healthy", "אוכל", "food"],
  ["תות", "פרי אדום קטן", "Small red berry", "אוכל", "food"],
  ["אורז", "אוכל לבן", "White food", "אוכל", "food"],
  ["מרק", "חם בקערה", "Hot in a bowl", "אוכל", "food"],
  ["סלט", "ירוק וטרי", "Green and fresh", "אוכל", "food"],
  ["דבש", "מתוק מדבורים", "Sweet from bees", "אוכל", "food"],
  ["שוקולד", "מתוק וחום", "Sweet and brown", "אוכל", "food"],
  ["עוגה", "מתוקה ליום הולדת", "Sweet birthday treat", "אוכל", "food"],
  ["עוגייה", "קטנה ומתוקה", "Small and sweet", "אוכל", "food"],
  ["תמר", "פרי מתוק", "Sweet fruit", "אוכל", "food"],
  ["זית", "קטן ושמן", "Small and oily", "אוכל", "food"],
  ["מיץ", "שותים ממנו", "You drink it", "אוכל", "food"],
  ["ריבה", "מתוקה על לחם", "Sweet on bread", "אוכל", "food"],
  ["קפה", "שתייה חמה", "Hot drink", "אוכל", "food"],
  ["משקה", "שותים אותו", "Something you drink", "אוכל", "food"],
  ["לימון", "חמוץ וצהוב", "Sour and yellow", "אוכל", "food"],
  ["חסה", "ירוקה בסלט", "Green in salad", "אוכל", "food"],

  // אנשים / people (15)
  ["ילד", "אדם צעיר", "A young person", "אנשים", "people"],
  ["ילדה", "בת צעירה", "A young girl", "אנשים", "people"],
  ["גבר", "איש בוגר", "An adult man", "אנשים", "people"],
  ["אישה", "אדם בוגרת", "An adult woman", "אנשים", "people"],
  ["תינוק", "קטן מאוד", "Very small baby", "אנשים", "people"],
  ["חבר", "מישהו שאוהבים", "Someone you like", "אנשים", "people"],
  ["ידיד", "מישהו שמשחקים איתו", "Someone you play with", "אנשים", "people"],
  ["שכן", "גר ליד", "Lives nearby", "אנשים", "people"],
  ["אורח", "מגיע לביקור", "Comes to visit", "אנשים", "people"],
  ["סבא", "סבא של הילד", "Grandfather", "אנשים", "people"],
  ["סבתא", "סבתא של הילד", "Grandmother", "אנשים", "people"],
  ["דוד", "אח של הורה", "Parent's brother", "אנשים", "people"],
  ["דודה", "אחות של הורה", "Parent's sister", "אנשים", "people"],
  ["נער", "בן נעורים", "A teenage boy", "אנשים", "people"],
  ["נערה", "בת נעורים", "A teenage girl", "אנשים", "people"],

  // משפחה / family (13)
  ["אמא", "הורה אישה", "Mother", "משפחה", "family"],
  ["אבא", "הורה גבר", "Father", "משפחה", "family"],
  ["אחות", "ילדה באותה משפחה", "Girl in same family", "משפחה", "family"],
  ["משפחה", "אמא אבא וילדים", "Mom dad and kids", "משפחה", "family"],
  ["נכד", "בן של הילדים", "Grandson", "משפחה", "family"],
  ["נכדה", "בת של הילדים", "Granddaughter", "משפחה", "family"],
  ["חתן", "בעל של הבת", "Daughter's husband", "משפחה", "family"],
  ["כלה", "אשת הבן", "Son's wife", "משפחה", "family"],
  ["זוג", "שניים יחד", "Two together", "משפחה", "family"],
  ["תאומים", "שניים דומים", "Two who look alike", "משפחה", "family"],
  ["אחיין", "בן של האח", "Nephew", "משפחה", "family"],
  ["אחיינית", "בת של האחות", "Niece", "משפחה", "family"],
  ["קרוב", "מישהו מהמשפחה", "A family relative", "משפחה", "family"],

  // גוף / body (20)
  ["ראש", "עליו השיער", "Has hair on top", "גוף", "body"],
  ["עין", "רואים איתה", "You see with it", "גוף", "body"],
  ["אוזן", "שומעים איתה", "You hear with it", "גוף", "body"],
  ["זרוע", "בין כתף ליד", "Between shoulder and hand", "גוף", "body"],
  ["רגל", "הולכים איתה", "You walk with it", "גוף", "body"],
  ["שיער", "על הראש", "On your head", "גוף", "body"],
  ["פנים", "עיניים ופה", "Eyes and mouth", "גוף", "body"],
  ["בטן", "אוכלים אליה", "Food goes there", "גוף", "body"],
  ["צוואר", "מחבר ראש לגוף", "Connects head to body", "גוף", "body"],
  ["כתף", "לפני הזרוע", "Before the arm", "גוף", "body"],
  ["ברך", "באמצע הרגל", "Middle of the leg", "גוף", "body"],
  ["אצבע", "על היד", "On the hand", "גוף", "body"],
  ["שיניים", "לועסים איתן", "You chew with them", "גוף", "body"],
  ["לשון", "בתוך הפה", "Inside the mouth", "גוף", "body"],
  ["גוף", "כל הגוף שלנו", "Our whole body", "גוף", "body"],
  ["מוח", "חושבים איתו", "We think with it", "גוף", "body"],
  ["שפתיים", "מסביב לפה", "Around the mouth", "גוף", "body"],
  ["עיניים", "שתי עיניים", "Two eyes", "גוף", "body"],
  ["אצבעות", "חמש על היד", "Five on the hand", "גוף", "body"],
  ["גבות", "מעל העיניים", "Above the eyes", "גוף", "body"],

  // בגדים / clothes (15)
  ["חולצה", "לובשים על הגוף", "Worn on the body", "בגדים", "clothes"],
  ["מכנס", "לובשים על הרגליים", "Worn on legs", "בגדים", "clothes"],
  ["שמלה", "בגד לילדה", "Dress for a girl", "בגדים", "clothes"],
  ["נעל", "על הרגל", "On the foot", "בגדים", "clothes"],
  ["גרב", "על הרגל בנעל", "Under the shoe", "בגדים", "clothes"],
  ["כובע", "על הראש", "On the head", "בגדים", "clothes"],
  ["מעיל", "בגד חם", "Warm coat", "בגדים", "clothes"],
  ["סריג", "בגד חם", "Warm sweater", "בגדים", "clothes"],
  ["חגורה", "סוגרים מכנס", "Holds up pants", "בגדים", "clothes"],
  ["צעיף", "על הצוואר", "On the neck", "בגדים", "clothes"],
  ["כפפות", "על הידיים", "On the hands", "בגדים", "clothes"],
  ["מגפיים", "נעליים גבוהות", "Tall boots", "בגדים", "clothes"],
  ["סנדל", "נעל קיץ", "Summer shoe", "בגדים", "clothes"],
  ["אפוד", "בלי שרוולים", "Without sleeves", "בגדים", "clothes"],

  // ספורט / sports (15)
  ["כדור", "דבר עגול", "Round thing", "ספורט", "sports"],
  ["ריצה", "רצים מהר", "Running fast", "ספורט", "sports"],
  ["שחייה", "בבריכה", "In the pool", "ספורט", "sports"],
  ["אופניים", "עם שני גלגלים", "Two wheels", "ספורט", "sports"],
  ["כדורגל", "עם רגל", "With a foot", "ספורט", "sports"],
  ["כדורסל", "זורקים לסל", "Throw to basket", "ספורט", "sports"],
  ["טניס", "עם מחבט", "With a racket", "ספורט", "sports"],
  ["קפיצה", "גבוה למעלה", "High up", "ספורט", "sports"],
  ["מירוץ", "מתחרים", "Competing", "ספורט", "sports"],
  ["קבוצה", "יחד בקבוצה", "Together in team", "ספורט", "sports"],
  ["מגרש", "מקום משחק", "Play area", "ספורט", "sports"],
  ["שער", "מטרה בכדורגל", "Goal in soccer", "ספורט", "sports"],
  ["מדליה", "פרס בניצחון", "Prize for winning", "ספורט", "sports"],
  ["אימון", "תרגול ספורט", "Sports practice", "ספורט", "sports"],
  ["התעמלות", "תרגילי גוף", "Body exercises", "ספורט", "sports"],

  // עיר / city (15)
  ["עיר", "מקום גדול", "Big place", "עיר", "city"],
  ["רחוב", "הולכים בו", "You walk on it", "עיר", "city"],
  ["כיכר", "מרכז העיר", "City center", "עיר", "city"],
  ["גשר", "מעל המים", "Over water", "עיר", "city"],
  ["פארק", "מקום ירוק", "Green place", "עיר", "city"],
  ["חנות", "קונים בה", "You buy there", "עיר", "city"],
  ["שוק", "מוכרים אוכל", "They sell food", "עיר", "city"],
  ["בנק", "שומרים כסף", "Keeps money", "עיר", "city"],
  ["מרפאה", "רופא עוזר", "Doctor helps", "עיר", "city"],
  ["מוזיאון", "מציגים דברים", "Shows things", "עיר", "city"],
  ["ספריה", "מלאה ספרים", "Full of books", "עיר", "city"],
  ["תיאטרון", "מציגים הצגה", "Shows a play", "עיר", "city"],
  ["קולנוע", "רואים סרט", "Watch a movie", "עיר", "city"],
  ["מסעדה", "אוכלים בה", "You eat there", "עיר", "city"],
  ["תחנה", "עוצרים שם", "Stop there", "עיר", "city"],

  // רגשות / emotions (15)
  ["שמח", "מרגיש טוב", "Feels good", "רגשות", "emotions"],
  ["עצוב", "מרגיש רע", "Feels bad", "רגשות", "emotions"],
  ["כועס", "כועס מאוד", "Very angry", "רגשות", "emotions"],
  ["מפחד", "יש פחד", "Has fear", "רגשות", "emotions"],
  ["אוהב", "רגש טוב", "Good feeling", "רגשות", "emotions"],
  ["שמחה", "רגש טוב", "Happy feeling", "רגשות", "emotions"],
  ["עצב", "רגש קשה", "Hard feeling", "רגשות", "emotions"],
  ["פחד", "מרגיש מפחד", "Feeling afraid", "רגשות", "emotions"],
  ["כעס", "כועס", "Angry", "רגשות", "emotions"],
  ["הפתעה", "לא ציפיתי", "Did not expect", "רגשות", "emotions"],
  ["גאה", "מרגיש טוב על עצמו", "Proud of self", "רגשות", "emotions"],
  ["מתרגש", "מחכה לדבר", "Waiting for something", "רגשות", "emotions"],
  ["רגוע", "לא לחוץ", "Not stressed", "רגשות", "emotions"],
  ["עייף", "רוצה לישון", "Wants to sleep", "רגשות", "emotions"],
  ["נרגש", "מלא התלהבות", "Full of excitement", "רגשות", "emotions"],

  // צבעים / colors (10)
  ["אדום", "צבע של תפוח", "Color of apple", "צבעים", "colors"],
  ["כחול", "צבע השמיים", "Sky color", "צבעים", "colors"],
  ["ירוק", "צבע הדשא", "Grass color", "צבעים", "colors"],
  ["צהוב", "צבע השמש", "Sun color", "צבעים", "colors"],
  ["שחור", "צבע הלילה", "Night color", "צבעים", "colors"],
  ["לבן", "צבע השלג", "Snow color", "צבעים", "colors"],
  ["ורוד", "צבע עדין", "Soft color", "צבעים", "colors"],
  ["סגול", "צבע מיוחד", "Special color", "צבעים", "colors"],
  ["כתום", "צבע תפוז", "Orange color", "צבעים", "colors"],
  ["חום", "צבע העץ", "Tree color", "צבעים", "colors"],

  // תחבורה / transport (12)
  ["מכונית", "נוסעים בה", "We ride in it", "תחבורה", "transport"],
  ["אוטובוס", "רכב גדול", "Big vehicle", "תחבורה", "transport"],
  ["רכבת", "על פסים", "On tracks", "תחבורה", "transport"],
  ["מטוס", "עף בשמיים", "Flies in sky", "תחבורה", "transport"],
  ["ספינה", "שטה במים", "Sails on water", "תחבורה", "transport"],
  ["אופנוע", "רכב על שני גלגלים", "Two-wheeled vehicle", "תחבורה", "transport"],
  ["מונית", "רכב שכיר", "Taxi car", "תחבורה", "transport"],
  ["משאית", "מובילה דברים", "Carries things", "תחבורה", "transport"],
  ["חניה", "עוצרים רכב", "Park a car", "תחבורה", "transport"],
  ["רמזור", "אדום וירוק", "Red and green", "תחבורה", "transport"],
  ["מעבר", "חוצים כביש", "Cross the road", "תחבורה", "transport"],
  ["כביש", "הולכים עליו", "Road", "תחבורה", "transport"],

  // משחקים / games (10)
  ["בובה", "צעצוע של ילדה", "Girl's toy", "משחקים", "games"],
  ["בלון", "מתנפח באוויר", "Inflates with air", "משחקים", "games"],
  ["משחק", "משחקים בו", "We play it", "משחקים", "games"],
  ["בלוקים", "בונים מהם", "Build with them", "משחקים", "games"],
  ["פאזל", "מחברים חלקים", "Connect pieces", "משחקים", "games"],
  ["קוביה", "משחק קוביות", "Dice game", "משחקים", "games"],
  ["צעצוע", "שחקן של ילד", "Child's toy", "משחקים", "games"],
  ["מחבט", "במשחק כדור", "For ball games", "משחקים", "games"],
  ["חבל", "קופצים", "Jump rope", "משחקים", "games"],
  ["דמקה", "משחק לוח", "Board game", "משחקים", "games"],

  // זמן / time (10)
  ["היום", "עכשיו", "Right now", "זמן", "time"],
  ["לילה", "חשוך בחוץ", "Dark outside", "זמן", "time"],
  ["בוקר", "התחיל היום", "Day started", "זמן", "time"],
  ["צהריים", "אמצע היום", "Middle of day", "זמן", "time"],
  ["ערב", "לפני הלילה", "Before night", "זמן", "time"],
  ["שבוע", "שבעה ימים", "Seven days", "זמן", "time"],
  ["חודש", "שלושים יום", "About thirty days", "זמן", "time"],
  ["אביב", "עונת פריחה", "Flowering season", "זמן", "time"],
  ["קיץ", "עונה חמה", "Hot season", "זמן", "time"],
  ["חורף", "עונה קרה", "Cold season", "זמן", "time"],

  // מקצועות / jobs (10)
  ["רופא", "מרפא חולים", "Treats sick people", "מקצועות", "jobs"],
  ["ספרן", "מסדר ספרים", "Organizes books", "מקצועות", "jobs"],
  ["טבח", "מבשל אוכל", "Cooks food", "מקצועות", "jobs"],
  ["נהג", "נוהג ברכב", "Drives a car", "מקצועות", "jobs"],
  ["חקלאי", "עובד בשדה", "Works in field", "מקצועות", "jobs"],
  ["חייל", "שומר על המדינה", "Protects the country", "מקצועות", "jobs"],
  ["טייס", "טס במטוס", "Flies a plane", "מקצועות", "jobs"],
  ["נגר", "עובד בעץ", "Works with wood", "מקצועות", "jobs"],
  ["צייר", "מצייר תמונות", "Paints pictures", "מקצועות", "jobs"],
  ["שחקן", "משחק בתיאטרון", "Acts in theater", "מקצועות", "jobs"],

  // חגים / holidays (7)
  ["חגיגה", "שמחים וחוגגים", "Celebrate happily", "חגים", "holidays"],
  ["פסח", "חג האביב", "Spring holiday", "חגים", "holidays"],
  ["סוכות", "יושבים בסוכה", "Sit in a sukkah", "חגים", "holidays"],
  ["פורים", "לובשים תחפושת", "Wear a costume", "חגים", "holidays"],
  ["שבת", "יום מנוחה", "Day of rest", "חגים", "holidays"],
  ["סביבון", "מסתובב בחג", "Spins on holiday", "חגים", "holidays"],
  ["מצה", "אוכל של פסח", "Passover food", "חגים", "holidays"],

  // מחשבה / abstract (15)
  ["חלום", "מה שרואים בשנת לילה", "What you see when sleeping", "מחשבה", "abstract"],
  ["שיר", "מישהו שר", "Someone sings it", "מחשבה", "abstract"],
  ["סיפור", "מספרים אותו", "We tell it", "מחשבה", "abstract"],
  ["שאלה", "שואלים אותה", "You ask it", "מחשבה", "abstract"],
  ["תשובה", "עונה על שאלה", "Answers a question", "מחשבה", "abstract"],
  ["רעיון", "מחשבה חדשה", "A new thought", "מחשבה", "abstract"],
  ["תקווה", "מקווים לטוב", "Hope for good", "מחשבה", "abstract"],
  ["אמת", "דבר נכון", "Something true", "מחשבה", "abstract"],
  ["שקר", "דבר לא נכון", "Something false", "מחשבה", "abstract"],
  ["סוד", "לא מספרים", "Not telling", "מחשבה", "abstract"],
  ["הבטחה", "מבטיחים לעשות", "Promise to do", "מחשבה", "abstract"],
  ["זיכרון", "זוכרים ממנו", "We remember it", "מחשבה", "abstract"],
  ["דמיון", "מדמיינים בראש", "Imagine in head", "מחשבה", "abstract"],
  ["חידה", "צריך לפתור", "Need to solve", "מחשבה", "abstract"],
  ["ניצחון", "ניצחנו במשחק", "We won the game", "מחשבה", "abstract"],
  ["ספה", "יושבים עליה בבית", "Living room seat", "בית", "home"],
];

function hebrewLetterCount(word: string): number {
  return [...word].filter((c) => /[\u05D0-\u05EA]/.test(c)).length;
}

function hasLatin(text: string): boolean {
  return /[A-Za-z]/.test(text);
}

function escapeStr(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function validate(raw: WordDef[]): void {
  if (raw.length !== EXPECTED_COUNT) {
    throw new Error(`Expected ${EXPECTED_COUNT} words, got ${raw.length}`);
  }

  const seen = new Set<string>();
  const lengthDist: Record<number, number> = {};

  for (const [word, hintHe, hintEn, categoryHe, categoryEn] of raw) {
    if (hasLatin(word)) {
      throw new Error(`Word contains Latin characters: "${word}"`);
    }

    const len = hebrewLetterCount(word);
    if (len < MIN_LEN || len > MAX_LEN) {
      throw new Error(`Word "${word}" has ${len} Hebrew letters (need ${MIN_LEN}-${MAX_LEN})`);
    }

    if (seen.has(word)) {
      throw new Error(`Duplicate word: "${word}"`);
    }
    seen.add(word);

    lengthDist[len] = (lengthDist[len] ?? 0) + 1;

    if (!hintHe || !hintEn || !categoryHe || !categoryEn) {
      throw new Error(`Missing hint/category for word "${word}"`);
    }
  }

  console.log("Validation passed:");
  console.log(`  Total words: ${raw.length}`);
  console.log("  Length distribution:", lengthDist);
}

function toOutput(raw: WordDef[]): string {
  const entries = raw
    .map(
      ([word, hintHe, hintEn, categoryHe, categoryEn]) =>
        `  { word: "${escapeStr(word)}", hintHe: "${escapeStr(hintHe)}", hintEn: "${escapeStr(hintEn)}", categoryHe: "${escapeStr(categoryHe)}", categoryEn: "${escapeStr(categoryEn)}" },`
    )
    .join("\n");

  return `import type { HebrewWord } from "./hebrew";

/** Auto-generated by scripts/generate-hebrew-scramble-words.ts — do not edit manually. */
export const HEBREW_SCRAMBLE_WORDS: HebrewWord[] = [
${entries}
];
`;
}

function main() {
  validate(RAW);
  const outPath = join(process.cwd(), "src/lib/data/hebrew-scramble-words.ts");
  writeFileSync(outPath, toOutput(RAW), "utf-8");
  console.log(`Wrote ${outPath}`);
}

main();
