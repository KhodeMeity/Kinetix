/* دادهٔ حرکت‌های جدید و تکمیل توضیحات — بخش ۲: شکم و پایین‌تنه */
const fills = {
  /* ---- شکم ---- */
  63: { // Bicycle Crunch
    steps: [
      ['به پشت دراز بکش، دست‌ها کنار گوش و پاها کمی بالاتر از زمین.', 'Lie on your back with hands lightly behind your head and legs lifted off the floor.'],
      ['زانوی راست را به سمت سینه جمع کن و هم‌زمان آرنج چپ را به زانوی راست نزدیک کن.', 'Bring your right knee toward your chest while rotating your left elbow toward that knee.'],
      ['پای راست را صاف کن و بلافاصله همین حرکت را برای پای چپ و آرنج راست انجام بده.', 'Extend the right leg straight and immediately switch sides, bringing left knee to right elbow.']],
    tips: [
      ['به‌جای نزدیک کردن آرنج، شانه‌ات را به سمت زانوی مخالف بچرخان.', 'Focus on rotating your shoulder toward the opposite knee rather than just moving your elbow.'],
      ['حرکت را آهسته و با کنترل بزن، نه با سرعت دیوانه‌وار.', 'Perform the reps slowly and with control rather than rushing.']],
    mistakes: [['تاب دادن سریع سر و گردن با دست‌ها', 'Yanking the head and neck rapidly with the hands']]
  },
  62: { // Reverse Crunch
    steps: [
      ['به پشت دراز بکش، دست‌ها کنار بدن روی زمین و زانوها با زاویهٔ ۹۰ درجه در هوا.', 'Lie on your back with arms at your sides and knees bent at 90 degrees in the air.'],
      ['با انقباض زیرشکم، زانوها را به سمت سینه بکش و لگن را کمی از زمین بلند کن.', 'Contract your lower abs to curl your knees toward your chest, lifting your hips slightly off the mat.'],
      ['با کنترل کامل لگن را روی زمین برگردان.', 'Lower your hips back down slowly with full control.']],
    tips: [['کلید این حرکت بلند کردن لگن از زمین است، نه فقط تکان دادن پاها.', 'The key is curling the pelvis off the floor, not just swinging the legs.']],
    mistakes: [['تاب دادن پاها برای بالا بردن لگن', 'Swinging the legs with momentum to lift the hips']]
  },
  79: { // Russian Twist
    steps: [
      ['روی زمین بنشین، زانوها را خم کن و بالاتنه را حدود ۴۵ درجه به عقب متمایل کن (پشت صاف باشد).', 'Sit on the floor with knees bent and lean your torso back at a 45-degree angle with a flat back.'],
      ['دست‌ها را جلوی سینه به هم قفل کن و بالاتنه را به سمت راست بچرخان.', 'Clasp your hands in front of your chest and rotate your torso to the right.'],
      ['به مرکز برگرد و به سمت چپ بچرخان.', 'Return through the center and rotate to the left.']],
    tips: [
      ['با نگاهت دست‌ها را دنبال کن تا چرخش واقعاً از تنه انجام شود، نه فقط تکان دادن دست‌ها.', 'Follow your hands with your eyes to ensure true torso rotation rather than just swinging your arms.'],
      ['برای سخت‌تر کردن، پاشنه‌ها را از زمین بلند کن.', 'Lift your heels off the floor to make the exercise harder.']],
    mistakes: [
      ['گرد کردن ستون فقرات', 'Rounding the spine'],
      ['تکان دادن سریع بازوها بدون چرخاندن شانه‌ها', 'Swinging the arms rapidly without rotating the shoulders']]
  },
  76: { // V-Up
    steps: [
      ['به پشت دراز بکش، پاها صاف و دست‌ها کشیده بالای سر.', 'Lie flat on your back with legs straight and arms extended overhead.'],
      ['هم‌زمان پاهای صاف و بالاتنه را از زمین بلند کن تا بدن شکل V بگیرد و دست‌ها به پنجه‌ها برسند.', 'Simultaneously lift your straight legs and torso off the ground into a V-shape, reaching hands toward toes.'],
      ['با کنترل به حالت درازکش برگرد.', 'Lower back down to the floor with control.']],
    tips: [['در تمام طول حرکت زانوها و آرنج‌ها را صاف نگه دار.', 'Keep both your knees and elbows straight throughout the entire movement.']],
    mistakes: [['خم کردن زانوها برای رساندن دست به پا', 'Bending the knees to touch the toes']]
  },
  /* ---- پایین‌تنه ---- */
  44: { // Jump Squat
    steps: [
      ['در حالت اسکوات پایین برو تا ران‌ها موازی زمین شوند.', 'Squat down until your thighs are parallel to the ground.'],
      ['با تمام توان به سمت بالا بپر و دست‌ها را به عقب تاب بده.', 'Explode upward as high as possible, swinging your arms back for momentum.'],
      ['بسیار نرم روی پنجه‌ها و سپس پاشنه‌ها فرود بیا و بلافاصله وارد اسکوات بعدی شو.', 'Land softly on the balls of your feet, rolling onto your heels directly into the next squat.']],
    tips: [['تا حد امکان بی‌صدا فرود بیا تا ضربه را عضلات جذب کنند، نه مفصل زانو.', 'Land as quietly as possible to absorb impact through your muscles rather than your knee joints.']],
    mistakes: [['فرود آمدن با پاهای صاف و قفل', 'Landing with stiff, straight legs']]
  },
  52: { // Jump Lunge
    steps: [
      ['در حالت پایین لانج قرار بگیر (هر دو زانو ۹۰ درجه).', 'Start at the bottom of a lunge with both knees bent at 90 degrees.'],
      ['به سمت بالا بپر و در هوا جای پای جلو و عقب را عوض کن.', 'Jump upward explosively and switch your front and back legs in mid-air.'],
      ['نرم در حالت لانج با پای مخالف فرود بیا و بلافاصله تکرار بعدی را بزن.', 'Land softly into a lunge on the opposite leg and immediately repeat.']],
    tips: [['شکم را سفت نگه دار و از حرکت متقابل دست‌ها برای حفظ تعادل در هوا استفاده کن.', 'Keep your core tight and use opposite-arm swing to maintain balance in mid-air.']],
    mistakes: [['از دست دادن تعادل و جمع شدن زانوها به داخل هنگام فرود', 'Losing balance and letting knees cave inward upon landing']]
  },
  45: { // Pistol Squat
    steps: [
      ['روی یک پا بایست و پای دیگر را صاف رو به جلو در هوا نگه دار.', 'Stand on one leg and extend the other leg straight out in front of you.'],
      ['دست‌ها را برای تعادل رو به جلو دراز کن و روی یک پا تا انتها پایین برو.', 'Reach your arms forward for counterbalance and squat all the way down on one leg.'],
      ['با فشار پاشنهٔ پای تکیه‌گاه، بدون اینکه پای دیگر زمین را لمس کند، بالا بیا.', 'Drive through your grounded heel to stand back up without letting the free leg touch the floor.']],
    tips: [['اگر انعطاف مچ پایت کم است، یک گوه یا کتاب نازک زیر پاشنه بگذار.', 'If ankle mobility is limited, place a thin book or wedge under your heel.']],
    mistakes: [['رها کردن بدن در انتهای حرکت و افتادن روی زمین', 'Dropping uncontrolled into the bottom position']]
  }
};

