/* دادهٔ حرکت‌های جدید و تکمیل توضیحات — بخش ۱: هل دادن و کشیدن
   هر متن به‌صورت [فارسی، English] است. */
const fills = {
  /* ---- هل دادن ---- */
  5: { // Wide Push-up
    steps: [
      ['دست‌ها را حدود ۱٫۵ برابر عرض شانه روی زمین قرار بده.', 'Place your hands about 1.5 times shoulder-width apart on the floor.'],
      ['بدن را صاف و منقبض نگه دار و سینه را تا نزدیک زمین پایین بیاور.', 'Keep your body straight and tight, lowering your chest close to the ground.'],
      ['با تمرکز بر انقباض عضلات سینه، بدن را به بالا هل بده.', 'Push back up while focusing on squeezing your chest muscles.']],
    tips: [['انگشتان دست را کمی به سمت بیرون بچرخان تا فشار از روی مچ برداشته شود.', 'Slightly turn your fingers outward to relieve stress on your wrists.']],
    mistakes: [
      ['باز کردن بیش‌ازحد دست‌ها که به مفصل شانه آسیب می‌زند', 'Placing hands excessively wide, risking shoulder injury'],
      ['نصفه انجام دادن دامنهٔ حرکتی', 'Performing half-reps with limited range of motion']]
  },
  8: { // Decline Push-up
    steps: [
      ['پنجه‌های پا را روی یک صندلی یا پله بگذار و دست‌ها را به عرض شانه روی زمین قرار بده.', 'Place your toes on a chair or box and your hands on the floor shoulder-width apart.'],
      ['شکم را سفت نگه دار تا کمر قوس برندارد.', "Brace your core tightly so your lower back doesn't arch."],
      ['سینه را تا نزدیک زمین پایین بیاور و با قدرت بالا برگرد.', 'Lower your chest close to the floor and push forcefully back up.']],
    tips: [['ارتفاع سطح زیر پا را به‌تدریج زیاد کن تا به شنای پایک و هندپش‌آپ نزدیک شوی.', 'Gradually increase foot elevation to progress toward pike and handstand push-ups.']],
    mistakes: [
      ['گود کردن کمر به دلیل ضعف عضلات شکم', 'Sagging the lower back due to weak core engagement'],
      ['پایین انداختن سر', 'Dropping the head toward the floor']]
  },
  12: { // Archer Push-up
    steps: [
      ['دست‌ها را بسیار بازتر از عرض شانه روی زمین بگذار.', 'Place your hands much wider than shoulder-width apart on the floor.'],
      ['یک دست را صاف نگه دار و با خم کردن دست دیگر، سینه را به سمت همان دست پایین ببر.', 'Keep one arm straight while bending the other to lower your chest toward that hand.'],
      ['با فشار دست خم‌شده به مرکز برگرد و حرکت را برای سمت دیگر تکرار کن.', 'Push back to the center and repeat on the opposite side.']],
    tips: [['دست کمکی باید کاملاً صاف بماند و فقط برای تعادل روی زمین باشد.', 'Keep the assisting arm completely straight, using it only for balance.']],
    mistakes: [
      ['چرخاندن لگن به سمت دست خم‌شده', 'Twisting the hips toward the working arm'],
      ['خم کردن دست کمکی', 'Bending the straight assisting arm']]
  },
  /* ---- کشیدن ---- */
  23: { // Close Grip Pull-up
    steps: [
      ['میله را طوری بگیر که فاصلهٔ دو دست حدود ۱۰ تا ۱۵ سانتی‌متر باشد (کف دست رو به جلو).', 'Grip the bar with hands about 4 to 6 inches apart (palms facing forward).'],
      ['بدن را بالا بکش تا سینه به دست‌ها نزدیک شود.', 'Pull your body upward until your upper chest nears your hands.'],
      ['با کنترل کامل پایین بیا تا آرنج‌ها صاف شوند.', 'Lower back down with control until arms are fully straight.']],
    tips: [['آرنج‌ها را رو به جلو و پایین هدایت کن تا فشار از روی مچ دست برداشته شود.', 'Keep elbows pointing forward and down to minimize wrist strain.']],
    mistakes: [['چسباندن کامل دست‌ها به هم که باعث پیچش غیرطبیعی مچ می‌شود', 'Placing hands completely touching, which can cause awkward wrist torque']]
  },
  22: { // Wide Grip Pull-up
    steps: [
      ['میله را حدود ۱٫۵ برابر عرض شانه با کف دست رو به جلو بگیر.', 'Grab the bar about 1.5 times shoulder-width apart with an overhand grip.'],
      ['سینه را به سمت میله بالا بکش و آرنج‌ها را به سمت پهلوها پایین بیاور.', 'Pull your chest toward the bar while driving your elbows down toward your sides.'],
      ['با کنترل پایین بیا تا دست‌ها صاف شوند.', 'Lower back down with control to full arm extension.']],
    tips: [['به‌جای بالا بردن چانه، روی نزدیک کردن بالاسینه به میله تمرکز کن.', 'Focus on bringing your upper chest toward the bar rather than reaching with your chin.']],
    mistakes: [['گرفتن بیش‌ازحد باز میله که دامنهٔ حرکتی را کوتاه می‌کند و به شانه فشار می‌آورد', 'Gripping excessively wide, which restricts range of motion and stresses the shoulders']]
  },
  26: { // Commando Pull-up
    steps: [
      ['زیر میله طوری بایست که میله در راستای بدن باشد و با هر دو دست (یکی جلوی دیگری) میله را بگیر.', 'Stand sideways under the bar and grip it with one hand in front of the other.'],
      ['خودت را بالا بکش و سر را به سمت راست میله ببر تا شانه به میله نزدیک شود.', 'Pull yourself up, bringing your head to the right side of the bar until your shoulder nears it.'],
      ['پایین بیا و در تکرار بعدی سر را به سمت چپ میله ببر.', 'Lower down and pull your head to the left side of the bar on the next rep.']],
    tips: [['در ست بعدی جای دست جلو و عقب را عوض کن تا تعادل عضلانی حفظ شود.', 'Switch which hand is in front on the next set to ensure balanced muscle development.']],
    mistakes: [['ضربه زدن سر به میله به دلیل عجله', 'Rushing the pull and bumping your head against the bar']]
  }
};

