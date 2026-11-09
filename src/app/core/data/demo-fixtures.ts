import {
  FrontendContentEntry,
  FrontendResource,
  UiContentKind,
} from "../../data/frontend.models";
export const DEMO_RESOURCES: readonly FrontendResource[] = [
  {
    id: "demo-room",
    name: "Demo tvorivé laboratórium",
    type: "room",
    capacity: 12,
    description:
      "Ukážkový priestor pre tímové projekty. Údaje nepredstavujú skutočný priestor SmartLabu.",
    equipment: ["Ukážkový projektor", "Pracovné stoly"],
  },
  {
    id: "demo-printer",
    name: "Demo 3D tlačiareň",
    type: "equipment",
    quantity: 2,
    description: "Syntetická položka na overenie rezervácie vybavenia.",
  },
];
export const DEMO_CONTENT: Record<
  UiContentKind,
  readonly FrontendContentEntry[]
> = {
  news: [
    {
      id: "demo-news",
      slug: "vitajte-v-demo-portali",
      title: "Vitajte v demo portáli",
      summary: "Vyskúšajte si spoluprácu a prácu s laboratóriom.",
      body: "Toto je ukážkový článok. Nejde o zverejnenú aktualitu SmartLabu.",
      date: "2026-11-09T10:00:00Z",
      author: "Demo redakcia",
    },
  ],
  projects: [
    {
      id: "demo-project",
      slug: "inteligentne-mesto-demo",
      title: "Inteligentné mesto · demo",
      category: "Digitálna transformácia",
      summary: "Ako by mohol vyzerať spoločný inovačný projekt?",
      body: "Syntetický projekt predstavuje spôsob prezentácie výskumu a spolupráce. Nie je potvrdeným projektom SmartLabu.",
    },
  ],
  events: [
    {
      id: "demo-event",
      slug: "otvorene-laboratorium-demo",
      title: "Otvorené laboratórium · demo",
      summary: "Ukážka podujatia v kalendári.",
      body: "Dátum aj program sú výlučne demonštračné. Registrácia nie je dostupná.",
      date: "2026-12-15T09:00:00Z",
      end: "2026-12-15T11:00:00Z",
      form: "Prezenčne",
      audience: "Študenti",
      partner: "Demo organizátor",
    },
  ],
  partners: [
    {
      id: "demo-partner",
      slug: "ukazkovy-partner",
      title: "Ukážkový partner",
      summary: "Priestor na prezentáciu spolupráce.",
      body: "Táto organizácia je syntetická a nepredstavuje existujúce partnerstvo.",
    },
  ],
  opportunities: [
    {
      id: "demo-opportunity",
      slug: "studentsky-prototyp-demo",
      title: "Študentský prototyp · demo",
      summary: "Vyskúšajte prezentáciu študentskej príležitosti.",
      body: "Ukážková príležitosť, ktorá nie je skutočnou pracovnou ani študijnou ponukou.",
    },
  ],
};
