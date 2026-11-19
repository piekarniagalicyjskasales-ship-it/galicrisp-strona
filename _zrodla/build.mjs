// Static site generator for GaliCrisp. Usage: node build.mjs [--preview]
// --preview writes links as .../index.html so the site can be browsed from files or an artifact host.
import fs from 'node:fs';
import path from 'node:path';
import { SITE, PAGES, META, UI, LINES, CATS, CAT_ORDER } from './content.mjs';
const SZ = JSON.parse(fs.readFileSync(new URL('./img-sizes.json', import.meta.url)));
const fan = (c, A, cls = '') => `<span class="fan ${cls}" data-fan style="--c:${CATS[c].color}" aria-hidden="true"><span class="fan-floor"></span>${CATS[c].fan.map((f, i) => `<img class="fan-p fan-${i}" data-src="${A}img/p/${f}.webp" alt="" ${dim('p/' + f + '.webp')} decoding="async">`).join('')}</span>`;
const dim = f => { const [w, h] = SZ[f] || [400, 600]; return `width="${w}" height="${h}"`; };

const PREVIEW = process.argv.includes('--preview');
const NOINDEX = process.argv.includes('--noindex'); // test deployments: keep search engines out
const OUT = path.resolve(process.argv.find(a => a.startsWith('--out='))?.slice(6) || '../site');
const LANGS = ['pl', 'en'];
const V = '20261119b';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lineById = Object.fromEntries(LINES.map(l => [l.id, l]));

const urlPath = (key, lang) => `${lang}/${PAGES[key][lang]}`;
const absUrl = (key, lang) => `${SITE.url}/${urlPath(key, lang)}`;
function rel(fromKey, lang, toKey, toLang = lang) {
  const depth = urlPath(fromKey, lang).split('/').filter(Boolean).length;
  let p = '../'.repeat(depth) + urlPath(toKey, toLang);
  if (PREVIEW) p += 'index.html';
  return p;
}
const assetRel = (key, lang) => '../'.repeat(urlPath(key, lang).split('/').filter(Boolean).length) + 'assets/';

/* ---------------- page copy ---------------- */
const T = {
  pl: {
    heroKicker: 'Producent pieczywa chrupkiego, krakersów i przekąsek piekarniczych',
    heroDisplay: ['Małe kęsy.', 'Wielkie możliwości.'],
    heroLead: 'GaliCrisp to marka Piekarni Galicyjskiej. Pieczemy pod własną marką i pod Twoją, dla sieci handlowych, dystrybutorów i foodservice w Polsce i na ponad 20 rynkach eksportowych.',
    facts: [['30+', 'lat doświadczenia w piekarnictwie'], ['20+', 'rynków eksportowych'], ['5', 'kategorii produktów, 40 pozycji w katalogu'], ['A+', 'ocena w audycie BRCGS']],
    reelTitle: 'Pięć kategorii, jedna piekarnia',
    reelLead: 'Każda kategoria ma swoją półkę i swój kolor. Wybierz jedną, żeby zobaczyć linie, smaki i dane logistyczne.',
    proteinTitle: 'Do 27 g białka w 100 g kromki',
    proteinBody: 'Pieczywo chrupkie Protein 180 g ma tę samą chrupkość co nasza klasyczna kromka, a do tego mocny argument na półce high protein. Dwa smaki, 3 ziarna i cebula, w opakowaniu z etykietą wielokrotnego zamykania.',
    proteinCta: 'Poznaj linię Protein',
    plTitle: 'Twoja marka, nasza piekarnia',
    plBody: 'Produkujemy pieczywo chrupkie, pieczywka, krakersy na zakwasie, snacki focaccia i przekąski maślane pod marką klienta. Dopasowujemy recepturę, gramaturę, opakowanie i logistykę do wymagań sieci lub dystrybutora.',
    plSteps: [['Brief', 'Kategoria, rynek, pozycjonowanie cenowe i planowany wolumen.'], ['Receptura i próbki', 'Dobieramy recepturę z naszego portfolio albo rozwijamy nową i wysyłamy próbki.'], ['Opakowanie', 'Format, gramatura, liczba kromek, karton ekspozycyjny i etykieta na dany rynek.'], ['Produkcja testowa', 'Partia testowa, akceptacja jakości i specyfikacji.'], ['Dostawy', 'Regularna produkcja i wysyłka paletowa do centrów dystrybucyjnych.']],
    qTitle: 'Jakość, którą da się sprawdzić',
    qBody: 'Pieczemy w zakładzie w Jeżowem, certyfikowanym według standardów, których wymagają sieci w Europie. Kopie certyfikatów udostępniamy partnerom na prośbę.',
    certs: [['BRCGS', 'Global Standard for Food Safety, ocena A+'], ['IFS Food', 'poziom Higher Level'], ['BIO', 'certyfikat rolnictwa ekologicznego PL-EKO-07']],
    faq: [['Czy GaliCrisp produkuje pod marką własną sieci (private label)?', 'Tak. Produkujemy pieczywo chrupkie, pieczywka, krakersy na zakwasie, snacki focaccia i przekąski maślane pod marką klienta. Dopasowujemy recepturę, gramaturę, opakowanie i logistykę do wymagań sieci lub dystrybutora.'],
      ['Jakie certyfikaty posiada zakład?', 'Zakład ma certyfikat BRCGS z oceną A+, IFS Food na poziomie Higher Level oraz certyfikat rolnictwa ekologicznego BIO (PL-EKO-07). Kopie certyfikatów udostępniamy partnerom na prośbę.'],
      ['Ile białka ma pieczywo chrupkie Protein?', 'Pieczywo chrupkie Protein 180 g zawiera do 27 g białka w 100 g produktu. To propozycja dla sieci rozwijających kategorię żywności funkcjonalnej i sportowej.'],
      ['Czym są pieczywka i czym różnią się od pieczywa chrupkiego?', 'Pieczywka to cienkie, płaskie pieczywo chrupkie w opakowaniu 130 g, dostępne w 6 smakach. Mają delikatniejszą strukturę niż klasyczna kromka i sprawdzają się jako przekąska do serów i past.'],
      ['Czy można zamówić próbki produktów?', 'Tak. Próbki wysyłamy sieciom, dystrybutorom i firmom foodservice po zapytaniu przez formularz lub na adres info@galicrisp.pl. W wiadomości podaj kategorię produktu, rynek i planowany wolumen.'],
      ['Na jakie rynki eksportujecie i kogo obsługujecie?', 'Nasze produkty trafiają na ponad 20 rynków eksportowych. Współpracujemy z sieciami handlowymi, dystrybutorami, hurtowniami i firmami foodservice w Polsce i za granicą.']],
    ctaTitle: 'Porozmawiajmy o Twojej półce',
    ctaBody: 'Napisz, jakiej kategorii szukasz i na jaki rynek. Odpowiemy z ofertą, specyfikacją i terminem wysyłki próbek.',
  },
  en: {
    heroKicker: 'Crispbread, crackers and bakery snacks manufacturer in Poland',
    heroDisplay: ['Small bites.', 'Huge opportunities.'],
    heroLead: 'GaliCrisp is the brand of Piekarnia Galicyjska. We bake under our own brand and under yours, for retailers, distributors and foodservice in Poland and in more than 20 export markets.',
    facts: [['30+', 'years of baking experience'], ['20+', 'export markets'], ['5', 'product categories, 40 catalogue items'], ['A+', 'BRCGS audit grade']],
    reelTitle: 'Five categories, one bakery',
    reelLead: 'Every category has its own shelf and its own colour. Pick one to see its lines, flavours and logistics data.',
    proteinTitle: 'Up to 27 g of protein per 100 g',
    proteinBody: 'Protein Crispbread 180 g keeps the crunch of our classic slice and gives buyers a strong reason to list it on the high-protein shelf. Two flavours, 3 Seeds and Onion, in a pack with a resealable label.',
    proteinCta: 'See the Protein line',
    plTitle: 'Your brand, our bakery',
    plBody: 'We make crispbread, flatbread crisps, sourdough crackers, focaccia snacks and butter savouries under our customers’ brands. Recipe, weight, packaging and logistics are matched to the retailer or distributor.',
    plSteps: [['Brief', 'Category, market, price positioning and planned volume.'], ['Recipe and samples', 'We pick a recipe from our portfolio or develop a new one, then ship samples.'], ['Packaging', 'Format, weight, slice count, display carton and a label for the target market.'], ['Trial run', 'A trial batch, quality sign-off and an agreed specification.'], ['Supply', 'Regular production and pallet shipments to distribution centres.']],
    qTitle: 'Quality you can verify',
    qBody: 'We bake in Jeżowe, Poland, in a plant certified to the standards European retailers ask for. Copies of our certificates are available to partners on request.',
    certs: [['BRCGS', 'Global Standard for Food Safety, grade A+'], ['IFS Food', 'Higher Level'], ['BIO', 'EU organic certification PL-EKO-07']],
    faq: [['Does GaliCrisp make private label products?', 'Yes. We make crispbread, flatbread crisps, sourdough crackers, focaccia snacks and butter savouries under our customers’ brands, matching recipe, weight, packaging and logistics to each retailer or distributor.'],
      ['Which certificates does the plant hold?', 'BRCGS Food Safety with grade A+, IFS Food at Higher Level and EU organic certification (PL-EKO-07). Copies are available to partners on request.'],
      ['How much protein does Protein Crispbread contain?', 'Protein Crispbread 180 g contains up to 27 g of protein per 100 g, made for retailers growing their functional and sports nutrition shelf.'],
      ['What are flatbread crisps?', 'Thin, flat crispbread in a 130 g pack, available in 6 flavours. Lighter in texture than a classic slice, they work as a snack with cheese and spreads.'],
      ['Can I order samples?', 'Yes. We ship samples to retailers, distributors and foodservice companies after a request through the form or to info@galicrisp.pl. Tell us the product category, market and planned volume.'],
      ['Which markets do you export to?', 'Our products reach more than 20 export markets. We work with retail chains, distributors, wholesalers and foodservice companies in Poland and abroad.']],
    ctaTitle: 'Let’s talk about your shelf',
    ctaBody: 'Tell us which category you are looking for and for which market. We reply with an offer, the specification and a sample shipping date.',
  },
};

