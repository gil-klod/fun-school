/**
 * Generates src/lib/data/english-stories.ts — 50 kid-friendly reading comprehension stories (grades 3–5).
 *
 * Run from repo root:
 *   npx tsx scripts/generate-english-stories.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";

type QuizDef = {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;
};

type StoryDef = {
  title: string;
  text: string;
  questions: [QuizDef, QuizDef, QuizDef];
};

const EXPECTED_COUNT = 50;

const RAW: StoryDef[] = [
  {
    title: "The Lost Key",
    text: "Tom was getting ready for school when he couldn't find his house key. He looked in his backpack, under his bed, and even in the kitchen. His little sister Lily said, 'Maybe you left it in the garden yesterday.' Tom ran outside and found the key under a flower pot. He was just in time for the bus!",
    questions: [
      {
        question: "What was Tom looking for?",
        options: ["His phone", "His house key", "His homework", "His shoes"],
        correctIndex: 1,
      },
      {
        question: "Who gave Tom a hint?",
        options: ["His mom", "His dad", "Lily", "His teacher"],
        correctIndex: 2,
      },
      {
        question: "Where did Tom find the key?",
        options: ["In his backpack", "Under a flower pot", "In the kitchen", "On the bus"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Science Fair",
    text: "Noa spent two weeks building a volcano for the school science fair. She mixed baking soda and vinegar to make it erupt. On the day of the fair, hundreds of students came to watch. Noa's volcano was the loudest and most exciting one. She won first prize and a big blue ribbon!",
    questions: [
      {
        question: "What did Noa build?",
        options: ["A robot", "A volcano", "A bridge", "A rocket"],
        correctIndex: 1,
      },
      {
        question: "How long did she work on it?",
        options: ["One day", "One week", "Two weeks", "One month"],
        correctIndex: 2,
      },
      {
        question: "What prize did Noa win?",
        options: ["Second prize", "Third prize", "First prize", "No prize"],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "The New Puppy",
    text: "Maya's family adopted a small golden puppy named Sunny. Sunny loved to chew shoes and chase balls in the backyard. Every morning, Maya filled Sunny's bowl with fresh water and kibble. After school, she taught him to sit and stay. By the end of the month, Sunny could fetch on command!",
    questions: [
      {
        question: "What is the puppy's name?",
        options: ["Buddy", "Sunny", "Max", "Lucky"],
        correctIndex: 1,
      },
      {
        question: "What did Maya teach Sunny to do?",
        options: ["Swim", "Sit and stay", "Climb stairs", "Open doors"],
        correctIndex: 1,
      },
      {
        question: "Where did Sunny chase balls?",
        options: ["In the kitchen", "At the park", "In the backyard", "On the street"],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "Rainy Day Fun",
    text: "Dark clouds covered the sky, so Jake and his sister stayed inside. They built a blanket fort in the living room and read comic books. Their mom brought hot chocolate and buttered popcorn. They played board games until the rain stopped. When the sun came out, they jumped in puddles outside!",
    questions: [
      {
        question: "Why did Jake stay inside?",
        options: ["He was sick", "It was raining", "School was closed", "It was nighttime"],
        correctIndex: 1,
      },
      {
        question: "What did they build in the living room?",
        options: ["A tree house", "A blanket fort", "A Lego tower", "A sandcastle"],
        correctIndex: 1,
      },
      {
        question: "What did they do when the rain stopped?",
        options: ["Went to bed", "Jumped in puddles", "Watched a movie", "Did homework"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Bake Sale",
    text: "Emma's class held a bake sale to raise money for new library books. Emma and her friends baked dozens of chocolate chip cookies. They set up a table near the school entrance with a colorful sign. Teachers and parents bought cookies all morning. By noon, the class had raised enough for fifty new books!",
    questions: [
      {
        question: "Why did the class have a bake sale?",
        options: ["For a field trip", "For new library books", "For sports equipment", "For art supplies"],
        correctIndex: 1,
      },
      {
        question: "What did Emma bake?",
        options: ["Cupcakes", "Brownies", "Chocolate chip cookies", "Muffins"],
        correctIndex: 2,
      },
      {
        question: "How many new books could they buy?",
        options: ["Ten", "Twenty", "Fifty", "One hundred"],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "Soccer Practice",
    text: "Carlos joined the school soccer team in the fall. At first, he missed the ball more than he kicked it. Coach Rivera showed him how to pass and dribble. Carlos practiced every Tuesday and Thursday after school. By the last game, Carlos scored the winning goal!",
    questions: [
      {
        question: "When did Carlos join the team?",
        options: ["In the spring", "In the fall", "In the summer", "In the winter"],
        correctIndex: 1,
      },
      {
        question: "Who was Carlos's coach?",
        options: ["Coach Smith", "Coach Rivera", "Coach Lee", "Coach Brown"],
        correctIndex: 1,
      },
      {
        question: "What did Carlos do in the last game?",
        options: ["Sat on the bench", "Scored the winning goal", "Was the referee", "Left early"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Library Card",
    text: "Priya got her first library card on her ninth birthday. The librarian showed her how to use the computer to find books. Priya checked out three chapter books about animals. She read every night before bed for two weeks. When she returned them, she checked out three more!",
    questions: [
      {
        question: "When did Priya get her library card?",
        options: ["On her eighth birthday", "On her ninth birthday", "On the first day of school", "During summer break"],
        correctIndex: 1,
      },
      {
        question: "What kind of books did Priya check out?",
        options: ["Books about animals", "Books about space", "Cookbooks", "Comic books"],
        correctIndex: 0,
      },
      {
        question: "How many books did she check out at first?",
        options: ["One", "Two", "Three", "Five"],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "Camping Trip",
    text: "The Wilson family drove to Pine Lake for a weekend camping trip. They pitched a tent near the water and cooked dinner over a campfire. At night, they saw owls and heard crickets chirping. In the morning, they hiked a short trail to a waterfall. It was the best family adventure of the year!",
    questions: [
      {
        question: "Where did the Wilson family camp?",
        options: ["Mountain View", "Pine Lake", "River Bend", "Oak Valley"],
        correctIndex: 1,
      },
      {
        question: "How did they cook dinner?",
        options: ["In a microwave", "Over a campfire", "At a restaurant", "On a stove"],
        correctIndex: 1,
      },
      {
        question: "What did they see on their morning hike?",
        options: ["A waterfall", "A bear", "A lighthouse", "A castle"],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "The Broken Crayon",
    text: "Olivia's favorite blue crayon snapped while she was coloring the sky. She felt sad because it was almost used up anyway. Her art teacher gave her a tip: tape the pieces together. Olivia wrapped the crayon with masking tape and kept drawing. Her picture of the ocean won a spot on the classroom wall!",
    questions: [
      {
        question: "What color was Olivia's crayon?",
        options: ["Red", "Green", "Blue", "Yellow"],
        correctIndex: 2,
      },
      {
        question: "What did the teacher suggest?",
        options: ["Buy a new box", "Tape the pieces together", "Use a marker instead", "Throw it away"],
        correctIndex: 1,
      },
      {
        question: "What did Olivia draw?",
        options: ["A forest", "The ocean", "A house", "A dragon"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "Grandpa's Garden",
    text: "Every Saturday, Ben helped his grandpa in the vegetable garden. They pulled weeds, watered tomato plants, and picked ripe carrots. Grandpa taught Ben that bees help flowers grow into vegetables. One day, Ben found a tiny frog hiding under a lettuce leaf. He named it Sprout and visited it each week.",
    questions: [
      {
        question: "When did Ben help in the garden?",
        options: ["Every Monday", "Every Saturday", "Every Sunday", "Every day"],
        correctIndex: 1,
      },
      {
        question: "What did Ben find under a lettuce leaf?",
        options: ["A worm", "A frog", "A snail", "A beetle"],
        correctIndex: 1,
      },
      {
        question: "What did Ben name the frog?",
        options: ["Hopper", "Sprout", "Greenie", "Puddle"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Talent Show",
    text: "The whole school gathered in the auditorium for the annual talent show. Zoe played a song on her violin while her best friend danced. The audience clapped loudly after every performance. A boy named Marcus juggled three balls without dropping any. Zoe won second place and felt proud of her hard work!",
    questions: [
      {
        question: "What instrument did Zoe play?",
        options: ["Piano", "Guitar", "Violin", "Flute"],
        correctIndex: 2,
      },
      {
        question: "What talent did Marcus show?",
        options: ["Singing", "Juggling", "Magic tricks", "Poetry"],
        correctIndex: 1,
      },
      {
        question: "What place did Zoe win?",
        options: ["First place", "Second place", "Third place", "No prize"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "A Snowy Morning",
    text: "Snow fell all night, and the world looked white and quiet. Ava put on her warmest coat, boots, and mittens. She rolled three big snowballs and stacked them to build a snowman. Her dad helped her find a carrot for the nose and a hat for the head. Neighbors waved as they walked their dogs past the yard.",
    questions: [
      {
        question: "What did Ava build in the snow?",
        options: ["An igloo", "A snowman", "A snow fort", "A sled ramp"],
        correctIndex: 1,
      },
      {
        question: "What did they use for the snowman's nose?",
        options: ["A button", "A carrot", "A stick", "A rock"],
        correctIndex: 1,
      },
      {
        question: "When did the snow fall?",
        options: ["All morning", "All night", "All afternoon", "All week"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Beekeeper Visit",
    text: "A local beekeeper visited Ms. Park's class with a safe observation hive. The students learned that bees make honey and pollinate flowers. They wore protective veils and watched thousands of bees at work. The beekeeper explained that bees are important for growing fruits and vegetables. Everyone tasted a spoonful of fresh honey at the end!",
    questions: [
      {
        question: "Who visited the class?",
        options: ["A farmer", "A beekeeper", "A chef", "A firefighter"],
        correctIndex: 1,
      },
      {
        question: "What do bees help flowers do?",
        options: ["Change color", "Get pollinated", "Grow taller", "Smell sweeter"],
        correctIndex: 1,
      },
      {
        question: "What did the students taste at the end?",
        options: ["Fresh honey", "Apple juice", "Flower tea", "Lemonade"],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "Making a Birdhouse",
    text: "Ethan and his dad built a birdhouse in the garage on a rainy afternoon. They measured wood, sanded the edges, and nailed the pieces together. Ethan painted it bright red with a yellow roof. They hung it on a tree in the backyard and waited patiently. A family of chickadees moved in within a week!",
    questions: [
      {
        question: "Who helped Ethan build the birdhouse?",
        options: ["His mom", "His dad", "His uncle", "His teacher"],
        correctIndex: 1,
      },
      {
        question: "What colors did Ethan paint it?",
        options: ["Blue and white", "Red and yellow", "Green and brown", "Purple and pink"],
        correctIndex: 1,
      },
      {
        question: "What birds moved in?",
        options: ["Robins", "Chickadees", "Blue jays", "Sparrows"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Field Trip",
    text: "Mrs. Chen's class took a bus to the natural history museum downtown. They saw dinosaur bones, sparkling gems, and a giant whale skeleton. A guide explained how fossils form over millions of years. The students filled out worksheets and sketched their favorite exhibit. On the ride home, everyone agreed it was their best field trip ever!",
    questions: [
      {
        question: "Where did the class go?",
        options: ["The zoo", "The natural history museum", "The aquarium", "The planetarium"],
        correctIndex: 1,
      },
      {
        question: "What did a guide explain?",
        options: ["How fossils form", "How to paint", "How to cook", "How boats float"],
        correctIndex: 0,
      },
      {
        question: "How did they get to the museum?",
        options: ["By train", "By bus", "By car", "They walked"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Missing Lunch",
    text: "Sam packed his lunch box before leaving for school, but he forgot it on the kitchen counter. At lunchtime, his stomach growled loudly in the cafeteria. His friend Rosa shared half of her turkey sandwich and an apple. Sam promised to bring extra snacks for Rosa the next day. He never forgot his lunch again!",
    questions: [
      {
        question: "Where did Sam leave his lunch?",
        options: ["In his backpack", "On the kitchen counter", "On the bus", "In his locker"],
        correctIndex: 1,
      },
      {
        question: "Who shared food with Sam?",
        options: ["His teacher", "The cafeteria worker", "Rosa", "His brother"],
        correctIndex: 2,
      },
      {
        question: "What did Rosa share?",
        options: ["Pizza and cookies", "Soup and bread", "Half a sandwich and an apple", "Chips and juice"],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "Learning to Swim",
    text: "Hannah was nervous about her first swimming lesson at the community pool. The instructor, Coach Kim, taught her to blow bubbles and float on her back. Hannah held the edge of the pool and kicked her legs. By the third lesson, she could swim across the shallow end. Her parents cheered from the bleachers!",
    questions: [
      {
        question: "Where were the swimming lessons?",
        options: ["At a lake", "At the community pool", "At the beach", "At a water park"],
        correctIndex: 1,
      },
      {
        question: "Who was Hannah's instructor?",
        options: ["Coach Kim", "Coach Dan", "Coach Pat", "Coach Alex"],
        correctIndex: 0,
      },
      {
        question: "What could Hannah do by the third lesson?",
        options: ["Dive off a board", "Swim across the shallow end", "Swim a mile", "Do a flip turn"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Art Contest",
    text: "The town held an art contest for young artists during the summer festival. Leo painted a sunset over the harbor with orange and purple clouds. Judges walked through the gallery and admired every painting. Leo's work was displayed near the front entrance with a ribbon. He felt happy that so many people stopped to look at his art!",
    questions: [
      {
        question: "When was the art contest?",
        options: ["During the summer festival", "On the first day of school", "At Christmas", "On Halloween"],
        correctIndex: 0,
      },
      {
        question: "What did Leo paint?",
        options: ["A mountain", "A sunset over the harbor", "A portrait", "A city street"],
        correctIndex: 1,
      },
      {
        question: "Where was Leo's painting displayed?",
        options: ["In a closet", "Near the front entrance", "Outside in the rain", "In the cafeteria"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "Helping at the Food Bank",
    text: "Isabella's scout troop volunteered at the local food bank on Saturday. They sorted cans, boxed cereal, and stacked bags of rice on shelves. A worker explained that the food would go to families who needed help. Isabella wrote cheerful notes and tucked them into the boxes. She left feeling proud that she had made a difference.",
    questions: [
      {
        question: "Where did Isabella volunteer?",
        options: ["At a hospital", "At a food bank", "At a school", "At a pet shelter"],
        correctIndex: 1,
      },
      {
        question: "What did Isabella put in the boxes?",
        options: ["Toys", "Cheerful notes", "Stickers", "Candy"],
        correctIndex: 1,
      },
      {
        question: "When did the troop volunteer?",
        options: ["On Monday", "On Saturday", "On Wednesday", "On Sunday night"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Magic Trick",
    text: "Daniel practiced a card trick for weeks before the school talent show. He asked a volunteer to pick a card and then shuffled the deck. With a flourish, he pulled the exact card from his pocket. The audience gasped and clapped in surprise. Daniel bowed and promised to teach his little brother the secret later.",
    questions: [
      {
        question: "What kind of trick did Daniel perform?",
        options: ["A juggling trick", "A card trick", "A rope trick", "A disappearing act"],
        correctIndex: 1,
      },
      {
        question: "Where did Daniel find the chosen card?",
        options: ["Under a hat", "In his pocket", "Behind the curtain", "In his shoe"],
        correctIndex: 1,
      },
      {
        question: "Who did Daniel promise to teach?",
        options: ["His teacher", "His little brother", "His neighbor", "His classmate"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Bike Ride",
    text: "Ruby and her cousin Tyler rode their bikes along the river trail on a sunny afternoon. They stopped to watch ducks swimming near the reeds. Tyler's chain came loose, but Ruby knew how to fix it with a small tool. They shared a granola bar on a bench before riding home. It was twelve miles round trip, and they felt strong!",
    questions: [
      {
        question: "Where did Ruby and Tyler ride?",
        options: ["Along the river trail", "Through downtown", "On the highway", "In a parking lot"],
        correctIndex: 0,
      },
      {
        question: "What problem did Tyler have?",
        options: ["A flat tire", "A loose chain", "A broken pedal", "A lost helmet"],
        correctIndex: 1,
      },
      {
        question: "How far did they ride round trip?",
        options: ["Four miles", "Eight miles", "Twelve miles", "Twenty miles"],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "The School Play",
    text: "Fourth graders rehearsed a play about a magical forest for six weeks. Nina played a wise owl who helped lost travelers find their way. She memorized long lines and practiced her hooting sound every night. On opening night, the auditorium was packed with families. Nina forgot one line but her friend whispered the cue, and the show went on!",
    questions: [
      {
        question: "What role did Nina play?",
        options: ["A fox", "A wise owl", "A fairy", "A tree"],
        correctIndex: 1,
      },
      {
        question: "How long did they rehearse?",
        options: ["Two weeks", "Four weeks", "Six weeks", "Ten weeks"],
        correctIndex: 2,
      },
      {
        question: "What happened when Nina forgot a line?",
        options: ["The play stopped", "Her friend whispered the cue", "She left the stage", "The curtain fell"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Tornado Drill",
    text: "The principal announced a tornado drill over the loudspeaker during math class. Students walked quietly into the hallway and crouched facing the wall. Teachers checked that everyone was calm and accounted for. The drill lasted only five minutes, but it felt longer. Afterward, the class discussed why practicing safety plans is important.",
    questions: [
      {
        question: "What kind of drill was it?",
        options: ["Fire drill", "Tornado drill", "Earthquake drill", "Lockdown drill"],
        correctIndex: 1,
      },
      {
        question: "Where did students go?",
        options: ["Outside", "Into the hallway", "To the gym", "To the cafeteria"],
        correctIndex: 1,
      },
      {
        question: "How long did the drill last?",
        options: ["Two minutes", "Five minutes", "Fifteen minutes", "One hour"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Lemonade Stand",
    text: "Marcus and his sister Lily set up a lemonade stand at the end of their driveway. They squeezed fresh lemons and stirred in sugar and cold water. A friendly neighbor bought the first cup and told others about it. By dinnertime, they had earned enough money to donate to the animal shelter. The kittens there would get new toys!",
    questions: [
      {
        question: "What did Marcus and Lily sell?",
        options: ["Cookies", "Lemonade", "Ice cream", "Hot chocolate"],
        correctIndex: 1,
      },
      {
        question: "Who bought the first cup?",
        options: ["Their teacher", "A friendly neighbor", "Their grandma", "A police officer"],
        correctIndex: 1,
      },
      {
        question: "What would their money help buy?",
        options: ["New books", "Toys for kittens", "Soccer balls", "Art supplies"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Star Gazing Night",
    text: "The astronomy club met at the school field after dark with blankets and telescopes. Mr. Ortiz pointed out the Big Dipper and the bright planet Jupiter. Students took turns looking through the telescope at the moon's craters. Hot cocoa kept everyone warm in the cool night air. Several kids said they wanted to learn more about space.",
    questions: [
      {
        question: "What club met after dark?",
        options: ["The chess club", "The astronomy club", "The drama club", "The running club"],
        correctIndex: 1,
      },
      {
        question: "What planet did Mr. Ortiz point out?",
        options: ["Mars", "Jupiter", "Saturn", "Venus"],
        correctIndex: 1,
      },
      {
        question: "What did students look at through the telescope?",
        options: ["The moon's craters", "A comet", "The sun", "An airplane"],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "The Pen Pal Letter",
    text: "Ava's class started a pen pal program with a school in another state. Ava wrote about her dog, her favorite books, and the cherry tree in her yard. Weeks later, a letter arrived with a drawing of mountains and a lake. Her pen pal, Jordan, described hiking with family on weekends. Ava couldn't wait to write back!",
    questions: [
      {
        question: "What program did Ava's class start?",
        options: ["A reading club", "A pen pal program", "A sports league", "A cooking class"],
        correctIndex: 1,
      },
      {
        question: "What was her pen pal's name?",
        options: ["Taylor", "Jordan", "Casey", "Riley"],
        correctIndex: 1,
      },
      {
        question: "What did Jordan describe?",
        options: ["Playing video games", "Hiking with family", "Swimming at the beach", "Riding horses"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Recycling Project",
    text: "Mr. Johnson challenged his class to collect one hundred pounds of recyclables in a month. Students brought in plastic bottles, cardboard, and aluminum cans from home. They weighed the bags each Friday and tracked progress on a chart. The class reached their goal with one day to spare. The school used the money from recycling to buy new basketballs!",
    questions: [
      {
        question: "What was the class goal?",
        options: ["Fifty pounds of recyclables", "One hundred pounds of recyclables", "Two hundred pounds of recyclables", "One thousand pounds of recyclables"],
        correctIndex: 1,
      },
      {
        question: "How often did they weigh the bags?",
        options: ["Every day", "Each Friday", "Once a month", "Never"],
        correctIndex: 1,
      },
      {
        question: "What did the school buy with the recycling money?",
        options: ["New basketballs", "New computers", "New desks", "New uniforms"],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "The Lost Tooth",
    text: "During recess, Mia felt her loose front tooth wiggle and then pop out. She put it in her pocket and ran to show her teacher. Her teacher gave her a tiny tooth-shaped necklace to keep it safe. That night, Mia placed the tooth under her pillow for the tooth fairy. In the morning, she found a shiny coin and a note!",
    questions: [
      {
        question: "When did Mia lose her tooth?",
        options: ["During math class", "During recess", "At bedtime", "At lunch"],
        correctIndex: 1,
      },
      {
        question: "What did the teacher give Mia?",
        options: ["A sticker", "A tooth-shaped necklace", "A new toothbrush", "A bookmark"],
        correctIndex: 1,
      },
      {
        question: "What did Mia find in the morning?",
        options: ["A toy car", "A shiny coin and a note", "A piece of candy", "Nothing"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Marathon for Charity",
    text: "Students at Oakwood Elementary trained for a one-mile fun run to support the children's hospital. They jogged laps around the playground during PE class for three weeks. On race day, families lined the course with signs and bells. Every finisher received a medal and a high-five from the principal. Together, the school raised over two thousand dollars!",
    questions: [
      {
        question: "How far was the fun run?",
        options: ["Half a mile", "One mile", "Three miles", "Ten miles"],
        correctIndex: 1,
      },
      {
        question: "Who did the run support?",
        options: ["The animal shelter", "The children's hospital", "The public library", "The fire department"],
        correctIndex: 1,
      },
      {
        question: "What did every finisher receive?",
        options: ["A trophy", "A medal", "A T-shirt only", "A gift card"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Orchestra Concert",
    text: "Sophie had been taking violin lessons since she was seven years old. Now, at ten, she played in the youth orchestra's spring concert. The group performed songs from around the world, from fast folk tunes to slow lullabies. Sophie's grandparents traveled two hours to hear her play. She smiled the whole time she was on stage!",
    questions: [
      {
        question: "What instrument does Sophie play?",
        options: ["Cello", "Violin", "Trumpet", "Flute"],
        correctIndex: 1,
      },
      {
        question: "When was the concert?",
        options: ["Spring concert", "Winter concert", "Fall concert", "Summer concert"],
        correctIndex: 0,
      },
      {
        question: "Who traveled to hear Sophie play?",
        options: ["Her cousins", "Her grandparents", "Her neighbors", "Her coach"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Fire Station Tour",
    text: "Second and third graders visited the fire station on Fire Safety Day. Firefighters showed them the trucks, hoses, and bright yellow coats. The students practiced stop, drop, and roll on soft mats. One firefighter put on full gear so kids would not be afraid in an emergency. Everyone got a sticker that said 'Future Firefighter!'",
    questions: [
      {
        question: "Where did the students visit?",
        options: ["The police station", "The fire station", "The post office", "The city hall"],
        correctIndex: 1,
      },
      {
        question: "What safety move did they practice?",
        options: ["Stop, drop, and roll", "Look both ways", "Wear a helmet", "Call 911 only"],
        correctIndex: 0,
      },
      {
        question: "What did everyone receive?",
        options: ["A fire hat", "A sticker", "A ride on the truck", "A lunch box"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Butterfly Garden",
    text: "Volunteers planted milkweed and colorful flowers behind the school to attract butterflies. Within a few weeks, monarch caterpillars appeared on the leaves. Ms. Rivera brought her class outside with magnifying glasses to observe them. Students watched a caterpillar form a chrysalis and later emerge as a butterfly. They released it gently into the garden!",
    questions: [
      {
        question: "What plants did volunteers plant?",
        options: ["Cactus and rocks", "Milkweed and colorful flowers", "Pine trees", "Vegetables only"],
        correctIndex: 1,
      },
      {
        question: "What did students use to observe caterpillars?",
        options: ["Telescopes", "Magnifying glasses", "Binoculars", "Microscopes"],
        correctIndex: 1,
      },
      {
        question: "What happened after the chrysalis stage?",
        options: ["The caterpillar slept", "A butterfly emerged", "The plant died", "It rained heavily"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Spelling Bee",
    text: "Ten students from each grade competed in the school spelling bee in the library. Words got harder each round: 'library,' 'beautiful,' 'necessary,' and finally 'championship.' Kai spelled every word correctly until the very last round. He won with the word 'knowledge' and received a dictionary as a prize. His classmates gave him a standing ovation!",
    questions: [
      {
        question: "Where was the spelling bee held?",
        options: ["In the gym", "In the library", "In the cafeteria", "On the playground"],
        correctIndex: 1,
      },
      {
        question: "What was the final winning word?",
        options: ["Championship", "Knowledge", "Beautiful", "Necessary"],
        correctIndex: 1,
      },
      {
        question: "What prize did Kai receive?",
        options: ["A trophy", "A dictionary", "A gift card", "A medal"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Treasure Hunt",
    text: "For the last day of summer camp, counselors hid clues all around the campground. Teams followed rhyming riddles from the flagpole to the dock to the pine grove. The final clue led to a buried box filled with friendship bracelets and fruit snacks. Team Blue found it first after working together and sharing ideas. Everyone celebrated with a campfire sing-along!",
    questions: [
      {
        question: "When did the treasure hunt happen?",
        options: ["First day of camp", "Last day of summer camp", "Mid-winter break", "Spring break"],
        correctIndex: 1,
      },
      {
        question: "What kind of clues did teams follow?",
        options: ["Number codes", "Rhyming riddles", "Map coordinates only", "Phone messages"],
        correctIndex: 1,
      },
      {
        question: "Which team found the treasure first?",
        options: ["Team Red", "Team Green", "Team Blue", "Team Yellow"],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "The Neighborhood Cleanup",
    text: "Residents met at the park on Earth Day with gloves, bags, and grabbers. Children and adults picked up litter along the sidewalks and near the creek. They sorted recyclables from trash and filled twenty large bags. The mayor thanked everyone and planted a new oak tree. The park looked clean and green for the spring picnic!",
    questions: [
      {
        question: "When did the cleanup take place?",
        options: ["On Earth Day", "On New Year's Day", "On Halloween", "On the Fourth of July"],
        correctIndex: 0,
      },
      {
        question: "What did volunteers pick up?",
        options: ["Fallen branches only", "Litter along the sidewalks", "Leaves in gardens", "Old furniture"],
        correctIndex: 1,
      },
      {
        question: "What did the mayor plant?",
        options: ["A rose bush", "A new oak tree", "Tomato plants", "Sunflowers"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Piano Recital",
    text: "Grace had practiced her piano piece, 'Morning Song,' for two months. Her fingers still shook a little as she walked onto the stage. She took a deep breath, placed her hands on the keys, and began to play. The notes flowed smoothly, and she did not miss a single measure. Her piano teacher hugged her backstage and said, 'Perfect!'",
    questions: [
      {
        question: "What piece did Grace play?",
        options: ["Evening Waltz", "Morning Song", "Rain Dance", "Starlight"],
        correctIndex: 1,
      },
      {
        question: "How long had Grace practiced?",
        options: ["Two weeks", "Two months", "One year", "One day"],
        correctIndex: 1,
      },
      {
        question: "Did Grace miss any measures?",
        options: ["Yes, many", "No, she did not miss any", "She stopped halfway", "She forgot the song"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Storm Shelter",
    text: "Dark clouds rolled in quickly during the family picnic at the lake. Park rangers directed visitors to a sturdy storm shelter nearby. Inside, families shared snacks and played quiet games while wind howled outside. After twenty minutes, the all-clear signal sounded over a radio. The sun peeked out, and a bright rainbow stretched across the sky!",
    questions: [
      {
        question: "Where was the family picnic?",
        options: ["At the lake", "At school", "In the city", "At home"],
        correctIndex: 0,
      },
      {
        question: "Where did visitors go during the storm?",
        options: ["To their cars", "To a storm shelter", "Under a tree", "Into the lake"],
        correctIndex: 1,
      },
      {
        question: "What appeared after the storm?",
        options: ["Snow", "A rainbow", "Fireworks", "Fog"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Museum Visit",
    text: "Diego's class explored a hands-on children's museum with science experiments everywhere. He turned cranks to generate electricity and built a bridge from foam blocks. His favorite room had a giant bubble wall he could stand inside. The class ate lunch in the museum courtyard before boarding the bus. Diego wrote three pages about the trip in his journal that night.",
    questions: [
      {
        question: "What kind of museum did Diego visit?",
        options: ["An art museum only", "A hands-on children's museum", "A history museum only", "A sports museum"],
        correctIndex: 1,
      },
      {
        question: "What was Diego's favorite room?",
        options: ["The dinosaur room", "The bubble wall room", "The gift shop", "The parking lot"],
        correctIndex: 1,
      },
      {
        question: "What did Diego write that night?",
        options: ["A poem", "Three pages in his journal", "A letter to the mayor", "A math worksheet"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Cooking Class",
    text: "Chef Ana visited the after-school club to teach kids how to make vegetable soup. She showed them how to wash, peel, and chop carrots and potatoes safely. Each student stirred the big pot and added herbs from the school garden. The soup simmered until the whole room smelled wonderful. Everyone tasted a bowl and agreed homemade soup beats canned soup!",
    questions: [
      {
        question: "Who visited the after-school club?",
        options: ["A dentist", "Chef Ana", "A pilot", "A librarian"],
        correctIndex: 1,
      },
      {
        question: "What did the students make?",
        options: ["Pizza", "Vegetable soup", "Cake", "Sandwiches"],
        correctIndex: 1,
      },
      {
        question: "Where did the herbs come from?",
        options: ["The grocery store", "The school garden", "Chef Ana's house", "A farm far away"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Track Meet",
    text: "Jasmine trained for the hundred-meter dash every day after school. At the track meet, she lined up in lane four beside runners from three other schools. The starter pistol fired, and Jasmine sprinted as fast as she could. She crossed the finish line in second place with a personal best time. Her coach said hard work was paying off!",
    questions: [
      {
        question: "What event did Jasmine run?",
        options: ["The long jump", "The hundred-meter dash", "The relay only", "The marathon"],
        correctIndex: 1,
      },
      {
        question: "Which lane was Jasmine in?",
        options: ["Lane two", "Lane four", "Lane six", "Lane eight"],
        correctIndex: 1,
      },
      {
        question: "What place did Jasmine finish?",
        options: ["First place", "Second place", "Third place", "Last place"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Volunteer Day",
    text: "High school students visited the elementary school for a reading volunteer day. Each older student paired up with a younger buddy and read picture books together. After reading, they drew pictures of their favorite characters. The little kids laughed at funny voices and asked for one more story. Both schools agreed to make it a monthly tradition!",
    questions: [
      {
        question: "Who visited the elementary school?",
        options: ["College professors", "High school students", "Doctors", "Chefs"],
        correctIndex: 1,
      },
      {
        question: "What did buddies do together?",
        options: ["Played soccer", "Read picture books", "Built robots", "Watched a movie"],
        correctIndex: 1,
      },
      {
        question: "How often will they meet?",
        options: ["Once a year", "Monthly", "Never again", "Every day"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Map Adventure",
    text: "Mr. Ellis gave his geography class a challenge: follow a map to find hidden stamps around campus. Teams used compasses, landmarks, and a legend to choose the right paths. One clue mentioned 'the place where bells ring at nine o'clock.' The winning team found all five stamps in twenty-five minutes. They earned extra credit and bragging rights for the week!",
    questions: [
      {
        question: "What subject was the class learning?",
        options: ["Geography", "Music", "Spelling", "Art"],
        correctIndex: 0,
      },
      {
        question: "How many stamps did teams need to find?",
        options: ["Three", "Five", "Ten", "One"],
        correctIndex: 1,
      },
      {
        question: "What tool did teams use besides the map?",
        options: ["Compasses", "Calculators", "Paintbrushes", "Scissors"],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "The Rain Forest Report",
    text: "Ellie chose the Amazon rain forest for her animal research report. She read books and watched a documentary about jaguars, macaws, and tree frogs. Ellie made a poster with layers of the forest labeled emergent, canopy, and floor. She presented to her class and answered questions confidently. Her teacher hung the poster in the hallway for others to see!",
    questions: [
      {
        question: "What topic did Ellie research?",
        options: ["Desert animals", "The Amazon rain forest", "Arctic ice", "City parks"],
        correctIndex: 1,
      },
      {
        question: "What animals did Ellie learn about?",
        options: ["Penguins and seals", "Jaguars, macaws, and tree frogs", "Cows and horses", "Goldfish and turtles"],
        correctIndex: 1,
      },
      {
        question: "Where was Ellie's poster displayed?",
        options: ["In the principal's office only", "In the hallway", "At home", "In the cafeteria kitchen"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Kindness Chain",
    text: "Ms. Lopez started a kindness chain in her classroom with colorful paper links. Every time a student did something kind, they wrote it on a strip and added it to the chain. Links recorded sharing supplies, helping a new student, and comforting a sad friend. By June, the chain stretched across two walls! The class celebrated with a pizza party on the last Friday.",
    questions: [
      {
        question: "What did the class build?",
        options: ["A kindness chain", "A model volcano", "A bird nest", "A robot"],
        correctIndex: 0,
      },
      {
        question: "When did they add a link?",
        options: ["After a kind act", "After a test", "At recess only", "On birthdays only"],
        correctIndex: 0,
      },
      {
        question: "How did the class celebrate in June?",
        options: ["With a pizza party", "With a snowball fight", "With a sleepover", "With a field trip to space"],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "The Time Capsule",
    text: "Fifth graders buried a time capsule near the old oak tree before graduating. Each student contributed a letter, a photo, and a small toy from that year. They sealed everything in a waterproof box with a note: 'Open in 2035!' The principal took a group picture as they placed the box in the ground. Everyone wondered what their future selves would think!",
    questions: [
      {
        question: "Who buried the time capsule?",
        options: ["First graders", "Fifth graders", "Teachers only", "Parents only"],
        correctIndex: 1,
      },
      {
        question: "Where did they bury it?",
        options: ["Near the old oak tree", "In the cafeteria", "On the roof", "In the parking lot"],
        correctIndex: 0,
      },
      {
        question: "When should it be opened?",
        options: ["In 2025", "In 2035", "Next week", "Never"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Solar Eclipse",
    text: "Teachers prepared the whole school for a rare partial solar eclipse. Students received special eclipse glasses and reviewed safety rules in assembly. When the moon began to cover the sun, the playground grew dim and cool. Birds grew quiet, and everyone looked up through their glasses in awe. It lasted only a few minutes, but no one forgot the experience!",
    questions: [
      {
        question: "What astronomical event occurred?",
        options: ["A lunar eclipse", "A partial solar eclipse", "A meteor shower", "A comet"],
        correctIndex: 1,
      },
      {
        question: "What did students wear to watch safely?",
        options: ["Sunglasses only", "Eclipse glasses", "Swimming goggles", "Nothing special"],
        correctIndex: 1,
      },
      {
        question: "What happened to the birds?",
        options: ["They sang louder", "They grew quiet", "They flew away forever", "They changed color"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "The Chess Club",
    text: "Noah joined the chess club because he wanted to learn strategy and patience. Each week, members paired up and played timed games on real chess boards. The coach taught openings like the knight fork and the pin. Noah lost many games at first but kept a notebook of mistakes. By spring, he beat the club champion in a friendly match!",
    questions: [
      {
        question: "Why did Noah join chess club?",
        options: ["To learn strategy and patience", "To run faster", "To paint pictures", "To sing songs"],
        correctIndex: 0,
      },
      {
        question: "What did Noah keep?",
        options: ["A diary of dreams", "A notebook of mistakes", "A collection of stamps", "A pet hamster"],
        correctIndex: 1,
      },
      {
        question: "Who did Noah beat in spring?",
        options: ["The club champion", "His little sister", "A computer", "Nobody"],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "The Hospital Visit",
    text: "Choir students sang cheerful songs in the hospital lobby for patients and staff. They practiced for weeks and brought handmade get-well cards for the children's ward. Nurses smiled and tapped their feet along with the music. One patient said the songs made her day brighter. The choir promised to return next holiday season!",
    questions: [
      {
        question: "Where did the choir sing?",
        options: ["At the mall", "In the hospital lobby", "At the stadium", "In a cave"],
        correctIndex: 1,
      },
      {
        question: "What did students bring for the children's ward?",
        options: ["Handmade get-well cards", "Balloons only", "Pizza", "Video games"],
        correctIndex: 0,
      },
      {
        question: "When will the choir return?",
        options: ["Next holiday season", "Never", "Tomorrow", "In ten years only"],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "The Community Garden",
    text: "Neighbors turned an empty lot into a community garden with raised beds and a tool shed. Families signed up for plots to grow tomatoes, peppers, and sunflowers. Kids painted colorful signs with the garden's name: 'Green Thumb Grove.' On harvest day, everyone shared vegetables and swapped recipes. The once-empty lot became the heart of the neighborhood!",
    questions: [
      {
        question: "What was the garden's name?",
        options: ["Sunny Acres", "Green Thumb Grove", "River Farm", "Oak Hill Patch"],
        correctIndex: 1,
      },
      {
        question: "What did families grow?",
        options: ["Tomatoes, peppers, and sunflowers", "Only grass", "Pine trees", "Rocks"],
        correctIndex: 0,
      },
      {
        question: "What did people do on harvest day?",
        options: ["Shared vegetables and swapped recipes", "Closed the garden forever", "Planted only flowers", "Moved away"],
        correctIndex: 0,
      },
    ],
  },
  {
    title: "Graduation Day",
    text: "Fifth graders wore caps and gowns and walked across the stage one by one. Parents held cameras and cheered as each name was announced. The principal reminded students that learning never stops, even after elementary school. Former teachers sat in the front row, wiping happy tears. Afterward, families gathered on the lawn for cake and hugs!",
    questions: [
      {
        question: "Which grade was graduating?",
        options: ["Third grade", "Fourth grade", "Fifth grade", "Kindergarten"],
        correctIndex: 2,
      },
      {
        question: "What did the principal remind students?",
        options: ["Learning never stops", "School is over forever", "Never read books", "Skip middle school"],
        correctIndex: 0,
      },
      {
        question: "What did families enjoy afterward?",
        options: ["Cake and hugs on the lawn", "A long bus ride", "Homework packets", "A math test"],
        correctIndex: 0,
      },
    ],
  },
];

function countSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function validate(stories: StoryDef[]): void {
  if (stories.length !== EXPECTED_COUNT) {
    throw new Error(`Expected ${EXPECTED_COUNT} stories, got ${stories.length}`);
  }

  const titles = new Set<string>();
  for (const story of stories) {
    if (titles.has(story.title)) {
      throw new Error(`Duplicate title: ${story.title}`);
    }
    titles.add(story.title);

    const sentenceCount = countSentences(story.text);
    if (sentenceCount < 4 || sentenceCount > 6) {
      throw new Error(
        `"${story.title}" has ${sentenceCount} sentences (expected 4–6): ${story.text}`,
      );
    }

    if (story.questions.length !== 3) {
      throw new Error(`"${story.title}" must have exactly 3 questions`);
    }

    for (const [i, q] of story.questions.entries()) {
      if (q.options.length !== 4) {
        throw new Error(`"${story.title}" question ${i + 1} must have 4 options`);
      }
      if (q.correctIndex < 0 || q.correctIndex > 3) {
        throw new Error(`"${story.title}" question ${i + 1} has invalid correctIndex`);
      }
      if (!q.options[q.correctIndex]) {
        throw new Error(`"${story.title}" question ${i + 1} correctIndex out of range`);
      }
    }
  }
}

function generateTs(stories: StoryDef[]): string {
  const storyBlocks = stories
    .map((story) => {
      const questionBlocks = story.questions
        .map((q) => {
          const opts = q.options.map((o) => JSON.stringify(o)).join(", ");
          const explanation = q.explanation
            ? `\n        explanation: ${JSON.stringify(q.explanation)},`
            : "";
          return `      {
        question: ${JSON.stringify(q.question)},
        options: [${opts}],
        correctIndex: ${q.correctIndex},${explanation}
      }`;
        })
        .join(",\n");

      return `  {
    title: ${JSON.stringify(story.title)},
    text: ${JSON.stringify(story.text)},
    questions: [
${questionBlocks}
    ],
  }`;
    })
    .join(",\n");

  return `/** Auto-generated by scripts/generate-english-stories.ts — do not edit manually. */

import type { QuizQuestion } from "../types";

export interface EnglishStory {
  title: string;
  text: string;
  questions: QuizQuestion[];
}

export const ENGLISH_STORIES: EnglishStory[] = [
${storyBlocks}
];
`;
}

function main(): void {
  validate(RAW);

  const outPath = join(process.cwd(), "src/lib/data/english-stories.ts");
  writeFileSync(outPath, generateTs(RAW), "utf8");
  console.log(`Wrote ${RAW.length} English stories to ${outPath}`);
}

main();
