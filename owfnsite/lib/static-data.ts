import type { SocialCase, BlogPost } from '../types.ts';

export const STATIC_SOCIAL_CASES: SocialCase[] = [
  {
    id: 'case-1',
    title: {
      en: 'Emergency Medical Supplies for Rural Clinics',
      ro: 'Furnizuri Medicale de Urgență pentru Clinici Rurale',
    },
    description: {
      en: 'Providing essential medical supplies and equipment to underfunded clinics in remote areas, ensuring access to basic healthcare for vulnerable communities.',
      ro: 'Furnizarea de consumabile și echipamente medicale esențiale clinicilor subfinanțate din zone izolate, asigurând accesul la asistență medicală de bază pentru comunitățile vulnerabile.',
    },
    details: {
        en: "Many rural clinics lack basic supplies like bandages, antiseptics, and diagnostic tools. This project aims to deliver kits containing these essentials, along with training for local healthcare workers. Our goal is to equip 10 clinics, serving over 5,000 people.",
        ro: "Multe clinici rurale duc lipsă de consumabile de bază precum bandaje, antiseptice și instrumente de diagnostic. Acest proiect urmărește să livreze truse care conțin aceste elemente esențiale, împreună cu instruire pentru personalul medical local. Scopul nostru este de a echipa 10 clinici, deservind peste 5.000 de persoane.",
    },
    category: 'Health',
    imageUrls: ['https://picsum.photos/seed/health/800/600'],
    goal: 15000,
    donated: 7250,
    country: 'Romania',
    region: 'Maramures',
    beneficiaryCount: 5000,
    createdAt: new Date('2025-08-20T10:00:00Z').toISOString(),
    status: 'active',
  },
  {
    id: 'case-2',
    title: {
      en: 'Digital Learning Kits for Village Schools',
      ro: 'Kituri de Învățare Digitală pentru Școlile Sătești',
    },
    description: {
      en: 'Equipping students in remote village schools with tablets and educational software to bridge the digital divide and provide access to modern learning resources.',
      ro: 'Echiparea elevilor din școlile sătești izolate cu tablete și software educațional pentru a reduce decalajul digital și a oferi acces la resurse de învățare moderne.',
    },
    details: {
        en: "This initiative will provide 200 students across 5 village schools with personal tablets pre-loaded with interactive educational content. We will also provide solar charging stations to ensure the devices remain powered in areas with unreliable electricity.",
        ro: "Această inițiativă va oferi 200 de elevi din 5 școli sătești cu tablete personale pre-încărcate cu conținut educațional interactiv. De asemenea, vom furniza stații de încărcare solare pentru a asigura alimentarea dispozitivelor în zonele cu electricitate nesigură.",
    },
    category: 'Education',
    imageUrls: ['https://picsum.photos/seed/education/800/600'],
    goal: 25000,
    donated: 11300,
    country: 'Romania',
    region: 'Vaslui',
    beneficiaryCount: 200,
    createdAt: new Date('2025-08-15T12:30:00Z').toISOString(),
    status: 'active',
  },
  {
    id: 'case-3',
    title: {
      en: 'Winter Care Packages for the Homeless',
      ro: 'Pachete de Îngrijire de Iarnă pentru Persoanele fără Adăpost',
    },
    description: {
      en: 'Distributing essential winter kits—including warm clothing, blankets, and non-perishable food—to individuals experiencing homelessness during the cold season.',
      ro: 'Distribuirea de pachete esențiale de iarnă—incluzând haine groase, pături și alimente neperisabile—persoanelor fără adăpost în timpul sezonului rece.',
    },
    details: {
        en: "As winter approaches, the homeless population faces severe risks. Each care package contains a thermal blanket, gloves, a hat, socks, and high-energy food items. Our goal is to distribute 500 packages in major urban centers to provide immediate relief.",
        ro: "Pe măsură ce iarna se apropie, populația fără adăpost se confruntă cu riscuri severe. Fiecare pachet de îngrijire conține o pătură termică, mănuși, o căciulă, șosete și alimente bogate în energie. Scopul nostru este de a distribui 500 de pachete în marile centre urbane pentru a oferi ajutor imediat.",
    },
    category: 'Basic Needs',
    imageUrls: ['https://picsum.photos/seed/needs/800/600'],
    goal: 10000,
    donated: 9800,
    country: 'Romania',
    region: 'Bucuresti',
    beneficiaryCount: 500,
    createdAt: new Date('2025-08-10T09:00:00Z').toISOString(),
    status: 'active',
  }
];