const PAGE_COPY = {
  pl: {
    pl: { h1: 'Private label: pieczywo chrupkie, krakersy i przekąski pod Twoją marką',
      lead: 'Produkujemy dla sieci handlowych i marek, które chcą mieć w ofercie własne pieczywo chrupkie, krakersy i przekąski piekarnicze. Od receptury po paletę w centrum dystrybucyjnym.',
      sections: [
        ['Co możemy wyprodukować pod Twoją marką', 'Cały katalog GaliCrisp jest dostępny w private label: pieczywo chrupkie w liniach Classic, Protein, Artisan, Deli i Wholegrain, pieczywka w sześciu smakach, krakersy na zakwasie pszennym i żytnim, snacki focaccia oraz przekąski na maśle z goudą. Możemy też rozwinąć nową recepturę dla Twojego rynku.'],
        ['Co dopasowujemy', 'Recepturę i smak, gramaturę od 90 do 200 g, liczbę kromek, rodzaj opakowania (stojące pudełko, worek, tacka, karton), karton ekspozycyjny, etykietę w języku rynku oraz paletyzację pod Twoje centrum dystrybucyjne.'],
        ['Dlaczego GaliCrisp', 'Ponad 30 lat w piekarnictwie, eksport na ponad 20 rynków i zakład z certyfikatami BRCGS A+, IFS Food Higher Level oraz BIO. Przy każdym projekcie pracuje z Tobą jeden opiekun handlowy, a technolodzy prowadzą recepturę od próbek do produkcji.'],
      ] },
    export: { h1: 'Eksport i B2B: pieczywo chrupkie i przekąski dla sieci i dystrybutorów',
      lead: 'Dostarczamy na ponad 20 rynków eksportowych. Pracujemy z sieciami handlowymi, dystrybutorami, hurtowniami i firmami foodservice.',
      sections: [
        ['Dla kogo pracujemy', 'Sieci handlowe kupujące pod marką GaliCrisp lub własną, dystrybutorzy i importerzy budujący portfolio przekąsek piekarniczych, hurtownie oraz foodservice, czyli hotele, kawiarnie i catering.'],
        ['Jak wygląda współpraca', 'Zaczynamy od zapytania z kategorią, rynkiem i wolumenem. Wysyłamy ofertę ze specyfikacją i próbkami. Po akceptacji ustalamy harmonogram produkcji i wysyłki paletowej. Dane logistyczne każdej linii, czyli wymiary kartonu, liczbę sztuk na palecie i termin przydatności, znajdziesz przy produktach.'],
        ['Dokumenty dla kupców', 'Specyfikacje produktów, karty logistyczne, deklaracje alergenów i wartości odżywczych oraz kopie certyfikatów BRCGS, IFS i BIO wysyłamy razem z ofertą.'],
      ] },
    quality: { h1: 'Jakość i certyfikaty: BRCGS A+, IFS Food Higher Level, BIO',
      lead: 'Bezpieczeństwo żywności to dla sieci warunek wejścia na półkę. Nasz zakład w Jeżowem spełnia standardy, których wymagają kupcy w Europie.',
      sections: [
        ['BRCGS Global Standard for Food Safety, ocena A+', 'Jeden z najważniejszych standardów bezpieczeństwa żywności uznawanych przez GFSI. Ocena A+ oznacza audyt niezapowiedziany z najwyższym wynikiem.'],
        ['IFS Food, poziom Higher Level', 'Standard wymagany przez wiele sieci w Niemczech, Francji i Włoszech. Higher Level to najwyższy poziom certyfikacji IFS.'],
        ['Certyfikat BIO (PL-EKO-07)', 'Certyfikat rolnictwa ekologicznego pozwala nam produkować linie BIO, także pod marką własną sieci.'],
        ['Co udostępniamy partnerom', 'Kopie certyfikatów, specyfikacje produktów, deklaracje alergenów i wartości odżywczych oraz dane logistyczne każdej linii. Napisz do nas, a wyślemy komplet dokumentów do Twojego działu jakości.'],
      ] },
    about: { h1: 'O nas: GaliCrisp, marka Piekarni Galicyjskiej',
      lead: 'Łączymy lata doświadczenia piekarskiego z myśleniem o tym, co będzie na półce jutro.',
      sections: [
        ['Ponad 30 lat w piekarnictwie', 'Za naszymi produktami stoją lata doświadczenia, rozwijana technologia i współpraca z partnerami na wielu rynkach. GaliCrisp to marka, pod którą Piekarnia Galicyjska z Jeżowego wypieka pieczywo chrupkie, krakersy i przekąski piekarnicze.'],
        ['Dla kogo pieczemy', 'Pracujemy z markami spożywczymi, sieciami handlowymi, dystrybutorami i foodservice w Polsce i na rynkach międzynarodowych. Dopasowujemy produkty, formaty i modele współpracy do potrzeb każdego rynku i partnera. Różne firmy mają różne potrzeby, a elastyczność jest częścią tego, jak pracujemy.'],
        ['Pięć kategorii', 'Pieczywo chrupkie, pieczywka, krakersy, snacki piekarnicze i przekąski wytrawne. Razem 40 pozycji w katalogu i ponad 20 rynków eksportowych.'],
      ] },
    contact: { h1: 'Kontakt: zapytania ofertowe, private label i próbki',
      lead: 'Napisz, czego szukasz. Odpowiemy z ofertą, specyfikacją i terminem wysyłki próbek.' },
  },
  en: {
    pl: { h1: 'Private label crispbread, crackers and snacks under your brand',
      lead: 'We bake for retailers and brands that want their own crispbread, crackers and bakery snacks. From the recipe to the pallet at your distribution centre.',
      sections: [
        ['What we can make under your brand', 'The whole GaliCrisp catalogue is available as private label: Classic, Protein, Artisan, Deli and Wholegrain crispbread, flatbread crisps in six flavours, wheat and rye sourdough crackers, focaccia snacks and all-butter Gouda savouries. We can also develop a new recipe for your market.'],
        ['What we adapt', 'Recipe and flavour, weight from 90 to 200 g, slice count, pack type (standing box, bag, tray, carton), display carton, a label in the market language and palletisation for your distribution centre.'],
        ['Why GaliCrisp', 'More than 30 years of baking, exports to more than 20 markets and a plant certified to BRCGS A+, IFS Food Higher Level and BIO. Each project has one account manager, and our technologists take the recipe from samples to production.'],
      ] },
    export: { h1: 'Export and B2B supply for retailers and distributors',
      lead: 'We supply more than 20 export markets, working with retail chains, distributors, wholesalers and foodservice companies.',
      sections: [
        ['Who we work with', 'Retail chains buying the GaliCrisp brand or their own label, distributors and importers building a bakery snacks portfolio, wholesalers, and foodservice: hotels, cafés and catering.'],
        ['How it works', 'It starts with a request naming the category, market and volume. We send an offer with the specification and samples. After approval we agree the production and pallet shipping schedule. Logistics data for every line (carton size, units per pallet, shelf life) is listed with the products.'],
        ['Documents for buyers', 'Product specifications, logistics sheets, allergen and nutrition declarations, and copies of our BRCGS, IFS and BIO certificates come with every offer.'],
      ] },
    quality: { h1: 'Quality and certificates: BRCGS A+, IFS Food Higher Level, BIO',
      lead: 'For retailers, food safety is the ticket to the shelf. Our plant in Jeżowe meets the standards European buyers ask for.',
      sections: [
        ['BRCGS Global Standard for Food Safety, grade A+', 'One of the key GFSI recognised food safety standards. Grade A+ means an unannounced audit with the top result.'],
        ['IFS Food, Higher Level', 'A standard required by many retailers in Germany, France and Italy. Higher Level is the top IFS certification level.'],
        ['Organic certificate (PL-EKO-07)', 'Our EU organic certification lets us produce BIO lines, including under retailer brands.'],
        ['What we share with partners', 'Certificate copies, product specifications, allergen and nutrition declarations, and logistics data for every line. Write to us and we will send the full set to your quality team.'],
      ] },
    about: { h1: 'About GaliCrisp, the brand of Piekarnia Galicyjska',
      lead: 'We bring together years of bakery expertise and a mindset focused on the shelf of tomorrow.',
      sections: [
        ['More than 30 years of baking', 'Behind our products are years of experience, evolving technology and cooperation with partners across many markets. GaliCrisp is the brand under which Piekarnia Galicyjska in Jeżowe bakes crispbread, crackers and bakery snacks.'],
        ['Who we bake for', 'We work with food brands, retailers, distributors and foodservice partners in Poland and international markets. We adapt products, formats and cooperation models to the needs of each market and partner. Different businesses have different needs, and flexibility is part of how we work.'],
        ['Five categories', 'Crispbread, flatbread crisps, crackers, bakery snacks and savoury biscuits. Together 40 catalogue items and more than 20 export markets.'],
      ] },
    contact: { h1: 'Contact: quotes, private label and samples',
      lead: 'Tell us what you are looking for. We reply with an offer, the specification and a sample shipping date.' },
  },
};

