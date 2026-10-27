// Dati centrali del sito (contatti + SEO di base). Modificabili qui.
export const SITE = {
  name: 'Laura Romanò Architetto',
  domain: (import.meta.env.SITE || 'https://www.lauraromano.net').replace(/\/$/, ''),
  email: 'lrarchitettura@gmail.com',
  tel: '+39 02 45390819',
  cell: '+39 335 7093768',
  vat: '11733280157',
  address: { street: 'Via A. Salaino, 7', zip: '20144', city: 'Milano', country: 'IT' },
  ogImage: '/website/wp-content/uploads/2022/02/expo_pavilion_1.jpg',
  // Endpoint del form contatti: sostituire con il proprio ID Formspree per attivarlo.
  // [[DA COMPILARE: creare un form su https://formspree.io e incollare qui l'endpoint]]
  formEndpoint: 'https://formspree.io/f/XXXXXXXX',
};