export const STATIC_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'welcome-to-the-official-world-family-network',
    title: {
      en: 'Welcome to the Official World Family Network',
      ro: 'Bun Venit la Rețeaua Oficială a Familiei Mondiale',
    },
    content: {
      en: "Today marks the beginning of a new chapter in global solidarity. The Official World Family Network (OWFN) is more than just a project; it's a movement dedicated to leveraging the power of technology for real, tangible good. Our mission is to build a transparent and efficient system for humanitarian aid, connecting compassionate individuals directly with those in need.\n\nPowered by the speed and low cost of the Solana blockchain, we aim to tackle critical issues in healthcare, education, and basic needs. Every contribution, every share, and every voice adds to our collective strength. Join us on this journey to build a better, more equitable world for all. Together, we can create a lasting impact.",
      ro: "Astăzi marchează începutul unui nou capitol în solidaritatea globală. Rețeaua Oficială a Familiei Mondiale (OWFN) este mai mult decât un proiect; este o mișcare dedicată valorificării puterii tehnologiei pentru un bine real, tangibil. Misiunea noastră este de a construi un sistem transparent și eficient pentru ajutorul umanitar, conectând direct persoanele pline de compasiune cu cei aflați în nevoie.\n\nPropulsați de viteza și costurile reduse ale blockchain-ului Solana, ne propunem să abordăm probleme critice în domeniul sănătății, educației și nevoilor de bază. Fiecare contribuție, fiecare distribuire și fiecare voce adaugă la forța noastră colectivă. Alăturați-vă nouă în această călătorie pentru a construi o lume mai bună și mai echitabilă pentru toți. Împreună, putem crea un impact de durată.",
    },
    imageUrl: 'https://picsum.photos/seed/welcome/1200/800',
    authorAddress: '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy', // Admin wallet
    createdAt: new Date('2025-08-01T08:00:00Z').toISOString(),
  },
  {
    id: 'post-2',
    slug: 'transparency-and-trust-our-commitment',
    title: {
      en: 'Transparency and Trust: Our Commitment to You',
      ro: 'Transparență și Încredere: Angajamentul Nostru față de Tine',
    },
    content: {
      en: "At the heart of the OWFN lies a deep commitment to transparency. We believe that for a humanitarian project to be truly effective, its supporters must have complete confidence in how their contributions are used. This is why we chose the Solana blockchain.\n\nEvery donation, every allocation to a social cause, is recorded on an immutable public ledger. Through our Wallet Monitoring Dashboard, you can see in real-time where funds are held. Through our Impact Portal, you will see detailed reports on the projects you help fund. There are no hidden fees, no opaque processes. Just a direct line from your generosity to real-world impact. This is our promise to you, our global family.",
      ro: "În inima OWFN se află un angajament profund pentru transparență. Credem că pentru ca un proiect umanitar să fie cu adevărat eficient, susținătorii săi trebuie să aibă încredere deplină în modul în care sunt utilizate contribuțiile lor. Acesta este motivul pentru care am ales blockchain-ul Solana.\n\nFiecare donație, fiecare alocare către o cauză socială, este înregistrată într-un registru public imuabil. Prin intermediul Panoului nostru de Monitorizare a Portofelelor, puteți vedea în timp real unde sunt păstrate fondurile. Prin Portalul nostru de Impact, veți vedea rapoarte detaliate despre proiectele pe care le ajutați să le finanțați. Nu există taxe ascunse, nu există procese opace. Doar o linie directă de la generozitatea voastră la impactul în lumea reală. Aceasta este promisiunea noastră pentru voi, familia noastră globală.",
    },
    imageUrl: 'https://picsum.photos/seed/trust/1200/800',
    authorAddress: '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy', // Admin wallet
    createdAt: new Date('2025-08-05T14:00:00Z').toISOString(),
  }
];