const merges = {
  61: { // Crunch
    tips: [
      ['گودی کمر باید در تمام طول حرکت به زمین چسبیده بماند.', 'Keep your lower back pressed flat against the floor throughout the movement.'],
      ['به سقف نگاه کن تا به گردن فشار نیاید.', 'Look up toward the ceiling to avoid pulling on your neck.']],
    mistakes: [['بلند شدن کامل مثل درازنشست', 'Sitting all the way up like a full sit-up']]
  },
  66: { // Side Plank
    mistakes: [['قرار دادن آرنج جلوتر از شانه که به مفصل شانه فشار می‌آورد', 'Placing the elbow too far forward of the shoulder, causing joint strain']]
  },
  64: { // Elbow Plank
    tips: [['تصور کن آرنج‌ها را به سمت پنجهٔ پاها می‌کشی تا انقباض شکم دو برابر شود (پلانک RKC).', 'Imagine pulling your elbows toward your toes to double core activation (RKC plank).']]
  },
  41: { // Squat
    tips: [['سینه را بالا و کمر را صاف نگه دار.', 'Keep your chest proud and back flat.']]
  },
  49: { // Lunge
    tips: [['لانج به عقب فشار کمتری به زانو وارد می‌کند؛ اگر زانویت اذیت می‌شود آن را امتحان کن.', 'Reverse lunges are gentler on the knees if you experience joint discomfort.']],
    mistakes: [['ضربه زدن زانوی عقبی به زمین', 'Banging the back knee onto the floor']]
  },
  46: { // Bulgarian
    tips: [['حدود ۸۰ درصد وزن بدن روی پای جلو باشد؛ پای عقب فقط برای تعادل است.', 'Keep about 80% of your weight on the front leg; the back leg is purely for balance.']],
    mistakes: [['قرار دادن پای عقب دقیقاً پشت پای جلو (مثل راه رفتن روی طناب) که تعادل را از بین می‌برد', 'Placing the back foot directly behind the front foot (tightrope stance), causing balance loss']]
  },
  60: { // Wall sit
    tips: [['دست‌ها را روی ران‌ها نگذار؛ این کار فشار را از روی پاها برمی‌دارد.', 'Do not rest your hands on your thighs, as this takes load off your legs.']]
  }
};