const merges = {
  1: { // Standard Push-up
    tips: [
      ['عضلات شکم و باسن را در طول حرکت منقبض نگه دار تا کمر گود نشود.', 'Keep core and glutes engaged throughout to prevent lower back sagging.'],
      ['گردن را در راستای ستون فقرات نگه دار و به زمین نگاه کن.', 'Keep your neck neutral in line with your spine, looking at the floor.']],
    mistakes: [['پایین انداختن سر به سمت زمین', 'Dropping the head toward the floor']]
  },
  2: { // Knee Push-up
    tips: [['از یک زیرانداز نرم زیر زانوها استفاده کن.', 'Use a soft mat under your knees for comfort.']],
    mistakes: [['حرکت سریع و بدون کنترل', 'Moving too fast without control']]
  },
  4: { // Diamond
    mistakes: [['قرار دادن دست‌ها زیر صورت به‌جای زیر سینه', 'Placing hands under the face instead of the chest']]
  },
  9: { // Pike
    tips: [
      ['سر باید جلوتر از خط دست‌ها فرود بیاید تا بین سر و دو دست یک مثلث (سه‌پایه) ساخته شود.', 'Your head should move forward of your hands, forming a tripod triangle at the bottom.'],
      ['پاها را تا حدی که انعطاف همسترینگ اجازه می‌دهد صاف نگه دار.', 'Keep your legs as straight as your hamstring flexibility allows.']],
    mistakes: [
      ['پایین آوردن سر دقیقاً بین دو دست که به گردن فشار می‌آورد', 'Lowering the head directly between the hands (strains the neck)'],
      ['باز کردن آرنج‌ها به اطراف به‌جای چسباندن آن‌ها', 'Flaring elbows outward instead of keeping them tucked']]
  },
  15: { // Bench Dips
    tips: [['کمر را نزدیک لبهٔ صندلی پایین ببر؛ دور شدن از صندلی به شانه فشار می‌آورد.', 'Keep your lower back close to the chair edge; drifting forward strains the shoulders.']]
  },
  21: { // Pull-up
    tips: [
      ['تصور کن آرنج‌هایت را به سمت زمین و جیب‌های شلوارت می‌کشی.', 'Visualize driving your elbows down toward the floor and your pockets.'],
      ['پاها را صاف و کمی جلوتر از بدن نگه دار (حالت هالو بادی).', 'Keep legs straight and slightly in front of your torso (hollow body position).']]
  },
  25: { // Chin-up
    tips: [['در بالاترین نقطه سینه را به میله نزدیک کن و شانه‌ها را به جلو گرد نکن.', 'Bring your chest toward the bar at the top without rolling your shoulders forward.']],
    mistakes: [['گرد کردن شانه‌ها به جلو در بالای حرکت', 'Rounding shoulders forward at the top of the pull']]
  },
  39: { // Scapular pull
    tips: [['آرنج‌ها باید قفل بمانند؛ تمام حرکت فقط از کتف‌ها انجام می‌شود و در بالا ۱ ثانیه مکث کن.', 'Elbows must remain locked; all movement comes from the shoulder blades. Pause for 1 second at the top.']]
  },
  35: { // Inverted Row
    tips: [['برای ساده‌تر کردن حرکت زانوها را خم کن؛ برای سخت‌تر کردن پاها را روی یک صندلی بگذار.', 'Bend your knees to make it easier; elevate your feet on a chair to make it harder.']],
    mistakes: [['استفاده از میز سبک و ناپایدار که ممکن است واژگون شود', 'Using a lightweight or unstable table that could tip over']]
  }
};

