//#region node_modules/.nitro/vite/services/ssr/assets/realme-CANwfUYe.js
var DEVICE = {
	name: "realme 9 Pro 5G",
	models: "RMX3471 / RMX3472",
	chipset: "Snapdragon 695 5G",
	modem: "X51 5G",
	display: "6,6″ 120 Hz",
	nr: "NSA + SA",
	bands5g: [
		"n1",
		"n3",
		"n5",
		"n7",
		"n8",
		"n20",
		"n28",
		"n38",
		"n40",
		"n41",
		"n77",
		"n78"
	],
	polandBands: [
		"n1",
		"n3",
		"n7",
		"n28",
		"n78"
	]
};
var TUNER_STEPS = [
	{
		id: "smart5g",
		title: "Wyłącz Inteligentne 5G",
		why: "Realme sam zrzuca 5G do LTE, żeby oszczędzić baterię. To najczęstsza przyczyna „wolnego 5G” na 9 Pro.",
		path: "Ustawienia → Karta SIM i dane komórkowe → Inteligentne 5G",
		altPath: "Ustawienia → Karta SIM i dane komórkowe → [SIM] → Inteligentne 5G",
		action: "Wyłącz"
	},
	{
		id: "preferred",
		title: "Typ sieci: 5G/4G/3G/2G auto",
		why: "Wymuszenie „Tylko 4G” blokuje n78. Auto zostawia NSA (5G + LTE kotwica), na którym stoją Play, Orange, Plus i T-Mobile.",
		path: "Ustawienia → Karta SIM i dane komórkowe → [karta z internetem] → Typ sieci preferowany",
		action: "5G/4G/3G/2G (auto)"
	},
	{
		id: "simslot",
		title: "Internet na karcie z 5G",
		why: "Na 9 Pro 5G działa na jednej karcie naraz. Druga SIM spada do LTE/3G. Dane muszą iść z karty operatora 5G.",
		path: "Ustawienia → Karta SIM i dane komórkowe → Dane komórkowe",
		action: "Wybierz SIM z zasięgiem 5G"
	},
	{
		id: "privatedns",
		title: "Włącz Prywatny DNS",
		why: "Android omija wolny DNS operatora. Każda nowa strona oszczędza rundę zapytań — to jedyna zmiana DNS, którą system honoruje bez roota.",
		path: "Ustawienia → Hasło i bezpieczeństwo → Prywatny DNS",
		altPath: "Ustawienia → Dodatkowe ustawienia → Prywatny DNS",
		action: "Nazwa hosta dostawcy — wklej wynik z zakładki DNS"
	},
	{
		id: "datasaver",
		title: "Wyłącz oszczędzanie danych",
		why: "Limiter tnie tło, kompresuje obrazy i wstrzymuje TCP. Na teście prędkości wygląda jak „zepsute 5G”.",
		path: "Ustawienia → Karta SIM i dane komórkowe → Oszczędzanie danych",
		action: "Wyłącz"
	},
	{
		id: "dualchannel",
		title: "Inteligentne dwukanałowe",
		why: "Gdy Wi-Fi jest słabe, Realme skleja Wi-Fi z LTE/5G. Włącz w domu przy kiepskim routerze; wyłącz przy pełnym 5G, żeby nie spadać na wolne Wi-Fi.",
		path: "Ustawienia → Wi-Fi i sieć → Więcej połączeń → Inteligentne dwukanałowe",
		altPath: "Ustawienia → Wi-Fi i sieć → Asystent Wi-Fi",
		action: "Włącz przy słabym Wi-Fi, wyłącz przy czystym 5G"
	},
	{
		id: "volte",
		title: "VoLTE na karcie z danymi",
		why: "Bez VoLTE rozmowa zrzuca modem do 3G i zabiera nośną LTE. Po rozłączeniu radio długo wraca na 5G.",
		path: "Ustawienia → Karta SIM i dane komórkowe → [SIM] → VoLTE",
		action: "Włącz"
	},
	{
		id: "battery",
		title: "Bateria: nie tnij radia",
		why: "Tryb ultra i agresywna optymalizacja usypiają modem (RRC idle). Pierwszy pakiet po odblokowaniu ma wtedy 100–300 ms kary.",
		path: "Ustawienia → Bateria → Tryb zasilania",
		altPath: "Ustawienia → Bateria → Więcej ustawień baterii → Optymalizacja",
		action: "Zrównoważony lub Wysoka wydajność — nie Ultra"
	},
	{
		id: "apn",
		title: "APN IPv4/IPv6",
		why: "Sam IPv4 zmusza operatora do NAT64 i wolniejszego DNS. Dual-stack na 9 Pro działa z polskimi sieciami.",
		path: "Ustawienia → Karta SIM i dane komórkowe → [SIM] → Nazwy punktów dostępu",
		action: "Protokół APN: IPv4/IPv6 — gotowce w sekcji operatorów"
	}
];
var POLAND_5G = [
	{
		operator: "Play",
		nr: "n78 · n1 · n3 · n28",
		note: "NSA na 3,6 GHz (n78) w miastach. 9 Pro łapie n78 bez problemu."
	},
	{
		operator: "Orange",
		nr: "n78 · n1 · n3 · n28",
		note: "NSA, w części miast SA. Zostaw typ sieci na auto."
	},
	{
		operator: "Plus",
		nr: "n78 · n1",
		note: "Mocny n78. Smart 5G na Realme szczególnie chętnie zrzuca Plus do LTE."
	},
	{
		operator: "T-Mobile",
		nr: "n78 · n1 · n3 · n28",
		note: "NSA. Na dwóch kartach ustaw dane na T-Mobile, nie na prepaid bez 5G."
	}
];
//#endregion
export { POLAND_5G as n, TUNER_STEPS as r, DEVICE as t };