const FORM = {
  pl: { name: 'Imię i nazwisko', company: 'Firma', email: 'E-mail służbowy', country: 'Kraj lub rynek', topic: 'Czego dotyczy zapytanie', topics: ['Produkty GaliCrisp', 'Private label', 'Próbki', 'Inne'], msg: 'Wiadomość', msgHint: 'Kategoria, rynek, planowany wolumen', send: 'Przygotuj wiadomość', legal: 'Administratorem danych podanych w formularzu jest Piekarnia Galicyjska Sp. z o.o. Dane wykorzystujemy wyłącznie do odpowiedzi na zapytanie. Szczegóły w polityce prywatności.', ok: 'Otworzyliśmy Twój program pocztowy z gotową wiadomością do info@galicrisp.pl. Jeśli się nie otworzył, napisz bezpośrednio na ten adres.', req: 'To pole jest wymagane.', bad: 'Podaj poprawny adres e-mail.', data: 'Dane firmy', office: 'Biuro', mail: 'E-mail' },
  en: { name: 'Full name', company: 'Company', email: 'Work email', country: 'Country or market', topic: 'Your request is about', topics: ['GaliCrisp products', 'Private label', 'Samples', 'Other'], msg: 'Message', msgHint: 'Category, market, planned volume', send: 'Prepare the email', legal: 'The controller of the data you enter is Piekarnia Galicyjska Sp. z o.o. We use it only to reply to your request. Details in our privacy policy.', ok: 'We opened your email app with a ready message to info@galicrisp.pl. If it did not open, write to that address directly.', req: 'This field is required.', bad: 'Enter a valid email address.', data: 'Company details', office: 'Office', mail: 'Email' },
};