const news = [
  /* ================= هل دادن (۱۰۱–۱۱۲) ================= */
  { cat: 'push', level: 1, name: ['شنای منفی', 'Negative Push-up'],
    muscles: [['سینه', 'Chest'], ['سرشانه', 'Shoulders'], ['پشت‌بازو', 'Triceps'], ['کور', 'Core']],
    desc: ['تمرکز بر فاز منفی (پایین رفتن آهسته) برای ساخت قدرت عصبی-عضلانی جهت اجرای شنای کامل.', 'Focuses on the eccentric (slow lowering) phase to build neuromuscular strength for full push-ups.'],
    rec: { sets: 3, amount: 6, unit: 'rep' },
    steps: [
      ['در حالت بالای شنای کامل قرار بگیر.', 'Start in the top plank position of a standard push-up.'],
      ['بسیار آهسته و با شمارش ۴ تا ۵ ثانیه، بدن را به سمت زمین پایین بیاور.', 'Lower your body very slowly toward the floor for a count of 4 to 5 seconds.'],
      ['وقتی سینه به زمین رسید، زانوها را زمین بگذار و به حالت شروع برگرد.', 'Once your chest touches the floor, drop to your knees to reset at the top.']],
    tips: [['در تمام طول پایین رفتن سرعت را یکنواخت نگه دار و ناگهان رها نکن.', "Maintain a steady tempo all the way down; don't drop rapidly near the bottom."]],
    mistakes: [['سریع پایین رفتن و از دست دادن کنترل در انتهای حرکت', 'Descending too quickly and losing tension at the bottom']] },

  { cat: 'push', level: 2, name: ['شنای اسلوموشن', 'Slow-Motion Push-up'],
    muscles: [['سینه', 'Chest'], ['سرشانه', 'Shoulders'], ['پشت‌بازو', 'Triceps'], ['کور', 'Core']],
    desc: ['اجرای کل حرکت با سرعت بسیار آهسته برای افزایش زمان تحت تنش (TUT) و عضله‌سازی بیشتر.', 'Executing the entire rep at a very slow tempo to maximize Time Under Tension (TUT) and hypertrophy.'],
    rec: { sets: 3, amount: 6, unit: 'rep' },
    steps: [
      ['در حالت شنا قرار بگیر و با شمارش ۴ ثانیه به آرامی پایین برو.', 'Start in a push-up position and take 4 full seconds to lower down.'],
      ['در پایین‌ترین نقطه (نزدیک زمین) ۲ ثانیه مکث کن، بدون اینکه زمین را لمس کنی.', 'Pause for 2 seconds at the bottom just above the floor without resting.'],
      ['با شمارش ۴ ثانیه به آرامی به بالا برگرد.', 'Take 4 full seconds to push smoothly back up to the top.']],
    tips: [['نفس خود را حبس نکن؛ هنگام پایین رفتن دم و هنگام بالا آمدن بازدم داشته باش.', 'Do not hold your breath; inhale steadily on the way down and exhale on the way up.']],
    mistakes: [
      ['استراحت دادن سینه روی زمین در نقطهٔ پایین', 'Resting the chest on the floor at the bottom'],
      ['عجله کردن در بخش سخت حرکت', 'Rushing through the sticking point']] },

  { cat: 'push', level: 2, name: ['شنای پشت‌بازو', 'Tricep Push-up'],
    muscles: [['پشت‌بازو', 'Triceps'], ['سرشانه', 'Shoulders'], ['سینه', 'Chest']],
    desc: ['شنا با دست‌هایی به عرض شانه و آرنج‌های چسبیده به پهلو برای هدف قرار دادن مستقیم پشت‌بازو.', 'Push-ups with shoulder-width hands and elbows tucked tight to the ribs to directly target the triceps.'],
    rec: { sets: 3, amount: 10, unit: 'rep' },
    steps: [
      ['دست‌ها را دقیقاً زیر شانه‌ها بگذار به‌طوری که انگشتان رو به جلو باشند.', 'Place hands directly beneath your shoulders with fingers pointing straight forward.'],
      ['آرنج‌ها را به سمت عقب خم کن و کاملاً به پهلوها بچسبان.', 'Bend elbows straight back, keeping them brushed tightly against your sides.'],
      ['سینه را پایین بیاور و با تمرکز روی پشت‌بازو به بالا برگرد.', 'Lower your chest and press back up focusing on triceps extension.']],
    tips: [['اجازه نده آرنج‌ها حتی کمی به بیرون متمایل شوند.', 'Do not let your elbows flare out even slightly during the movement.']],
    mistakes: [['باز شدن آرنج‌ها به طرفین که فشار را به سینه منتقل می‌کند', 'Flaring elbows outward, which shifts load back onto the chest']] },

  { cat: 'push', level: 1, name: ['شنای پشت‌بازو روی زانو', 'Knee Tricep Push-up'],
    muscles: [['پشت‌بازو', 'Triceps'], ['سرشانه', 'Shoulders'], ['سینه', 'Chest']],
    desc: ['نسخهٔ سبک‌تر شنای پشت‌بازو برای یادگیری فرم صحیح چسباندن آرنج‌ها و تقویت اولیهٔ سه‌سر بازو.', 'An easier variation of tricep push-ups to master elbow tucking mechanics and build initial tricep strength.'],
    rec: { sets: 3, amount: 12, unit: 'rep' },
    steps: [
      ['زانوها را روی زمین بگذار و دست‌ها را دقیقاً زیر شانه‌ها قرار بده.', 'Kneel on the floor and place your hands directly under your shoulders.'],
      ['آرنج‌ها را به سمت عقب و چسبیده به پهلو خم کن تا سینه به زمین نزدیک شود.', 'Bend your elbows straight back alongside your ribs until your chest nears the ground.'],
      ['با فشار کف دست‌ها و انقباض پشت‌بازو بالا برگرد.', 'Press through your palms and contract your triceps to return to the start.']],
    tips: [['شانه‌ها را از گوش‌ها دور نگه دار و گردن را منقبض نکن.', 'Keep shoulders depressed away from your ears; avoid shrugging.']],
    mistakes: [['عقب بردن باسن هنگام پایین رفتن', 'Shifting hips backward while lowering the torso']] },

  { cat: 'push', level: 3, name: ['شنای پشت‌بازو اسلوموشن', 'Slow-Motion Tricep Push-up'],
    muscles: [['پشت‌بازو', 'Triceps'], ['سرشانه', 'Shoulders'], ['کور', 'Core']],
    desc: ['ترکیبی بسیار چالش‌برانگیز از کنترل سرعت و ایزوله‌سازی دقیق عضلات پشت‌بازو.', 'A highly challenging combination of tempo control and strict tricep isolation.'],
    rec: { sets: 3, amount: 6, unit: 'rep' },
    steps: [
      ['در حالت شنای دست‌جمع (آرنج‌های چسبیده) قرار بگیر.', 'Assume a close-grip tricep push-up stance.'],
      ['با شمارش ۴ ثانیه آهسته پایین برو، در حالی که آرنج‌ها به پهلو فشار می‌آورند.', 'Lower slowly for 4 seconds while keeping elbows glued to your sides.'],
      ['۱ ثانیه در پایین مکث کن و با شمارش ۴ ثانیه به بالا برگرد.', 'Pause for 1 second at the bottom and press back up for 4 seconds.']],
    tips: [['تمام بدن را مثل یک تخته سفت نگه دار تا انرژی هدر نرود.', 'Keep your entire body rigid like a plank to prevent energy leaks.']],
    mistakes: [['از دست دادن فرم آرنج‌ها در ثانیه‌های پایانی حرکت', 'Losing elbow tuck alignment during the hardest part of the rep']] },

  { cat: 'push', level: 3, name: ['شنا با وزنه', 'Weighted Push-up'],
    muscles: [['سینه', 'Chest'], ['سرشانه', 'Shoulders'], ['پشت‌بازو', 'Triceps'], ['شکم', 'Abs']],
    desc: ['اضافه کردن مقاومت خارجی (کوله‌پشتی یا جلیقهٔ وزنه) برای افزایش قدرت و حجم عضلانی بالاتنه.', 'Adding external load (weighted backpack or vest) to build maximal pushing strength and upper body hypertrophy.'],
    rec: { sets: 4, amount: 8, unit: 'rep' },
    steps: [
      ['یک کوله‌پشتی سنگین یا جلیقهٔ وزنه بپوش و بندهایش را محکم کن تا تکان نخورد.', "Put on a weighted vest or secure a heavy backpack tightly so it doesn't shift."],
      ['در حالت شنای استاندارد قرار بگیر و عضلات شکم را بسیار سفت کن.', 'Get into a standard push-up position and brace your core hard.'],
      ['با کنترل کامل پایین برو و با قدرت به بالا برگرد.', 'Lower with full control and push explosively back up.']],
    tips: [['وزنه را روی قسمت بالایی کمر (بین کتف‌ها) تنظیم کن، نه روی گودی کمر.', 'Position the weight over your upper back (shoulder blades), never on your lower back.']],
    mistakes: [
      ['قرار دادن وزنه روی کمر که فشار شدیدی به مهره‌ها می‌آورد', 'Placing weight on the lower back, causing spinal strain'],
      ['شل کردن شکم زیر بار', 'Relaxing the core under load']] },

  { cat: 'push', level: 1, iso: true, name: ['نگه‌داشتن شنای پایک در بالا', 'Pike Push-up Top Hold'],
    muscles: [['سرشانه', 'Shoulders'], ['ذوزنقه', 'Traps'], ['کور', 'Core'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['تمرین ایزومتریک برای عادت دادن مچ‌ها، سرشانه‌ها و ذهن به تحمل وزن بدن در زاویهٔ عمودی.', 'An isometric hold to condition wrists, shoulders, and proprioception to bear weight in a vertical angle.'],
    rec: { sets: 3, amount: 30, unit: 'sec' },
    steps: [
      ['دست‌ها را روی زمین بگذار و باسن را تا جای ممکن بالا ببر (شکل V برعکس).', 'Place hands on the floor and pike your hips as high as possible (inverted V).'],
      ['آرنج‌ها را کاملاً قفل کن و زمین را با شانه‌ها هل بده (شانهٔ فعال).', 'Lock out your elbows and actively push the floor away through your shoulders.'],
      ['در همین وضعیت برای زمان مشخص نفس بکش و تعادل را حفظ کن.', 'Hold this position for the target time while breathing steadily.']],
    tips: [['با انگشتان دست زمین را بگیر تا کنترل تعادل و ثبات مچ بهتر شود.', 'Grip the floor with your fingertips to improve balance and wrist stability.']],
    mistakes: [['خم کردن آرنج‌ها یا رها کردن شانه‌ها به سمت گوش', 'Bending the elbows or letting shoulders collapse toward the ears']] },

  { cat: 'push', level: 2, iso: true, name: ['نگه‌داشتن هندستند کنار دیوار', 'Wall Handstand Hold'],
    muscles: [['سرشانه', 'Shoulders'], ['ذوزنقه', 'Traps'], ['پشت‌بازو', 'Triceps'], ['کور', 'Core'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['تمرین اصلی برای تسلط بر ایستادن روی دست و تقویت شدید سرشانه‌ها و عضلات عمقی تنه.', 'The essential drill for mastering handstands while building immense shoulder and deep core endurance.'],
    rec: { sets: 3, amount: 20, unit: 'sec' },
    steps: [
      ['دست‌ها را به عرض شانه و با کمی فاصله از دیوار روی زمین بگذار.', 'Place hands shoulder-width apart slightly away from a wall.'],
      ['با یک ضربهٔ ملایم پاها را بالا ببر تا پاشنه‌ها به دیوار تکیه کنند.', 'Gently kick up so your heels rest lightly against the wall.'],
      ['شکم و باسن را منقبض کن، زمین را با دست‌ها هل بده و بدن را صاف نگه دار.', 'Squeeze core and glutes, push the floor away, and hold a straight line.']],
    tips: [
      ['به نقطهٔ بین دو دستت نگاه کن و گردن را بیش‌ازحد به عقب خم نکن.', 'Gaze at a spot between your hands without over-extending your neck.'],
      ['قبل از اجرا حتماً مچ دست‌ها را خوب گرم کن.', 'Thoroughly warm up your wrists before attempting handstands.']],
    mistakes: [
      ['قوس دادن زیاد به کمر (حالت موزی)', 'Excessive lower back arch (banana back)'],
      ['خم کردن آرنج‌ها', 'Bending the arms']] },

  { cat: 'push', level: 3, name: ['شنای منفی + پرشی', 'Negative + Plyo Push-up'],
    muscles: [['سینه', 'Chest'], ['سرشانه', 'Shoulders'], ['پشت‌بازو', 'Triceps']],
    desc: ['ترکیب کنترل عضلانی در پایین رفتن و قدرت انفجاری در بالا آمدن برای افزایش سرعت و توان بالاتنه.', 'Combines eccentric control on the descent with explosive power on the ascent to boost upper-body speed and power.'],
    rec: { sets: 3, amount: 6, unit: 'rep' },
    steps: [
      ['با کنترل و سرعت آهسته (۳ ثانیه) سینه را به زمین نزدیک کن.', 'Lower your chest toward the floor slowly with control (3 seconds).'],
      ['به محض رسیدن به پایین، با تمام توان دست‌ها را به زمین فشار بده تا کف دست‌ها از زمین جدا شوند.', 'At the bottom, explode upward forcefully so your hands leave the ground.'],
      ['با آرنج‌های کمی خم و نرم روی زمین فرود بیا و بلافاصله تکرار بعدی را شروع کن.', 'Land softly with slightly bent elbows to absorb impact and flow into the next rep.']],
    tips: [['فرود نرم برای محافظت از مچ دست و مفصل آرنج ضروری است.', 'Landing softly with unlocked elbows is crucial to protect wrists and joints.']],
    mistakes: [['فرود آمدن با آرنج‌های کاملاً قفل و خشک', 'Landing with stiff, locked-out elbows']] },

  { cat: 'push', level: 3, name: ['شنای پایک + لمس شانه', 'Pike Push-up + Shoulder Tap'],
    muscles: [['سرشانه', 'Shoulders'], ['پشت‌بازو', 'Triceps'], ['کور', 'Core'], ['پشت شانه', 'Rear delts']],
    desc: ['ترکیب تقویت سرشانه با چالش ضدچرخش و تعادل تک‌دست در زاویهٔ عمودی.', 'Combines overhead shoulder pressing with anti-rotation stability on one arm in an inverted angle.'],
    rec: { sets: 3, amount: 8, unit: 'rep' },
    steps: [
      ['یک تکرار کامل شنای پایک اجرا کن.', 'Perform one full Pike Push-up repetition.'],
      ['در بالاترین نقطه وزن را روی یک دست بینداز و با دست دیگر شانهٔ مخالف را لمس کن.', 'At the top, shift weight onto one hand and tap the opposite shoulder with the other hand.'],
      ['دست را زمین بگذار، دوباره شنای پایک بزن و این بار شانهٔ دیگر را لمس کن.', 'Return the hand to the floor, do another Pike Push-up, and tap the other shoulder.']],
    tips: [['هنگام لمس شانه، بدن و لگن نباید به طرفین تاب بخورند.', 'Prevent your hips and torso from swaying side-to-side during the shoulder tap.']],
    mistakes: [['عجله در لمس شانه و از دست دادن تعادل', 'Rushing the shoulder tap and losing balance']] },

  { cat: 'push', level: 2, name: ['شنای معمولی + دست‌جمع', 'Standard + Close-Grip Push-up'],
    muscles: [['سینه', 'Chest'], ['پشت‌بازو', 'Triceps'], ['سرشانه', 'Shoulders']],
    desc: ['ترکیب دو عرض دست در یک تکرار برای پمپاژ شدید خون در عضلات سینه و پشت‌بازو.', 'Combines two grip widths in one seamless rep to create intense muscular pump in the chest and triceps.'],
    rec: { sets: 3, amount: 10, unit: 'rep' },
    steps: [
      ['یک شنای معمولی با دست‌های کمی بازتر از عرض شانه بزن.', 'Perform one standard push-up with hands slightly wider than shoulder-width.'],
      ['در بالا دست‌ها را به هم نزدیک کن و یک شنای دست‌جمع (پشت‌بازو) بزن.', 'At the top, step your hands inward and perform one close-grip push-up.'],
      ['دوباره دست‌ها را به عرض اول برگردان و ادامه بده.', 'Step hands back out to the standard width and repeat.']],
    tips: [['هنگام جابه‌جا کردن دست‌ها شکم را سفت نگه دار تا لگن نچرخد.', "Keep your core braced while transitioning hand positions so your hips don't twist."]],
    mistakes: [['نصفه زدن هر کدام از شناها به دلیل خستگی', 'Cutting the range of motion short as fatigue sets in']] },

  { cat: 'push', level: 3, name: ['شنای الماسی شیب‌دار به پایین', 'Decline Diamond Push-up'],
    muscles: [['پشت‌بازو', 'Triceps'], ['بالای سینه', 'Upper chest'], ['سرشانه', 'Shoulders']],
    desc: ['ترکیبی سنگین که هم‌زمان بالاسینه، سرشانه و پشت‌بازو را زیر بیشترین فشار می‌گذارد.', 'A heavy variation that simultaneously places maximum load on the upper chest, front delts, and triceps.'],
    rec: { sets: 3, amount: 6, unit: 'rep' },
    steps: [
      ['پاها را روی یک نیمکت یا پله بگذار و دست‌ها را به شکل الماس زیر سینه قرار بده.', 'Place your feet on an elevated bench and form a diamond shape with your hands under your chest.'],
      ['آرنج‌ها را نزدیک بدن نگه دار و سینه را به سمت دست‌ها پایین بیاور.', 'Keep elbows tucked and lower your chest toward your hands.'],
      ['با قدرت به حالت شروع برگرد.', 'Press powerfully back up to the starting position.']],
    tips: [['مطمئن شو شنای الماسی و شنای شیب‌دار به پایین را جداگانه به‌خوبی بلدی.', 'Ensure you have mastered both diamond push-ups and decline push-ups separately first.']],
    mistakes: [['فشار بیش‌ازحد به مچ دست یا گود افتادن کمر', 'Overloading the wrists or letting the lower back sag']] },

  /* ================= کشیدن (۱۱۳–۱۲۸) ================= */
  { cat: 'pull', level: 1, name: ['بارفیکس منفی', 'Negative Pull-up'],
    muscles: [['زیربغل (لت)', 'Lats'], ['جلوبازو', 'Biceps'], ['مچ و ساعد', 'Wrists & forearms'], ['پشت میانی', 'Mid back']],
    desc: ['مؤثرترین تمرین برای کسانی که هنوز نمی‌توانند حتی یک بارفیکس کامل بزنند.', 'The single most effective progression drill for those working toward their very first strict pull-up.'],
    rec: { sets: 3, amount: 5, unit: 'rep' },
    steps: [
      ['با کمک یک جعبه یا پرش ملایم، چانه را بالای میلهٔ بارفیکس قرار بده.', 'Use a box or a gentle jump to start with your chin above the bar.'],
      ['عضلات را سفت کن و طی ۴ تا ۵ ثانیه تا جای ممکن آهسته پایین بیا.', 'Engage your back and arms tightly, lowering yourself as slowly as possible (4-5 seconds).'],
      ['وقتی دست‌ها کاملاً صاف شدند، پا را زمین بگذار و تکرار بعدی را شروع کن.', 'Once arms are straight, step down and reset for the next rep.']],
    tips: [['سخت‌ترین بخش میانهٔ مسیر است؛ سعی کن در این نقطه سرعتت زیاد نشود.', 'The mid-range is the hardest part; fight gravity to prevent dropping fast through the middle.']],
    mistakes: [['رها کردن ناگهانی بدن در نیمه‌راه', 'Dropping rapidly halfway down instead of controlling the entire descent']] },

  { cat: 'pull', level: 1, name: ['چین‌آپ منفی', 'Negative Chin-up'],
    muscles: [['جلوبازو', 'Biceps'], ['زیربغل (لت)', 'Lats'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['فاز منفی چین‌آپ (دست‌عکس)؛ بهترین نقطهٔ شروع برای ساخت قدرت کششی اولیه.', 'Eccentric phase of the underhand chin-up; the ideal entry point for building foundational pulling strength.'],
    rec: { sets: 3, amount: 5, unit: 'rep' },
    steps: [
      ['با پرش یا صندلی، به بالای چین‌آپ برو (کف دست‌ها رو به خودت).', 'Jump or step up to the top chin-up position with palms facing you.'],
      ['به آرامی و با شمارش ۵ ثانیه بدن را پایین بیاور تا بازوها کاملاً باز شوند.', 'Lower your body slowly over a 5-second count until arms are fully extended.'],
      ['پا را زمین بگذار و حرکت را تکرار کن.', 'Step down and repeat.']],
    tips: [['آرنج‌ها را رو به جلو نگه دار تا جلوبازو و زیربغل بیشترین کار را انجام دهند.', 'Keep elbows pointed forward to maximize bicep and lat engagement.']],
    mistakes: [['استفاده از پرش شدید که کنترل بدن را از بین می‌برد', 'Jumping too aggressively and losing body tension at the top']] },

  { cat: 'pull', level: 1, iso: true, name: ['آویزان ماندن از میله', 'Dead Hang'],
    muscles: [['مچ و ساعد', 'Wrists & forearms'], ['سرشانه', 'Shoulders'], ['زیربغل (لت)', 'Lats']],
    desc: ['تقویت استقامت ساعد و پنجه، سلامت شانه‌ها و کاهش فشار روی مهره‌های ستون فقرات.', 'Builds forearm grip endurance, improves shoulder mobility, and decompresses the spine.'],
    rec: { sets: 3, amount: 30, unit: 'sec' },
    steps: [
      ['میله را محکم با هر دو دست (شست دور میله) بگیر و پاها را از زمین جدا کن.', 'Grip the bar firmly (wrapping thumbs around) and lift your feet off the ground.'],
      ['بدن را آرام نگه دار و شکم را کمی منقبض کن تا تاب نخوری.', 'Keep your body still with a slight core brace to prevent swinging.'],
      ['تا پایان زمان مشخص آویزان بمان و عمیق نفس بکش.', 'Hang for the prescribed duration while breathing deeply.']],
    tips: [['برای سلامت بیشتر شانه، به‌جای رها کردن کامل، شانه‌ها را کمی فعال (پایین) نگه دار.', 'For optimal shoulder health, maintain slight scapular engagement rather than collapsing completely.']],
    mistakes: [['نگرفتن میله با شست (گریپ بدون شست) که احتمال سر خوردن را بالا می‌برد', 'Using a thumbless grip, which reduces grip security']] },

  { cat: 'pull', level: 2, iso: true, name: ['نگه‌داشتن بارفیکس در بالا', 'Top Pull-up Hold (Flexed Arm Hang)'],
    muscles: [['زیربغل (لت)', 'Lats'], ['جلوبازو', 'Biceps'], ['ذوزنقه', 'Traps'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['نگه داشتن بدن در بالاترین نقطهٔ بارفیکس برای تقویت قدرت قفل کردن حرکت در انتها.', 'Holding the body at the peak of the pull-up to strengthen the top-end lockout phase.'],
    rec: { sets: 3, amount: 15, unit: 'sec' },
    steps: [
      ['میله را با دست‌های رو به جلو بگیر و خودت را بالا بکش تا چانه بالای میله باشد.', 'Grab the bar with an overhand grip and pull up until your chin is over the bar.'],
      ['سینه را به میله نزدیک نگه دار و آرنج‌ها را به پهلو فشار بده.', 'Keep your chest close to the bar and drive your elbows into your sides.'],
      ['در همین نقطه برای زمان تعیین‌شده مقاومت کن.', 'Hold this top position isometrically for the target duration.']],
    tips: [['شانه‌ها را عقب بده و سینه را باز نگه دار، نه اینکه گردن را بکشی.', 'Pull your shoulders back and keep your chest proud rather than craning your neck.']],
    mistakes: [['کشیدن گردن به بالا برای نگه داشتن چانه روی میله', 'Craning the neck upward to keep the chin above the bar']] },

  { cat: 'pull', level: 2, name: ['چین‌آپ دست‌جمع', 'Close-Grip Chin-up'],
    muscles: [['جلوبازو', 'Biceps'], ['زیربغل (لت)', 'Lats'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['یکی از بهترین حرکات وزن بدن برای بیشترین فشار و حجم روی جلوبازو.', 'One of the best bodyweight exercises for maximizing tension and hypertrophy in the biceps.'],
    rec: { sets: 3, amount: 8, unit: 'rep' },
    steps: [
      ['میله را با کف دست‌های رو به خود و فاصلهٔ حدود ۱۰ سانتی‌متر از هم بگیر.', 'Grip the bar with palms facing you, hands about 4 inches apart.'],
      ['با انقباض شدید جلوبازو بدن را بالا بکش تا چانه از میله عبور کند.', 'Contract your biceps hard to pull yourself up until your chin clears the bar.'],
      ['به آرامی به حالت آویزان برگرد.', 'Lower smoothly back to the dead hang position.']],
    tips: [['در پایین حرکت با کنترل باز شو و مچ و آرنج را تکانی نکن.', 'Control the bottom extension smoothly to avoid jerking the wrists and elbows.']],
    mistakes: [['نوسان دادن کمر و پاها', 'Swinging the torso and kicking legs']] },

  { cat: 'pull', level: 3, name: ['بارفیکس + ۲ ثانیه مکث در بالا', 'Pull-up + 2s Top Pause'],
    muscles: [['زیربغل (لت)', 'Lats'], ['ذوزنقه', 'Traps'], ['جلوبازو', 'Biceps'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['اضافه کردن مکث در اوج انقباض برای حذف نیروی تکانه و افزایش قدرت واقعی عضلات پشت.', 'Adding an isometric pause at peak contraction to eliminate momentum and build true back strength.'],
    rec: { sets: 3, amount: 5, unit: 'rep' },
    steps: [
      ['یک بارفیکس تمیز بزن تا چانه بالای میله قرار بگیرد.', 'Pull yourself up cleanly until your chin is over the bar.'],
      ['در همین نقطه ۲ ثانیهٔ کامل مکث کن و کتف‌ها را به هم فشار بده.', 'Hold completely still at the top for 2 full seconds, squeezing your shoulder blades together.'],
      ['با کنترل پایین بیا و تکرار بعدی را شروع کن.', 'Lower down under control and proceed to the next rep.']],
    tips: [['در طول مکث سینه را بالا نگه دار و اجازه نده بدن سقوط کند.', 'Keep your chest lifted during the 2-second hold without letting yourself sink.']],
    mistakes: [['شمردن سریع ۲ ثانیه (باید ۲ ثانیهٔ واقعی باشد)', 'Counting the 2-second pause too quickly']] },

  { cat: 'pull', level: 2, name: ['روئینگ معکوس + ۲ ثانیه مکث', 'Inverted Row + 2s Pause'],
    muscles: [['پشت میانی', 'Mid back'], ['پشت شانه', 'Rear delts'], ['جلوبازو', 'Biceps'], ['ذوزنقه', 'Traps']],
    desc: ['افزایش درگیری عضلات بین دو کتف برای اصلاح قوز پشتی و بهبود فرم ایستادن.', 'Increases activation of the mid-back muscles to correct rounded shoulders and improve posture.'],
    rec: { sets: 3, amount: 8, unit: 'rep' },
    steps: [
      ['سینه را تا تماس با لبهٔ میز یا میله بالا بکش.', 'Pull your chest all the way up to touch the table edge or bar.'],
      ['در همین نقطه ۲ ثانیهٔ کامل مکث کن و کتف‌ها را به هم فشار بده.', 'Hold at peak contraction for 2 full seconds, squeezing your shoulder blades together.'],
      ['به آرامی به نقطهٔ شروع برگرد.', 'Lower back down slowly to full arm extension.']],
    tips: [['در طول مکث سینه را باز نگه دار و شانه‌ها را به سمت گوش بالا نبر.', 'Keep your chest proud during the pause and avoid shrugging shoulders toward your ears.']],
    mistakes: [['شل کردن بدن در ثانیهٔ دوم مکث', 'Losing core tension during the 2-second hold']] },

  { cat: 'pull', level: 1, name: ['هایپراکستنشن روی زمین (کبری)', 'Back Extensions (Prone Cobra)'],
    muscles: [['کمر', 'Lower back'], ['باسن', 'Glutes'], ['ذوزنقه', 'Traps']],
    desc: ['تقویت عضلات راست‌کنندهٔ ستون فقرات و کمک به پیشگیری از کمردرد بدون نیاز به هیچ وسیله‌ای.', 'Strengthens the spinal erectors and helps prevent lower back pain with zero equipment.'],
    rec: { sets: 3, amount: 15, unit: 'rep' },
    steps: [
      ['روی شکم دراز بکش و دست‌ها را کنار گوش یا روی کمر بگذار.', 'Lie face down on the floor with hands lightly behind your ears or lower back.'],
      ['با انقباض عضلات کمر و باسن، قفسهٔ سینه را به آرامی از زمین بلند کن (پاها روی زمین بمانند).', 'Contract your lower back and glutes to lift your chest smoothly off the floor while keeping feet grounded.'],
      ['۱ ثانیه مکث کن و آهسته پایین برگرد.', 'Pause for 1 second at the top and lower back down with control.']],
    tips: [['بیش‌ازحد به کمر قوس نده؛ بلند شدن تا جایی که سینه از زمین جدا شود کافی است.', 'Avoid hyperextending the spine; lifting just until your chest clears the floor is plenty.']],
    mistakes: [['پرتاب ناگهانی بالاتنه به بالا', 'Jerking the torso upward rapidly']] },

  { cat: 'pull', level: 1, name: ['هایپراکستنشن روی زمین + ۲ ثانیه مکث', 'Back Extensions + 2s Pause'],
    muscles: [['کمر', 'Lower back'], ['باسن', 'Glutes'], ['پشت میانی', 'Mid back']],
    desc: ['افزایش استقامت ایزومتریک عضلات کمر و بهبود ثبات ستون فقرات.', 'Builds isometric endurance in the spinal erectors and enhances postural stability.'],
    rec: { sets: 3, amount: 12, unit: 'rep' },
    steps: [
      ['سینه را از زمین بلند کن و آرنج‌ها را به سمت عقب بکش.', 'Lift your chest off the floor while pulling your elbows back.'],
      ['در بالاترین نقطه ۲ ثانیهٔ کامل مکث کن و نفس بکش.', 'Hold the top position for 2 full seconds while breathing steadily.'],
      ['به آرامی روی زمین برگرد.', 'Lower back down slowly to the mat.']],
    tips: [['به زمین نگاه کن تا گردن در راستای طبیعی ستون فقرات بماند.', 'Keep your gaze down at the mat to maintain neutral neck alignment.']],
    mistakes: [['بالا بردن چانه و فشار به مهره‌های گردن', 'Looking up and straining the cervical spine']] },

  { cat: 'pull', level: 1, name: ['سوپرمن', 'Superman'],
    muscles: [['کمر', 'Lower back'], ['باسن', 'Glutes'], ['همسترینگ', 'Hamstrings'], ['پشت شانه', 'Rear delts']],
    desc: ['درگیر کردن هم‌زمان کل زنجیرهٔ پشتی بدن از شانه‌ها تا پاشنه روی زمین.', 'Simultaneously engages the entire posterior chain from shoulders to heels on the floor.'],
    rec: { sets: 3, amount: 12, unit: 'rep' },
    steps: [
      ['روی شکم دراز بکش و دست‌ها را کاملاً صاف بالای سر دراز کن.', 'Lie face down with your arms extended straight overhead and legs straight.'],
      ['هم‌زمان دست‌ها، سینه و پاهای صاف را چند سانتی‌متر از زمین بلند کن.', 'Simultaneously lift your arms, chest, and legs a few inches off the ground.'],
      ['به آرامی بدن را روی زمین برگردان.', 'Lower smoothly back down to the starting position.']],
    tips: [['روی کشیده شدن بدن تمرکز کن، نه صرفاً ارتفاع گرفتن.', 'Focus on lengthening your body outward rather than trying to arch as high as possible.']],
    mistakes: [['خم کردن زانوها و آرنج‌ها هنگام بلند شدن', 'Bending knees and elbows during the lift']] },

  { cat: 'pull', level: 2, name: ['سوپرمن + ۲ ثانیه مکث', 'Superman + 2s Pause'],
    muscles: [['کمر', 'Lower back'], ['باسن', 'Glutes'], ['ذوزنقه', 'Traps'], ['همسترینگ', 'Hamstrings']],
    desc: ['تقویت عمیق عضلات پشت و باسن با حفظ انقباض ایزومتریک در اوج حرکت.', 'Deeply strengthens the back and glutes by holding an isometric contraction at the peak.'],
    rec: { sets: 3, amount: 10, unit: 'rep' },
    steps: [
      ['دست‌ها، سینه و پاها را هم‌زمان از زمین جدا کن.', 'Lift arms, chest, and legs off the floor simultaneously.'],
      ['در بالاترین نقطه ۲ ثانیهٔ کامل مکث کن و عضلات باسن و کمر را منقبض نگه دار.', 'Hold the peak position for 2 full seconds, squeezing your glutes and back.'],
      ['با کنترل روی زمین برگرد.', 'Return slowly to the floor.']],
    tips: [['در طول ۲ ثانیهٔ مکث نفس خود را حبس نکن.', 'Keep breathing smoothly during the 2-second hold.']],
    mistakes: [['رها کردن ناگهانی بدن روی زمین پس از مکث', 'Dropping abruptly to the floor after the pause']] },

  { cat: 'pull', level: 1, name: ['روئینگ معکوس با دست‌عکس', 'Supinated (Underhand) Inverted Row'],
    muscles: [['جلوبازو', 'Biceps'], ['زیربغل (لت)', 'Lats'], ['ذوزنقه', 'Traps'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['روئینگ معکوس با کف دست‌های رو به صورت؛ درگیری بیشتر جلوبازو و بخش پایینی زیربغل.', 'Performing inverted rows with an underhand grip; increases recruitment of the biceps and lower lats.'],
    rec: { sets: 3, amount: 10, unit: 'rep' },
    steps: [
      ['زیر میله یا میز محکم قرار بگیر و آن را به عرض شانه طوری بگیر که کف دست‌ها رو به صورتت باشد.', 'Position yourself under a bar or sturdy table and grip it shoulder-width apart with palms facing you.'],
      ['بدن را صاف نگه دار و سینه را به سمت میله بالا بکش.', 'Keep your body straight and pull your chest up toward the bar.'],
      ['با کنترل کامل پایین بیا تا دست‌ها صاف شوند.', 'Lower back down with control until your arms are fully extended.']],
    tips: [['آرنج‌ها را نزدیک پهلوها نگه دار تا بیشترین فشار به جلوبازو و زیربغل وارد شود.', 'Keep elbows tucked close to your sides to maximize bicep and lat tension.']],
    mistakes: [['خم کردن گردن به جلو برای رساندن چانه به میله', 'Craning the neck forward instead of pulling with the chest']] },

  { cat: 'pull', level: 2, name: ['روئینگ معکوس با دست‌عکس + ۲ ثانیه مکث', 'Supinated Inverted Row + 2s Pause'],
    muscles: [['جلوبازو', 'Biceps'], ['زیربغل (لت)', 'Lats'], ['پشت میانی', 'Mid back'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['ترکیب مکث ایزومتریک و گریپ دست‌عکس برای پمپاژ شدید در بازوها و عضلات پشت.', 'Combines an isometric hold with an underhand grip for an intense pump in the biceps and mid-back.'],
    rec: { sets: 3, amount: 8, unit: 'rep' },
    steps: [
      ['با دست‌های دست‌عکس بدن را بالا بکش تا سینه به میله برسد.', 'Pull yourself up with an underhand grip until your chest touches the bar.'],
      ['۲ ثانیهٔ کامل در بالا مکث کن و بازوها و کتف‌ها را منقبض نگه دار.', 'Pause for 2 full seconds at the top, keeping biceps and shoulder blades contracted.'],
      ['به آرامی به حالت شروع برگرد.', 'Lower smoothly back to the starting position.']],
    tips: [['باسن و شکم را در طول مکث سفت نگه دار تا خط بدن صاف بماند.', 'Keep glutes and abs engaged during the pause to maintain a straight body line.']],
    mistakes: [['پایین آمدن تدریجی در طول ۲ ثانیه به‌جای ثابت ماندن', 'Slowly sinking during the 2-second hold instead of staying locked in place']] },

  { cat: 'pull', level: 1, name: ['جلوبازو با کیف', 'Backpack Bicep Curl'],
    muscles: [['جلوبازو', 'Biceps'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['حرکتی ساده و مؤثر برای حجم‌دهی به جلوبازو در خانه با یک کوله‌پشتی وزن‌دار.', 'A simple, effective home exercise to build bicep size and strength using a loaded backpack.'],
    rec: { sets: 3, amount: 12, unit: 'rep' },
    steps: [
      ['دستگیرهٔ بالایی یا بندهای یک کوله‌پشتی پر از کتاب یا بطری آب را با کف دست‌های رو به بالا بگیر.', 'Hold the top handle or straps of a loaded backpack with palms facing upward (supinated grip).'],
      ['آرنج‌ها را به پهلو بچسبان و فقط با خم کردن ساعد، کیف را تا جلوی شانه بالا بیاور.', 'Pin your elbows to your sides and curl the bag up toward your shoulders.'],
      ['۱ ثانیه انقباض را نگه دار و با کنترل کیف را پایین ببر.', 'Squeeze for 1 second at the top and lower the bag slowly back down.']],
    tips: [['آرنج‌ها نباید به جلو یا عقب حرکت کنند؛ آن‌ها را مثل لولا ثابت نگه دار.', 'Keep your elbows pinned as stationary hinges; do not swing them forward.']],
    mistakes: [['تاب دادن کمر برای بالا آوردن کیف سنگین', 'Swinging the lower back to heave the backpack upward']] },

  { cat: 'pull', level: 1, name: ['جلوبازو چکشی با کیف', 'Backpack Hammer Curl'],
    muscles: [['جلوبازو', 'Biceps'], ['براکیالیس', 'Brachialis'], ['مچ و ساعد', 'Wrists & forearms']],
    desc: ['گرفتن کیف با مچ خنثی (چکشی) برای ضخامت بازو و تقویت ساعد که در بارفیکس بسیار حیاتی است.', 'Curling the backpack with a neutral grip to thicken the arms and strengthen forearms, crucial for pull-ups.'],
    rec: { sets: 3, amount: 12, unit: 'rep' },
    steps: [
      ['بندهای جانبی کوله‌پشتی را طوری بگیر که کف دست‌ها رو به هم (حالت خنثی) باشند.', 'Grip the side straps of the backpack with palms facing each other (neutral grip).'],
      ['آرنج‌ها را کنار بدن ثابت نگه دار و کیف را به سمت شانه‌ها بالا بیاور.', 'Keep elbows tucked at your sides and curl the backpack upward.'],
      ['با کنترل به نقطهٔ شروع برگرد تا دست‌ها صاف شوند.', 'Lower back down under control to full arm extension.']],
    tips: [['این حرکت مستقیماً قدرت کششی تو را در بارفیکس و کماندو بارفیکس بالا می‌برد.', 'This movement directly transfers to stronger pull-ups and commando pull-ups.']],
    mistakes: [['خم کردن یا چرخاندن مچ دست حین حرکت', 'Bending or twisting the wrists during the curl']] },

  { cat: 'pull', level: 1, name: ['زیربغل خم با کیف', 'Bent-Over Backpack Row'],
    muscles: [['زیربغل (لت)', 'Lats'], ['ذوزنقه', 'Traps'], ['پشت میانی', 'Mid back'], ['پشت شانه', 'Rear delts'], ['جلوبازو', 'Biceps']],
    desc: ['حرکتی مؤثر برای تقویت کل عضلات پشت در خانه بدون نیاز به میلهٔ بارفیکس.', 'An effective compound pulling exercise to strengthen the entire back at home without a pull-up bar.'],
    rec: { sets: 3, amount: 12, unit: 'rep' },
    steps: [
      ['پاها را به عرض شانه باز کن، زانوها را کمی خم کن و بالاتنه را با کمر کاملاً صاف حدود ۴۵ درجه به جلو خم کن.', 'Stand shoulder-width apart with slightly bent knees, hinging forward at the hips to a 45-degree angle with a flat back.'],
      ['بندها یا دستگیرهٔ کیف را بگیر و با کشیدن آرنج‌ها به عقب، کیف را به سمت شکم بالا بکش.', 'Grip the backpack straps and row the bag toward your lower ribs by driving your elbows back.'],
      ['۱ ثانیه کتف‌ها را منقبض نگه دار و با کنترل کیف را پایین ببر.', 'Squeeze your shoulder blades together for 1 second at the top, then lower with control.']],
    tips: [
      ['کمر باید در تمام طول حرکت کاملاً صاف بماند؛ به هیچ وجه قوز نکن.', 'Maintain a completely flat spine throughout; never round your lower back.'],
      ['کیف را به سمت ناف و شکم بکش، نه به سمت سینه و گردن.', 'Pull the backpack toward your belly button rather than your upper chest.']],
    mistakes: [
      ['گرد کردن ستون فقرات (خطر آسیب به دیسک کمر)', 'Rounding the lower back'],
      ['بالا انداختن شانه‌ها به سمت گوش', 'Shrugging shoulders up toward the ears']] }
];

module.exports = { fills, merges, news };
