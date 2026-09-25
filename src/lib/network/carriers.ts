export type ApnProfile = {
  id: string;
  operator: string;
  name: string;
  apn: string;
  user: string;
  password: string;
  mcc: string;
  mnc: string;
  type: string;
  protocol: string;
  auth: string;
  note: string;
};

export const APN_PROFILES: ApnProfile[] = [
  {
    id: "play",
    operator: "Play",
    name: "Play Internet",
    apn: "internet",
    user: "",
    password: "",
    mcc: "260",
    mnc: "06",
    type: "default,supl",
    protocol: "IPv4/IPv6",
    auth: "PAP",
    note: "Działa dla Play i Play NOW. Nie wpisuj loginu.",
  },
  {
    id: "orange",
    operator: "Orange",
    name: "Orange Internet",
    apn: "internet",
    user: "",
    password: "",
    mcc: "260",
    mnc: "03",
    type: "default,supl",
    protocol: "IPv4/IPv6",
    auth: "PAP",
    note: "Ten sam APN dla nju mobile.",
  },
  {
    id: "plus",
    operator: "Plus",
    name: "Plus Internet",
    apn: "plus",
    user: "plusgsm",
    password: "plusgsm",
    mcc: "260",
    mnc: "01",
    type: "default,supl",
    protocol: "IPv4/IPv6",
    auth: "PAP",
    note: "Jeśli nie łapie danych, dodaj drugi APN o nazwie internet bez loginu.",
  },
  {
    id: "tmobile",
    operator: "T-Mobile",
    name: "T-Mobile Internet",
    apn: "internet",
    user: "",
    password: "",
    mcc: "260",
    mnc: "02",
    type: "default,supl",
    protocol: "IPv4/IPv6",
    auth: "PAP",
    note: "Heyah używa tego samego APN.",
  },
];

export function formatApn(profile: ApnProfile): string {
  return [
    `Nazwa: ${profile.name}`,
    `APN: ${profile.apn}`,
    `Użytkownik: ${profile.user || "—"}`,
    `Hasło: ${profile.password || "—"}`,
    `MCC: ${profile.mcc}`,
    `MNC: ${profile.mnc}`,
    `Typ APN: ${profile.type}`,
    `Protokół APN: ${profile.protocol}`,
    `Uwierzytelnianie: ${profile.auth}`,
  ].join("\n");
}