/* ---------------- JSON-LD ---------------- */
const ORG_ID = `${SITE.url}/#org`;
const org = () => ({
  '@type': 'Organization',
  '@id': ORG_ID, name: SITE.brand, legalName: SITE.company, url: `${SITE.url}/`,
  logo: `${SITE.url}/assets/img/logo-galicrisp.svg`, image: `${SITE.url}/assets/img/og-galicrisp.jpg`,
  address: { '@type': 'PostalAddress', streetAddress: SITE.street, postalCode: SITE.postcode, addressLocality: SITE.city, addressCountry: SITE.country },
  vatID: 'PL8652400178', taxID: '8652400178', telephone: SITE.phone, email: SITE.email,
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', telephone: SITE.phone, email: SITE.email, availableLanguage: ['pl', 'en'] }],
  sameAs: [SITE.facebook, SITE.linkedin],
  brand: { '@type': 'Brand', name: 'GaliCrisp' },
  hasCredential: [
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'BRCGS Global Standard for Food Safety, grade A+' },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'IFS Food, Higher Level' },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'EU organic certification PL-EKO-07' }],
  numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 220 },
  knowsAbout: ['crispbread', 'crackers', 'bakery snacks', 'savoury biscuits', 'private label'],
});
const website = lang => ({ '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: `${SITE.url}/`, name: 'GaliCrisp', inLanguage: ['pl', 'en'], publisher: { '@id': ORG_ID } });
const crumbs = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: u })) });
const faqLd = (faq, url) => ({ '@type': 'FAQPage', '@id': url + '#faq', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

/* ---------------- shared parts ---------------- */
function head({ key, lang, title, desc, ld, preloadHero }) {
  const u = UI[lang], A = assetRel(key, lang);
  const canon = absUrl(key, lang);
  const ogImg = `${SITE.url}/assets/img/og-galicrisp.jpg`;
  return `<!DOCTYPE html>
<html lang="${lang}" data-page="${key}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
<link rel="alternate" hreflang="pl" href="${absUrl(key, 'pl')}">
<link rel="alternate" hreflang="en" href="${absUrl(key, 'en')}">
<link rel="alternate" hreflang="x-default" href="${absUrl(key, 'en')}">
<meta name="robots" content="${NOINDEX ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#B5122B">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GaliCrisp">
<meta property="og:locale" content="${u.locale}">
<meta property="og:locale:alternate" content="${UI[u.other].locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${A}img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${A}img/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="${A}img/apple-touch-icon.png">
<link rel="manifest" href="${A}../site.webmanifest">
<link rel="preload" href="${A}fonts/playfair-display-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${A}fonts/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
${lang === 'pl' ? `<link rel="preload" href="${A}fonts/playfair-display-latin-ext-600-normal.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="preload" href="${A}fonts/barlow-latin-ext-400-normal.woff2" as="font" type="font/woff2" crossorigin>` : ''}
<link rel="stylesheet" href="${A}css/site.css?v=${V}">
${preloadHero ? `<link rel="preload" as="image" href="${A}img/hero/cover.webp" imagesrcset="${A}img/hero/cover-768.webp 768w, ${A}img/hero/cover-1280.webp 1280w, ${A}img/hero/cover.webp 1920w" imagesizes="100vw" fetchpriority="high">` : ''}
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [org(), website(lang), ...ld] })}</script>
<!-- Google Tag Manager (${SITE.ga}): włączyć po wdrożeniu banera zgód (Consent Mode v2) -->
</head>`;
}

function header(key, lang) {
  const u = UI[lang], A = assetRel(key, lang), r = k => rel(key, lang, k);
  const cats = CAT_ORDER.map(c => `<li><a href="${r(c)}" style="--c:${CATS[c].color}"><span class="dot" aria-hidden="true"></span>${esc(CATS[c][lang].name)}</a></li>`).join('');
  const cur = k => (k === key ? ' aria-current="page"' : '');
  return `<body>
<a class="skip" href="#main">${u.skip}</a>
<header class="site-head" data-head>
  <div class="wrap head-row">
    <a class="logo" href="${r('home')}" aria-label="GaliCrisp, ${u.home}"><img src="${A}img/logo-galicrisp.svg" alt="GaliCrisp" width="148" height="66"></a>
    <nav class="nav" id="menu" aria-label="${lang === 'pl' ? 'Główna' : 'Main'}" data-nav>
      <ul class="nav-list">
        <li class="has-sub"><button class="nav-btn" type="button" aria-expanded="false" aria-controls="sub-products" data-sub>${u.nav.products}<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>
          <ul class="sub" id="sub-products">${cats}</ul></li>
        <li><a href="${r('pl')}"${cur('pl')}>${u.nav.pl}</a></li>
        <li><a href="${r('export')}"${cur('export')}>${u.nav.export}</a></li>
        <li><a href="${r('quality')}"${cur('quality')}>${u.nav.quality}</a></li>
        <li><a href="${r('about')}"${cur('about')}>${u.nav.about}</a></li>
        <li><a href="${r('contact')}"${cur('contact')}>${u.nav.contact}</a></li>
      </ul>
      <div class="nav-end">
        <a class="lang" href="${rel(key, lang, key, u.other)}" hreflang="${u.other}" lang="${u.other}"><span aria-hidden="true">${u.switchShort}</span><span class="vh">${u.otherLabel}</span></a>
        <a class="btn btn-sm" href="${r('contact')}#formularz">${u.cta}</a>
      </div>
    </nav>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu><span class="bars" aria-hidden="true"></span><span class="vh">${u.menu}</span></button>
  </div>