const news = [
  /* ================= شکم (۱۲۹–۱۳۳) ================= */
  { cat: 'core', level: 1, name: ['فلاتر کیک', 'Flutter Kicks'],
    muscles: [['پایین شکم', 'Lower abs'], ['شکم', 'Abs'], ['فلکسور لگن', 'Hip flexors']],
    desc: ['حرکتی پویا برای تقویت زیرشکم و افزایش استقامت عضلات خم‌کنندهٔ ران و کور.', 'A dynamic exercise to strengthen the lower abs and build endurance in the hip flexors and core.'],
    rec: { sets: 3, amount: 30, unit: 'sec' },
    steps: [
      ['به پشت دراز بکش، دست‌ها را کنار بدن یا زیر باسن بگذار و پاهای صاف را چند سانتی‌متر از زمین بلند کن.', 'Lie on your back with hands at your sides or under your glutes, lifting straight legs a few inches off the floor.'],
      ['به‌صورت متناوب و سریع پاها را مثل شنا در آب بالا و پایین ببر.', 'Alternately kick your legs up and down in a quick, controlled fluttering motion.'],
      ['شکم را سفت نگه دار و نفس بکش.', 'Keep your core braced and breathe steadily.']],
    tips: [['اگر کمرت از زمین جدا می‌شود، پاها را کمی بالاتر ببر.', 'If your lower back arches off the floor, raise your legs slightly higher.']],
    mistakes: [
      ['قوس دادن کمر و ایجاد فشار روی ستون فقرات', 'Letting the lower back arch off the mat'],
      ['خم کردن بیش‌ازحد زانوها', 'Bending the knees excessively']] },

  { cat: 'core', level: 2, iso: true, name: ['نگه‌داشتن پا بالا با فاصلهٔ ۱۵ سانتی‌متر', '6-Inch Leg Hold'],
    muscles: [['پایین شکم', 'Lower abs'], ['شکم', 'Abs'], ['فلکسور لگن', 'Hip flexors']],
    desc: ['یکی از سخت‌ترین تمرینات ایزومتریک برای درگیر کردن همهٔ لایه‌های عمقی شکم و زیرشکم.', 'A tough isometric hold that engages all deep abdominal layers and the lower abs.'],
    rec: { sets: 3, amount: 30, unit: 'sec' },
    steps: [
      ['به پشت دراز بکش و کمر را کاملاً به زمین بچسبان (لگن به عقب متمایل).', 'Lie on your back and press your lower back firmly into the floor (posterior pelvic tilt).'],
      ['پاهای صاف و جفت را حدود ۱۵ سانتی‌متر از زمین بلند کن.', 'Lift your straight legs together about 6 inches (15 cm) off the ground.'],
      ['شانه‌ها را هم کمی از زمین جدا کن و در همین حالت ثابت بمان.', 'Slightly lift your shoulder blades off the floor and hold completely still.']],
    tips: [['این حرکت پایهٔ هالو بادی هولد در ژیمناستیک است؛ چسباندن کمر به زمین قانون اول است.', 'This is the foundation of the gymnastics hollow body hold; keeping the lower back glued to the floor is rule #1.']],
    mistakes: [
      ['جدا شدن گودی کمر از زمین', 'Allowing a gap to form between the lower back and the floor'],
      ['حبس کردن نفس', 'Holding your breath']] },

  { cat: 'core', level: 1, name: ['کرانچ مورب', 'Oblique Crunch'],
    muscles: [['پهلو', 'Obliques'], ['شکم', 'Abs']],
    desc: ['تمرکز ایزوله روی عضلات مورب شکم برای فرم‌دهی و تقویت پهلوها.', 'Isolated focus on the oblique muscles to strengthen and tone the sides of the waist.'],
    rec: { sets: 3, amount: 15, unit: 'rep', perSide: true },
    steps: [
      ['به پهلو دراز بکش، یا به پشت دراز بکش و زانوها را به یک سمت روی زمین بخوابان.', 'Lie on your back with knees bent and dropped to one side, or lie on your side.'],
      ['یک دست را کنار سر بگذار و با انقباض عضلات پهلو، بالاتنه را به سمت لگن بلند کن.', 'Place one hand behind your ear and crunch your torso upward, squeezing the side of your waist.'],
      ['به آرامی پایین برگرد و پس از اتمام ست، سمت دیگر را تمرین بده.', 'Lower with control and switch sides after completing the set.']],
    tips: [['روی فشردن عضلهٔ پهلو تمرکز کن، نه صرفاً بالا آوردن سر.', 'Focus on squeezing the side of your core rather than just lifting your head.']],
    mistakes: [['استفاده از دست روی زمین برای هل دادن بدن به بالا', 'Pushing off the floor with the supporting arm to cheat the movement']] },

  { cat: 'core', level: 2, name: ['بلند کردن پاها از دراز', 'Lying Leg Raises'],
    muscles: [['پایین شکم', 'Lower abs'], ['شکم', 'Abs'], ['فلکسور لگن', 'Hip flexors']],
    desc: ['حرکتی کلاسیک و قدرتمند برای ساخت قدرت در زیرشکم و پیش‌نیاز ال‌سیت و پای‌صاف آویزان.', 'A classic, powerful exercise for lower abdominal strength and a prerequisite for L-sits and toes-to-bar.'],
    rec: { sets: 3, amount: 12, unit: 'rep' },
    steps: [
      ['به پشت دراز بکش، پاها را کاملاً صاف و جفت کن و دست‌ها را کنار بدن بگذار.', 'Lie flat on your back with legs straight together and hands at your sides.'],
      ['بدون خم کردن زانو، پاها را تا زاویهٔ ۹۰ درجه (عمود بر زمین) بالا بیاور.', 'Keeping knees locked, raise your legs up to a 90-degree vertical angle.'],
      ['بسیار آهسته پاها را تا نزدیک زمین پایین ببر اما زمین را لمس نکن.', 'Lower your legs slowly until just above the floor without touching it.']],
    tips: [['پایین آوردن پاها مهم‌ترین بخش حرکت است؛ اجازه نده پاها سقوط کنند.', 'The lowering phase is the most important part; resist gravity all the way down.']],
    mistakes: [['قوس برداشتن کمر هنگام پایین رفتن پاها', 'Allowing the lower back to arch off the ground as the legs descend']] },

  { cat: 'core', level: 1, name: ['جمع کردن زانو در حالت نشسته', 'Seated Knee Tucks'],
    muscles: [['شکم', 'Abs'], ['پایین شکم', 'Lower abs'], ['فلکسور لگن', 'Hip flexors']],
    desc: ['جمع و باز کردن هم‌زمان زانوها و بالاتنه در حالت نشسته برای درگیری شدید شکم.', 'Simultaneously tucking and extending the knees and torso while seated for intense core engagement.'],
    rec: { sets: 3, amount: 15, unit: 'rep' },
    steps: [
      ['روی زمین بنشین، دست‌ها را کمی پشت لگن روی زمین بگذار و پاها را از زمین بلند کن.', 'Sit on the floor, place hands slightly behind your hips for balance, and lift your feet off the ground.'],
      ['هم‌زمان بالاتنه را کمی به عقب ببر و پاها را صاف کن.', 'Lean your torso back slightly while extending your legs straight out.'],
      ['دوباره سینه و زانوها را به سمت هم جمع کن.', 'Crunch your chest and knees back together simultaneously.']],
    tips: [['برای سخت‌تر کردن حرکت، دست‌ها را از زمین جدا کن و در دو طرف نگه دار.', 'To increase the challenge, lift your hands off the floor and hold them out to your sides.']],
    mistakes: [['قوز کردن شدید کمر و تکیهٔ زیاد روی دست‌ها', 'Slouching excessively or relying too heavily on the hands']] },

  /* ================= پایین‌تنه (۱۳۴–۱۳۷) ================= */
  { cat: 'legs', level: 1, name: ['اسکوات اسلوموشن', 'Slow-Motion Squat'],
    muscles: [['چهارسر', 'Quads'], ['باسن', 'Glutes'], ['همسترینگ', 'Hamstrings']],
    desc: ['اجرای اسکوات با سرعت بسیار آهسته برای افزایش زمان تحت تنش و تقویت کنترل مفاصل زانو و لگن.', 'Performing squats at a very slow tempo to increase time under tension and build knee/hip control.'],
    rec: { sets: 3, amount: 8, unit: 'rep' },
    steps: [
      ['با شمارش ۴ ثانیه بسیار آهسته به حالت اسکوات پایین برو.', 'Lower into a squat over a slow 4-second count.'],
      ['در پایین‌ترین نقطه ۲ ثانیهٔ کامل مکث کن (بدون استراحت روی ساق پا).', 'Pause for 2 full seconds at the bottom while maintaining muscular tension.'],
      ['با شمارش ۴ ثانیه به آرامی به بالا برگرد.', 'Stand back up slowly over another 4-second count.']],
    tips: [['در تمام ثانیه‌های حرکت و حین مکث، انقباض چهارسر و باسن را حفظ کن.', 'Maintain active tension in your quads and glutes during the bottom pause.']],
    mistakes: [['شل کردن عضلات در پایین حرکت', 'Relaxing the muscles at the bottom of the squat']] },

  { cat: 'legs', level: 3, name: ['اسکوات پرشی از حالت زانو', 'Kneeling Squat Jump'],
    muscles: [['باسن', 'Glutes'], ['چهارسر', 'Quads'], ['کور', 'Core'], ['همسترینگ', 'Hamstrings']],
    desc: ['حرکتی بسیار انفجاری برای بهبود شتاب بازشدن لگن و هماهنگی عصبی-عضلانی.', 'A highly explosive drill to develop rapid hip extension power and neuromuscular coordination.'],
    rec: { sets: 3, amount: 6, unit: 'rep' },
    steps: [
      ['روی یک زیرانداز نرم دوزانو بنشین (باسن به سمت پاشنه‌ها).', 'Kneel on a soft mat with your glutes resting back toward your heels.'],
      ['با تاب دادن دست‌ها و باز کردن انفجاری لگن به هوا بپر و روی کف پاها در حالت اسکوات فرود بیا.', 'Swing your arms forward and explosively extend your hips to jump onto your feet in a squat stance.'],
      ['بایست و سپس با احتیاط دوباره روی زانوها برگرد.', 'Stand up fully, then carefully step back down to your knees.']],
    tips: [['حتماً روی سطح نرم (تشک یا چمن) اجرا کن تا به زانوها آسیبی نرسد.', 'Always perform this on a padded mat or grass to protect your knees.']],
    mistakes: [['اجرا روی سطح سخت یا سرامیک', 'Performing the exercise on hard concrete or tile floors']] },

  { cat: 'legs', level: 1, name: ['استپ‌آپ', 'Step-ups'],
    muscles: [['چهارسر', 'Quads'], ['باسن', 'Glutes'], ['همسترینگ', 'Hamstrings'], ['ساق', 'Calves']],
    desc: ['حرکتی کاربردی و کم‌فشار برای مفاصل جهت تقویت تک‌پا، تعادل و استقامت قلبی-عروقی.', 'A functional, joint-friendly movement for single-leg strength, balance, and cardiovascular fitness.'],
    rec: { sets: 3, amount: 12, unit: 'rep', perSide: true },
    steps: [
      ['روبه‌روی یک پله، نیمکت یا جعبهٔ محکم بایست و کف پای راست را کامل روی آن بگذار.', 'Stand facing a sturdy box, bench, or step and place your entire right foot on top.'],
      ['با فشار پاشنهٔ پای راست بدن را بالا بکش تا روی پله بایستی.', 'Drive through your right heel to lift your body up onto the box.'],
      ['با کنترل پایین بیا و حرکت را تکرار کن.', 'Step down under control and repeat.']],
    tips: [['سعی کن با پای پایینی هل ندهی و تمام کار بالا کشیدن را پای بالایی انجام دهد.', 'Avoid pushing off with the bottom foot; let the top leg do all the lifting work.']],
    mistakes: [['گذاشتن فقط پنجهٔ پا روی پله (کل کف پا باید روی پله باشد)', 'Placing only the toes on the box instead of the entire foot']] },

  { cat: 'legs', level: 3, name: ['لانج پرشی + اسکوات پرشی', 'Jumping Lunge + Jump Squat Combo'],
    muscles: [['چهارسر', 'Quads'], ['باسن', 'Glutes'], ['همسترینگ', 'Hamstrings'], ['ساق', 'Calves'], ['کور', 'Core']],
    desc: ['ترکیبی بسیار سنگین برای به چالش کشیدن نهایت استقامت، توان و نفس ورزشکار.', 'An intense plyometric combination that pushes leg endurance, power, and conditioning to the limit.'],
    rec: { sets: 3, amount: 6, unit: 'rep' },
    steps: [
      ['یک لانج پرشی با پای راست جلو بزن.', 'Perform one jumping lunge with the right leg forward.'],
      ['در هوا پا را عوض کن و یک لانج پرشی با پای چپ جلو بزن.', 'Switch legs in mid-air and perform one jumping lunge with the left leg forward.'],
      ['با پرش بعدی پاها را به عرض شانه باز کن و بلافاصله یک اسکوات پرشی بزن.', 'Jump directly into a shoulder-width stance and execute one jump squat.']],
    tips: [['ریتم تنفس را حفظ کن و در هر فرود زانوها را نرم خم کن.', 'Maintain a steady breathing rhythm and keep every landing soft on the knees.']],
    mistakes: [['افت کیفیت فرم در اواخر ست و جمع شدن زانوها به داخل به دلیل خستگی', 'Letting form break down and knees cave in when fatigued']] }
];

module.exports = { fills, merges, news };
