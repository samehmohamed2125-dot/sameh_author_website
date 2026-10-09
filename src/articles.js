// Drafts are never listed, served, indexed or exported by the build.
// Publish only after adding the exact approved text and an approved cover.
export const articles = [{
  slug: 'al-nakhl-la-yastaajil-al-balah',
  title: 'النخل لا يستعجل البلح',
  status: 'published',
  paragraphs: [
    'في الصعيد، كان أبي يقول إن النخل لا يستعجل البلح، ومع ذلك يظلّ واقفًا في الشمس.',
    'تذكرت كلامه بعد سنوات العمل الأخيرة. حين كنت أعود من نوبات العمل الطويلة ورائحة التراب عالقة في حذائي.',
    'تعلمت أن بعض الأبواب لا تُفتح بالقوة. بعضها يحتاج صبرًا يشبه الفجر، يأتي بطيئًا، لكنه حين يصل لا يستأذن العتمة. وعرفت أن ما تأخر عن موعده ليس بالضرورة ضاع، أحيانًا ينضج بعيدًا عن أعيننا، ثم يعود في الوقت الذي نكون فيه أكثر قدرة على حمله.',
    'سامح محمد عبد الظاهر',
  ],
  description: '',
  cover: {
    src: '/images/articles/al-nakhl-la-yastaajil-al-balah.jpg',
    width: 1280,
    height: 853,
    alt: 'غلاف مقال النخل لا يستعجل البلح: نخلة وقت الغروب، مع عنوان المقال واسم الكاتب سامح محمد عبد الظاهر',
  },
  originalTextImage: null, // Optional approved original: same image fields as cover.
}, {
  slug: 'al-fadfada',
  title: 'الفضفضة',
  status: 'published',
  paragraphs: [
    'خديعة الفضفضة: تظن واهماً أنك (تفرغ) ما في جعبتك لترتاح؛ بينما أنت فعلياً (تعبئ) مسدساتهم بذخيرة حية ستصوب نحوك لاحقاً.',
    'في لحظة ضعف، تخلع عنك (رداء الغموض) الساتر؛ فتتحول في أعينهم من "لغز مهيب" يُحسب له ألف حساب، إلى "كتاب مفتوح" وممل.',
    'لا يغرنك "هز" رؤوسهم تعاطفاً؛ هم لا يواسونك، هم يمارسون (متعة التلصص) المجاني على انهيارك، ويوثقون لحظة انكسارك بذاكرة خبيثة.',
    'الجريمة أنك تبحث عن (خفة الروح) لدقائق؛ وتدفع ثمنها (ثقلاً) أبدياً في نظراتهم، فالسر الذي يغادر صدرك... يأخذ معه نصف هيبتك.',
    'ستفيق من "سكرة الكلام" لتجد أنك صرت (أصغر)، وأنك سلمت "مفاتيح نقاط ضعفك" لمن سيستخدمها ليفتح بها أبواب السخرية في غيابك.',
    'عد إلى صمتك فوراً؛ فإن يحترق قلبك بـ(جمر الكتمان) العزيز.. أشرف لك ألف مرة من أن يبرد بـ(ماء الشفقة) المهين!',
    'سامح محمد عبد الظاهر',
  ],
  description: '',
  cover: {
    src: '/images/articles/al-fadfada.jpg',
    width: 1280,
    height: 720,
    alt: 'غلاف مقال الفضفضة: رجل يجلس إلى مكتب في إضاءة دافئة، مع عنوان المقال واسم الكاتب سامح محمد عبد الظاهر',
  },
  originalTextImage: null,
}, {
  slug: 'al-hob-wahdahu-la-yakfi',
  title: 'الحب وحده لا يكفي',
  status: 'published',
  paragraphs: [
    'هل يستطيع الحب وحده إنقاذ إنسانًا يتآكل من الداخل يا رفيقي؟',
    '– للأسف لا.',
    '– لأن الحب الحقيقي يا رفيقي أشبه بضمادة رائعة، ولكنك ستضعها فوق نزيف داخلي مستمر.',
    'وقد يشعرك بالأمان، ولكنه سيبقى عاجزًا عن بناء روحك من الداخل.',
    'لا يكفي وجود ذراعين في العالم أن تنتشل شخصًا يسقط في قاع نفسه.',
    'سامح محمد عبد الظاهر',
  ],
  description: '',
  cover: {
    src: '/images/articles/al-hob-wahdahu-la-yakfi.jpg',
    width: 1280,
    height: 720,
    alt: 'غلاف مقال الحب وحده لا يكفي: رجل منكسر وقلب متشقق، مع عنوان المقال واسم الكاتب سامح محمد عبد الظاهر',
  },
  originalTextImage: null,
}];

export const articlePath = article => `/writings/${article.slug}`;
export function isPublishable(article) {
  return article.status === 'published' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)
    && typeof article.title === 'string' && Boolean(article.title.trim())
    && Array.isArray(article.paragraphs) && article.paragraphs.length > 0
    && article.paragraphs.every(text => typeof text === 'string' && Boolean(text.trim()))
    && Boolean(article.cover?.src && article.cover?.alt && article.cover.width > 0 && article.cover.height > 0);
}
export const publishedArticles = () => articles.filter(isPublishable);
export const findArticle = path => publishedArticles().find(article => articlePath(article) === path);

function image(image, escape, lazy = false) {
  return `<img src="${escape(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" decoding="async" ${lazy ? 'loading="lazy"' : 'loading="eager" fetchpriority="high"'}>`;
}

export function writingsSection(escape, entries = publishedArticles()) {
  const ready = entries.filter(isPublishable);
  return `<section class="section container" id="writings" aria-labelledby="writings-title"><div class="section-heading"><div><p class="eyebrow">من كتاباتي</p><h2 id="writings-title">من كتاباتي</h2></div></div>${ready.length ? `<div class="writing-grid">${ready.map(article => `<article class="writing-card"><a href="${articlePath(article)}"><div class="writing-cover">${image(article.cover, escape, true)}</div><h3>${escape(article.title)}</h3><span class="text-link">اقرأ المقال ←</span></a></article>`).join('')}</div>` : '<p class="muted">ستُضاف الكتابات بعد اعتماد نصوصها وصورها الأصلية.</p>'}</section>`;
}

export function articlePage(article, escape, authorName) {
  if (!isPublishable(article)) throw new Error('Unapproved article cannot be rendered');
  return `<article class="container section literary-article" aria-labelledby="article-title"><a class="text-link" href="/#writings">العودة إلى من كتاباتي ←</a><header><p class="eyebrow">من كتاباتي</p><h1 id="article-title">${escape(article.title)}</h1><p class="article-byline">${escape(authorName)}</p></header><div class="writing-cover article-cover">${image(article.cover, escape)}</div><div class="article-text">${article.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}</div>${article.originalTextImage ? `<section class="article-original" aria-labelledby="original-text-title"><h2 id="original-text-title">النص الأصلي</h2><a href="${escape(article.originalTextImage.src)}" target="_blank" rel="noopener noreferrer" aria-label="فتح صورة النص الأصلي بحجم أكبر في تبويب جديد">${image(article.originalTextImage, escape, true)}</a></section>` : ''}<div class="article-actions" data-article-path="${articlePath(article)}" data-article-title="${escape(article.title)}"><button type="button" class="button article-share">مشاركة المقال</button><button type="button" class="button article-copy">نسخ رابط المقال</button><p class="article-share-status" role="status" aria-live="polite"></p><input class="article-share-link" type="text" readonly hidden aria-label="رابط المقال للنسخ اليدوي"></div></article>`;
}