</header>`;
}

function footer(key, lang) {
  const u = UI[lang], A = assetRel(key, lang), r = k => rel(key, lang, k), y = 2026;
  const cats = CAT_ORDER.map(c => `<li><a href="${r(c)}">${esc(CATS[c][lang].name)}</a></li>`).join('');
  return `<footer class="site-foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <img src="${A}img/logo-galicrisp.svg" alt="GaliCrisp" width="150" height="66" loading="lazy">
      <p class="tagline">Bake Beyond</p>
      <p>${u.footerAbout}</p>
    </div>
    <nav aria-label="${u.footerProducts}"><h2 class="foot-h">${u.footerProducts}</h2><ul>${cats}</ul></nav>
    <nav aria-label="${u.footerCompany}"><h2 class="foot-h">${u.footerCompany}</h2><ul>
      <li><a href="${r('pl')}">${u.nav.pl}</a></li><li><a href="${r('export')}">${u.nav.export}</a></li>
      <li><a href="${r('quality')}">${u.nav.quality}</a></li><li><a href="${r('about')}">${u.nav.about}</a></li></ul></nav>
    <div><h2 class="foot-h">${u.footerContact}</h2>
      <address>${SITE.company}<br>${SITE.street}<br>${SITE.postcode} ${SITE.city}<br>
      <a href="tel:${SITE.phoneHref}">${SITE.phone}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a><br>${u.nipLabel}: ${SITE.nip}</address>
      <p class="social"><a href="${SITE.linkedin}" rel="noopener">LinkedIn</a><a href="${SITE.facebook}" rel="noopener">Facebook</a></p>
    </div>
  </div>
  <div class="wrap foot-base"><p>© ${y} ${SITE.company} ${u.rights}</p><p><a href="${SITE.url}/${lang}/${lang === 'pl' ? 'polityka-prywatnosci' : 'privacy-policy'}/">${u.privacy}</a></p></div>
</footer>
<script src="${A}js/site.js?v=${V}" defer></script>
</body>
</html>`;
}

const crumbNav = (key, lang, trail) => `<nav class="crumbs" aria-label="${lang === 'pl' ? 'Okruszki' : 'Breadcrumb'}"><ol>${trail.map(([n, k], i) => i < trail.length - 1 ? `<li><a href="${rel(key, lang, k)}">${esc(n)}</a></li>` : `<li aria-current="page">${esc(n)}</li>`).join('')}</ol></nav>`;

const faqBlock = (faq, lang, id = 'faq') => `<section class="band band-paper" id="${id}" aria-labelledby="${id}-h"><div class="wrap faq-wrap">
  <h2 id="${id}-h" class="h2">${UI[lang].faq}</h2>
  <div class="faq">${faq.map(([q, a]) => `<details><summary><span>${esc(q)}</span><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 6.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></summary><p>${esc(a)}</p></details>`).join('')}</div>
</div></section>`;

const ctaBand = (key, lang, title, body, btn) => `<section class="band band-red cta-band"><div class="wrap cta-row">
  <div><h2 class="h2">${esc(title)}</h2><p>${esc(body)}</p></div>
  <div class="cta-actions"><a class="btn btn-light" href="${rel(key, lang, 'contact')}#formularz">${esc(btn)}</a><a class="link-light" href="mailto:${SITE.email}">${SITE.email}</a></div>
</div></section>`;

function packCard(item, line, lang, A, eager = false) {
  const u = UI[lang];
  const alt = lang === 'pl' ? `GaliCrisp ${line.pl[0]}, ${item.pl.toLowerCase()}` : `GaliCrisp ${line.en[0]}, ${item.en}`;
  return `<article class="pack">
  <div class="stage" data-tilt><span class="beam" aria-hidden="true"></span><img src="${A}img/p/${item.img}.webp" alt="${esc(alt)}" ${dim('p/' + item.img + '.webp')} loading="${eager ? 'eager' : 'lazy'}" decoding="async"><span class="floor" aria-hidden="true"></span></div>
  <h3 class="pack-name">${esc(lang === 'pl' ? item.pl : item.en)}</h3>
  <p class="pack-meta">${lang === 'pl' ? `${u.onPack}: ${esc(item.en)}<br>` : ''}${u.ean} <span class="num">${item.ean}</span></p>
</article>`;
}

function logTable(line, lang) {
  const u = UI[lang], g = line.log;
  const shelf = String(g.shelf).replace('*', '');
  const vals = [u.face[g.face - 1], `${g.dims} mm`, g.units, g.perLayer, g.layers, g.cartons, g.pallet, `${lang === 'en' ? g.height.replace(',', '.') : g.height} m`, `${shelf} ${u.days}${String(g.shelf).includes('*') ? '*' : ''}`];
  const note = String(g.shelf).includes('*') ? `<p class="note">* ${lang === 'pl' ? 'testy dla 360 dni w toku' : '360 days testing in progress'}</p>` : '';
  return `<details class="log"><summary>${u.logistics}<svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 6.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></summary>
  <div class="scroll"><table class="stack"><thead><tr>${u.log.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody><tr>${vals.map(v => `<td>${v}</td>`).join('')}</tr></tbody></table></div>${note}</details>`;
}

function productLd(line, item, lang, catName) {
  return { '@type': 'Product', name: `GaliCrisp ${line.en[0]} ${item.en}`, alternateName: lang === 'pl' ? `${line.pl[0]} ${item.pl}` : undefined,
    brand: { '@type': 'Brand', name: 'GaliCrisp' }, manufacturer: { '@id': ORG_ID }, gtin13: item.ean, category: catName,
    image: `${SITE.url}/assets/img/p/${item.img}.webp`, description: line[lang][1],
    weight: { '@type': 'QuantitativeValue', value: line.weight, unitCode: 'GRM' } };
}

/* ---------------- page builders ---------------- */
function pageHome(lang) {
  const key = 'home', t = T[lang], u = UI[lang], A = assetRel(key, lang), r = k => rel(key, lang, k);
  const [title, desc] = META.home[lang];
  const url = absUrl(key, lang);
  let h = head({ key, lang, title, desc, preloadHero: true, ld: [{ '@type': 'WebPage', '@id': url, url, name: title, inLanguage: lang, isPartOf: { '@id': `${SITE.url}/#website` }, about: { '@id': ORG_ID } }, faqLd(t.faq, url)] });
  h += header(key, lang);
  const plural = (n, one, few, many) => (n === 1 ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many);
  const reel = CAT_ORDER.map((c, i) => {
    const C = CATS[c], cl = C[lang];
    const ids = C.lines;
    const nl = ids.length, np = ids.reduce((a, id) => a + lineById[id].items.length, 0);
    const count = lang === 'pl' ? `${nl} ${plural(nl, 'linia', 'linie', 'linii')}, ${np} ${plural(np, 'produkt', 'produkty', 'produktów')}` : `${nl} ${nl === 1 ? 'line' : 'lines'}, ${np} products`;
    return `<li class="cat-card" style="--c:${C.color};--i:${i}"><a href="${r(c)}" aria-describedby="cat-${c}-d">
      <span class="cat-img">${fan(c, A)}<span class="cat-shine" aria-hidden="true"></span></span>
      <span class="cat-body"><span class="cat-name">${esc(cl.name)}</span><span class="cat-count">${count}</span><span class="cat-lead" id="cat-${c}-d">${esc(cl.lead)}</span><span class="cat-go">${u.viewRange}<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h11M10 4.5L14.5 9 10 13.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span></span></a></li>`;
  }).join('');
  h += `<main id="main">
<section class="hero" data-hero aria-labelledby="hero-h">
  <div class="hero-sticky">
    <div class="hero-stage" data-hero3d data-assets="${A}">
      <img class="hero-fallback" src="${A}img/hero/cover.webp" srcset="${A}img/hero/cover-768.webp 768w, ${A}img/hero/cover-1280.webp 1280w, ${A}img/hero/cover.webp 1920w" sizes="100vw" alt="" ${dim('hero/cover.webp')} fetchpriority="high">
      <canvas class="hero-canvas" aria-hidden="true"></canvas>
      <span class="grain" aria-hidden="true"></span><span class="vignette" aria-hidden="true"></span>
      <span class="letterbox top" aria-hidden="true"></span><span class="letterbox bottom" aria-hidden="true"></span>
    </div>
    <div class="wrap hero-copy" data-enter>
      <h1 id="hero-h"><span class="h1-kicker">${esc(t.heroKicker)}</span><span class="h1-display">${esc(t.heroDisplay[0])}<br><em>${esc(t.heroDisplay[1])}</em></span></h1>
      <p class="hero-lead">${esc(t.heroLead)}</p>
      <div class="hero-actions"><a class="btn btn-light" href="#kategorie">${u.viewRange}</a><a class="btn btn-ghost" href="${r('pl')}">${u.askPL}</a></div>
    </div>
    <p class="hero-sign" aria-hidden="true">Bake Beyond</p>
  </div>
</section>
<section class="band band-night facts" aria-label="${lang === 'pl' ? 'GaliCrisp w liczbach' : 'GaliCrisp in numbers'}"><div class="wrap"><ul class="fact-row">${t.facts.map(([n, l]) => `<li><span class="fact-n">${n}</span><span class="fact-l">${esc(l)}</span></li>`).join('')}</ul></div></section>
<section class="cats" id="kategorie" data-cats aria-labelledby="reel-h">
  <span class="cats-spot" aria-hidden="true"></span>
  <div class="wrap">
    <div class="cats-head"><h2 id="reel-h" class="h2">${esc(t.reelTitle)}</h2><p>${esc(t.reelLead)}</p></div>
    <ul class="cat-grid">${reel}</ul>
  </div>
</section>
<section class="band band-paper protein" aria-labelledby="protein-h"><div class="wrap split">
  <div class="split-text"><p class="badge-27" aria-hidden="true"><span>27</span>g</p><h2 id="protein-h" class="h2">${esc(t.proteinTitle)}</h2><p>${esc(t.proteinBody)}</p><a class="btn" href="${r('crisp')}#protein-180">${esc(t.proteinCta)}</a></div>
  <div class="duo">${lineById['protein-180'].items.map(it => packCard(it, lineById['protein-180'], lang, A)).join('')}</div>
</div></section>
<section class="band band-wine pl-band" aria-labelledby="pl-h"><div class="wrap">
  <div class="pl-head"><h2 id="pl-h" class="h2">${esc(t.plTitle)}</h2><p>${esc(t.plBody)}</p><a class="btn btn-light" href="${r('pl')}">${u.nav.pl}</a></div>
  <ol class="steps">${t.plSteps.map(([a, b], i) => `<li><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></li>`).join('')}</ol>
</div></section>
<section class="band band-paper quality" aria-labelledby="q-h"><div class="wrap q-grid">
  <div><h2 id="q-h" class="h2">${esc(t.qTitle)}</h2><p>${esc(t.qBody)}</p><a class="text-link" href="${r('quality')}">${lang === 'pl' ? 'Certyfikaty i jakość' : 'Certificates and quality'}</a></div>
  <ul class="certs">${t.certs.map(([a, b]) => `<li><span class="cert-name">${a}</span><span class="cert-l">${esc(b).replace('PL-EKO-07', '<span class="nw">PL-EKO-07</span>')}</span></li>`).join('')}</ul>
  <img class="q-plate" src="${A}img/plate.webp" alt="${lang === 'pl' ? 'Pieczywo chrupkie GaliCrisp z figami i winogronami' : 'GaliCrisp crispbread served with figs and grapes'}" ${dim('plate.webp')} loading="lazy">
</div></section>
${faqBlock(t.faq, lang)}
${ctaBand(key, lang, t.ctaTitle, t.ctaBody, u.cta)}
</main>`;
  h += footer(key, lang);
  return h;
}

function pageCategory(lang, c) {
  const key = c, C = CATS[c], cl = C[lang], u = UI[lang], A = assetRel(key, lang), r = k => rel(key, lang, k);
  const [title, desc] = META[c][lang];
  const url = absUrl(key, lang);
  const trail = [[u.home, 'home']];
  trail.push([cl.name, key]);
  const lines = C.lines.map(id => lineById[id]);
  const items = lines.flatMap(l => l.items.map(it => productLd(l, it, lang, cl.name)));
  let h = head({ key, lang, title, desc, ld: [
    { '@type': 'CollectionPage', '@id': url, url, name: cl.h1, description: desc, inLanguage: lang, isPartOf: { '@id': `${SITE.url}/#website` },
      mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: p })) } },
    crumbs(trail.map(([n, k]) => [n, absUrl(k, lang)])), faqLd(cl.faq, url)] });
  h += header(key, lang);
  const sub = C.sub ? `<a class="sub-link" href="${r(C.sub)}" style="--c:${CATS[C.sub].color}"><img src="${A}img/p/flatbread-sesame-beetroot.webp" alt="" ${dim('p/flatbread-sesame-beetroot.webp')} loading="lazy"><span><strong>${esc(CATS[C.sub][lang].name)}</strong> ${esc(CATS[C.sub][lang].lead)}</span></a>` : '';
  const others = CAT_ORDER.filter(x => x !== c).map(x => `<li><a href="${r(x)}" style="--c:${CATS[x].color}">${fan(x, A, 'fan-sm')}<span>${esc(CATS[x][lang].name)}</span></a></li>`).join('');
  h += `<main id="main">
<section class="cat-hero" style="--c:${C.color}" aria-labelledby="h1">
  <div class="wrap cat-hero-grid">
    <div class="cat-hero-text" data-enter>${crumbNav(key, lang, trail)}<h1 id="h1" class="h1">${esc(cl.h1)}</h1><p class="lead">${esc(cl.lead)}</p>
      <ul class="jump">${lines.map(l => `<li><a href="#${l.id}">${esc(l[lang][0])}</a></li>`).join('')}</ul></div>
    <div class="screen" data-screen aria-hidden="true"><span class="projector"></span><div class="screen-frame">${fan(c, A, 'fan-lg').replace(/data-src=/g, 'src=')}</div></div>
  </div>
</section>
<section class="band band-paper intro"><div class="wrap intro-grid">${cl.body.map(p => `<p>${esc(p)}</p>`).join('')}${sub}</div></section>
${lines.map((l, li) => `<section class="band ${li % 2 ? 'band-cream' : 'band-paper'} line" id="${l.id}" aria-labelledby="${l.id}-h" style="--c:${C.color}">
  <div class="wrap"><div class="line-head"><h2 id="${l.id}-h" class="h2">${esc(l[lang][0])}</h2><p>${esc(l[lang][1])}${l.slices ? ` <span class="chip">${l.slices} ${u.slices}</span>` : ''}</p></div>
  <div class="packs packs-${Math.min(l.items.length, 6)}">${l.items.map((it, i) => packCard(it, l, lang, A, li === 0 && i < 3)).join('')}</div>
  ${logTable(l, lang)}</div></section>`).join('\n')}
${faqBlock(cl.faq, lang)}
<section class="band band-night others" aria-labelledby="others-h"><div class="wrap"><h2 id="others-h" class="h2">${u.seeAlso}</h2><ul class="other-cats">${others}</ul></div></section>
${ctaBand(key, lang, u.sampleCta[0], u.sampleCta[1], u.sampleCta[2])}
</main>`;
  h += footer(key, lang);
  return h;
}

function pageText(lang, key) {
  const u = UI[lang], A = assetRel(key, lang), pc = PAGE_COPY[lang][key];
  const [title, desc] = META[key][lang];
  const url = absUrl(key, lang);
  const trail = [[u.home, 'home'], [u.nav[key] || pc.h1, key]];
  const type = { about: 'AboutPage', contact: 'ContactPage' }[key] || 'WebPage';
  const extraFaq = key === 'pl' || key === 'export' ? T[lang].faq.filter((_, i) => [0, 4, 5, 1].includes(i)) : null;
  let h = head({ key, lang, title, desc, ld: [{ '@type': type, '@id': url, url, name: pc.h1, description: desc, inLanguage: lang, isPartOf: { '@id': `${SITE.url}/#website` }, about: { '@id': ORG_ID } }, crumbs(trail.map(([n, k]) => [n, absUrl(k, lang)])), ...(extraFaq ? [faqLd(extraFaq, url)] : [])] });
  h += header(key, lang);
  const visual = {
    pl: `<div class="tp-visual tp-packs" aria-hidden="true"><img src="${A}img/p/crispbread-180-5-grains.webp" alt="" ${dim('p/crispbread-180-5-grains.webp')}><img src="${A}img/p/crackers-100-sourdough.webp" alt="" ${dim('p/crackers-100-sourdough.webp')}><img src="${A}img/p/crispies-gouda.webp" alt="" ${dim('p/crispies-gouda.webp')}></div>`,
    export: `<div class="tp-visual"><div class="tp-cat">${fan('crisp', A, 'fan-lg')}</div></div>`,
    quality: `<div class="tp-visual tp-seal" aria-hidden="true"><span>BRCGS</span><strong>A+</strong></div>`,
    about: `<div class="tp-visual"><img class="tp-plate" src="${A}img/plate.webp" alt="${lang === 'pl' ? 'Pieczywo chrupkie GaliCrisp na talerzu z figami' : 'GaliCrisp crispbread on a plate with figs'}" ${dim('plate.webp')}></div>`,
    contact: '',
  }[key];
  let body = '';
  if (key === 'contact') {
    const f = FORM[lang];
    body = `<section class="band band-paper" id="formularz" aria-labelledby="form-h"><div class="wrap contact-grid">
  <form class="form" data-form novalidate data-ok="${esc(f.ok)}" data-req="${esc(f.req)}" data-bad="${esc(f.bad)}" data-to="${SITE.email}">
    <h2 id="form-h" class="h2">${lang === 'pl' ? 'Zapytanie ofertowe' : 'Request a quote'}</h2>
    <div class="field"><label for="f-name">${f.name}</label><input id="f-name" name="name" autocomplete="name" required><p class="err" id="e-name"></p></div>
    <div class="field"><label for="f-company">${f.company}</label><input id="f-company" name="company" autocomplete="organization" required><p class="err" id="e-company"></p></div>
    <div class="field"><label for="f-email">${f.email}</label><input id="f-email" name="email" type="email" autocomplete="email" required><p class="err" id="e-email"></p></div>
    <div class="field"><label for="f-country">${f.country}</label><input id="f-country" name="country" autocomplete="country-name"></div>
    <div class="field"><label for="f-topic">${f.topic}</label><select id="f-topic" name="topic">${f.topics.map(o => `<option>${o}</option>`).join('')}</select></div>
    <div class="field field-wide"><label for="f-msg">${f.msg}</label><textarea id="f-msg" name="msg" rows="5" placeholder="${f.msgHint}" required></textarea><p class="err" id="e-msg"></p></div>
    <div class="field-wide"><button class="btn" type="submit">${f.send}</button><p class="form-ok" role="status" aria-live="polite"></p><p class="form-legal">${f.legal}</p></div>
  </form>
  <aside class="contact-card" aria-labelledby="cc-h"><h2 id="cc-h" class="h3">${f.data}</h2>
    <address>${SITE.company}<br>${SITE.street}<br>${SITE.postcode} ${SITE.city}, ${lang === 'pl' ? 'Polska' : 'Poland'}</address>
    <dl><dt>${f.office}</dt><dd><a href="tel:${SITE.phoneHref}">${SITE.phone}</a></dd><dt>${f.mail}</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd><dt>${u.nipLabel}</dt><dd>${SITE.nip}</dd></dl>
  </aside>
</div></section>`;
  } else {
    body = `<section class="band band-paper"><div class="wrap tp-sections">${pc.sections.map(([a, b]) => `<article><h2 class="h3">${esc(a)}</h2><p>${esc(b)}</p></article>`).join('')}</div></section>`;
    if (key === 'pl') body += `<section class="band band-wine pl-band"><div class="wrap"><div class="pl-head"><h2 class="h2">${lang === 'pl' ? 'Jak prowadzimy projekt private label' : 'How a private label project runs'}</h2></div><ol class="steps">${T[lang].plSteps.map(([a, b], i) => `<li><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></li>`).join('')}</ol></div></section>`;
    if (key === 'quality' || key === 'about') body += `<section class="band band-night facts"><div class="wrap"><ul class="fact-row">${T[lang].facts.map(([n, l]) => `<li><span class="fact-n">${n}</span><span class="fact-l">${esc(l)}</span></li>`).join('')}</ul></div></section>`;
    if (key === 'pl' || key === 'export') body += `<section class="band band-cream"><div class="wrap"><h2 class="h2">${lang === 'pl' ? 'Kategorie dostępne w private label' : 'Categories available as private label'}</h2><ul class="other-cats on-light">${CAT_ORDER.map(x => `<li><a href="${rel(key, lang, x)}" style="--c:${CATS[x].color}">${fan(x, A, 'fan-sm')}<span>${esc(CATS[x][lang].name)}</span></a></li>`).join('')}</ul></div></section>`;
    if (extraFaq) body += faqBlock(extraFaq, lang);
    body += ctaBand(key, lang, T[lang].ctaTitle, T[lang].ctaBody, u.cta);
  }
  h += `<main id="main">
<section class="page-hero${visual ? '' : ' no-visual'}" aria-labelledby="h1"><div class="wrap page-hero-grid">
  <div data-enter>${crumbNav(key, lang, trail)}<h1 id="h1" class="h1">${esc(pc.h1)}</h1><p class="lead">${esc(pc.lead)}</p></div>${visual}
</div></section>
${body}
</main>`;
  h += footer(key, lang);
  return h;
}

/* ---------------- write ---------------- */
function write(rp, html) {
  const f = path.join(OUT, rp);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}
const all = [];
for (const lang of LANGS) {
  write(`${lang}/index.html`, pageHome(lang)); all.push(['home', lang]);
  for (const c of CAT_ORDER) { write(`${urlPath(c, lang)}index.html`, pageCategory(lang, c)); all.push([c, lang]); }
  for (const k of ['pl', 'export', 'quality', 'about', 'contact']) { write(`${urlPath(k, lang)}index.html`, pageText(lang, k)); all.push([k, lang]); }
}
// root: language entry (server should 301 / -> /pl/; this page is the static fallback)
write('index.html', `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"><title>GaliCrisp</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${SITE.url}/pl/"><meta http-equiv="refresh" content="0; url=pl/${PREVIEW ? 'index.html' : ''}"><script>location.replace('pl/${PREVIEW ? 'index.html' : ''}'+location.hash)</script></head><body><a href="pl/${PREVIEW ? 'index.html' : ''}">GaliCrisp</a></body></html>`);
const BASE = new URL(SITE.url).pathname.replace(/\/$/, '');
write('404.html', `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404 | GaliCrisp</title><meta name="robots" content="noindex"><link rel="stylesheet" href="${BASE}/assets/css/site.css?v=${V}"></head><body class="e404"><main class="wrap"><img src="${BASE}/assets/img/logo-galicrisp.svg" alt="GaliCrisp" width="180" height="80"><h1 class="h1">Tej strony nie ma. This page is gone.</h1><p><a class="btn" href="${BASE}/pl/">Strona główna</a> <a class="btn btn-ghost-dark" href="${BASE}/en/">Home page</a></p></main></body></html>`);
const lastmod = '2026-11-17';
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${all.map(([k, l]) => `<url><loc>${absUrl(k, l)}</loc><lastmod>${lastmod}</lastmod><xhtml:link rel="alternate" hreflang="pl" href="${absUrl(k, 'pl')}"/><xhtml:link rel="alternate" hreflang="en" href="${absUrl(k, 'en')}"/><xhtml:link rel="alternate" hreflang="x-default" href="${absUrl(k, 'en')}"/></url>`).join('\n')}
</urlset>`);
write('robots.txt', NOINDEX ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
write('site.webmanifest', JSON.stringify({ name: 'GaliCrisp', short_name: 'GaliCrisp', start_url: '/pl/', display: 'browser', background_color: '#FFFBF5', theme_color: '#B5122B', icons: [{ src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 1));
write('.htaccess', `# GaliCrisp: przekierowania i nagłówki (Apache)
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
RewriteEngine On
# https + www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} !^www\\. [NC]
RewriteRule ^ https://www.${SITE.url.replace(/^https?:\/\/(www\.)?/, '')}%{REQUEST_URI} [L,R=301]
# root -> /pl/
RewriteRule ^$ /pl/ [L,R=301]
# */index.html -> */ (jeden adres kanoniczny)
RewriteCond %{THE_REQUEST} \s/+(.*/)?index\.html[\s?] [NC]
RewriteRule ^ /%1 [L,R=301]
# stare adresy -> nowe (uzupełnić pełną listę z crawla przed wdrożeniem)
RewriteRule ^produkty/kategoria/pieczywo-chrupkie-1/?$ /pl/pieczywo-chrupkie/ [L,R=301]
RewriteRule ^produkty/lista/pieczywko/.*$ /pl/pieczywka/ [L,R=301]
RewriteRule ^products/category/crispbread-1/?$ /en/crispbread/ [L,R=301]
RewriteRule ^products/category/savoury-bisquits/?$ /en/savoury-biscuits/ [L,R=301]
RewriteRule ^private-label-pl/?$ /pl/private-label/ [L,R=301]
RewriteRule ^private-label-en/?$ /en/private-label/ [L,R=301]
RewriteRule ^b2b-pl/?$ /pl/eksport-b2b/ [L,R=301]
RewriteRule ^b2b-en/?$ /en/export-b2b/ [L,R=301]
RewriteRule ^jakosc/?$ /pl/jakosc-certyfikaty/ [L,R=301]
RewriteRule ^o-nas/?$ /pl/o-nas/ [L,R=301]
RewriteRule ^kontakt/?$ /pl/kontakt/ [L,R=301]
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/webp "access plus 1 year"
ExpiresByType image/svg+xml "access plus 1 year"
ExpiresByType text/css "access plus 1 year"
ExpiresByType application/javascript "access plus 1 year"
ExpiresByType text/html "access plus 0 seconds"
</IfModule>
<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/xml text/plain
</IfModule>
`);
console.log(`built ${all.length} pages into ${OUT}${PREVIEW ? ' (preview links)' : ''}`);
