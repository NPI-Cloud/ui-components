import type { ComponentType, SVGProps } from 'react'
import { Apple } from './Apple'
import { ApplePodcasts } from './ApplePodcasts'
import { ArrowDolu } from './ArrowDolu'
import { ArrowNahoru } from './ArrowNahoru'
import { ArrowVlevo } from './ArrowVlevo'
import { ArrowVpravo } from './ArrowVpravo'
import { Cas } from './Cas'
import { Check } from './Check'
import { Dlazdice } from './Dlazdice'
import { Domecek } from './Domecek'
import { Dopis } from './Dopis'
import { ExterniLink } from './ExterniLink'
import { Facebook } from './Facebook'
import { Filtr } from './Filtr'
import { Fotoaparat } from './Fotoaparat'
import { Galery } from './Galery'
import { Hvezda } from './Hvezda'
import { Info } from './Info'
import { Instagram } from './Instagram'
import { Kalendar } from './Kalendar'
import { Karta } from './Karta'
import { KolacovyGraf } from './KolacovyGraf'
import { Komentar } from './Komentar'
import { Konfigurace } from './Konfigurace'
import { Kopirovat } from './Kopirovat'
import { Kos } from './Kos'
import { Kosik } from './Kosik'
import { Layout } from './Layout'
import { LinkedIn } from './LinkedIn'
import { Lokace } from './Lokace'
import { Lupa } from './Lupa'
import { Mapa } from './Mapa'
import { MenuVpravo } from './MenuVpravo'
import { Minus } from './Minus'
import { Nacitani } from './Nacitani'
import { NahratDokument } from './NahratDokument'
import { Nastaveni } from './Nastaveni'
import { Navazani } from './Navazani'
import { Obnovit } from './Obnovit'
import { Obrazek } from './Obrazek'
import { OdhlasitSe } from './OdhlasitSe'
import { Odkaz } from './Odkaz'
import { PalecDolu } from './PalecDolu'
import { PalecNahoru } from './PalecNahoru'
import { Pauza } from './Pauza'
import { Plus } from './Plus'
import { Podcast } from './Podcast'
import { Polozky } from './Polozky'
import { Poslat } from './Poslat'
import { Posouvani } from './Posouvani'
import { Prehrat } from './Prehrat'
import { Preskocit } from './Preskocit'
import { Pripojit } from './Pripojit'
import { Profil } from './Profil'
import { Prumer } from './Prumer'
import { Radit } from './Radit'
import { Schovat } from './Schovat'
import { Schuzka } from './Schuzka'
import { Seznam } from './Seznam'
import { SipkaDolu } from './SipkaDolu'
import { SipkaNahoru } from './SipkaNahoru'
import { SipkaVlevo } from './SipkaVlevo'
import { SipkaVpravo } from './SipkaVpravo'
import { SloupcovyGraf } from './SloupcovyGraf'
import { Slozka } from './Slozka'
import { Soubor } from './Soubor'
import { Spotify } from './Spotify'
import { Srdce } from './Srdce'
import { Stahnout } from './Stahnout'
import { Stitek } from './Stitek'
import { Taska } from './Taska'
import { Telefon } from './Telefon'
import { Time } from './Time'
import { Tisk } from './Tisk'
import { Tuzka } from './Tuzka'
import { Tym } from './Tym'
import { Ukazat } from './Ukazat'
import { Upozorneni } from './Upozorneni'
import { ViceHorizontalne } from './ViceHorizontalne'
import { ViceVertikalne } from './ViceVertikalne'
import { Video } from './Video'
import { Vzdelani } from './Vzdelani'
import { Wifi } from './Wifi'
import { X } from './X'
import { YouTube } from './YouTube'
import { Zakazane } from './Zakazane'
import { Zalozka } from './Zalozka'
import { ZalozkaFill } from './ZalozkaFill'
import { Zamecek } from './Zamecek'
import { Zavinac } from './Zavinac'
import { Zavrit } from './Zavrit'
import { ZavritHranate } from './ZavritHranate'
import { ZmenaVelikosti } from './ZmenaVelikosti'
import { Zpet } from './Zpet'
import { Zpetne } from './Zpetne'
import { Zvonek } from './Zvonek'
import { ZvukVypnuto } from './ZvukVypnuto'
import { ZvukZapnuto } from './ZvukZapnuto'

export const iconRegistry: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
	apple: Apple,
	applePodcasts: ApplePodcasts,
	arrowDolu: ArrowDolu,
	arrowNahoru: ArrowNahoru,
	arrowVlevo: ArrowVlevo,
	arrowVpravo: ArrowVpravo,
	cas: Cas,
	check: Check,
	dlazdice: Dlazdice,
	domecek: Domecek,
	dopis: Dopis,
	externiLink: ExterniLink,
	facebook: Facebook,
	filtr: Filtr,
	fotoaparat: Fotoaparat,
	galery: Galery,
	hvezda: Hvezda,
	info: Info,
	instagram: Instagram,
	kalendar: Kalendar,
	karta: Karta,
	kolacovyGraf: KolacovyGraf,
	komentar: Komentar,
	konfigurace: Konfigurace,
	kopirovat: Kopirovat,
	kos: Kos,
	kosik: Kosik,
	layout: Layout,
	linkedIn: LinkedIn,
	lokace: Lokace,
	lupa: Lupa,
	mapa: Mapa,
	menuVpravo: MenuVpravo,
	minus: Minus,
	nacitani: Nacitani,
	nahratDokument: NahratDokument,
	nastaveni: Nastaveni,
	navazani: Navazani,
	obnovit: Obnovit,
	obrazek: Obrazek,
	odhlasitSe: OdhlasitSe,
	odkaz: Odkaz,
	palecDolu: PalecDolu,
	palecNahoru: PalecNahoru,
	pauza: Pauza,
	plus: Plus,
	podcast: Podcast,
	polozky: Polozky,
	poslat: Poslat,
	posouvani: Posouvani,
	prehrat: Prehrat,
	preskocit: Preskocit,
	pripojit: Pripojit,
	profil: Profil,
	prumer: Prumer,
	radit: Radit,
	schovat: Schovat,
	schuzka: Schuzka,
	seznam: Seznam,
	sipkaDolu: SipkaDolu,
	sipkaNahoru: SipkaNahoru,
	sipkaVlevo: SipkaVlevo,
	sipkaVpravo: SipkaVpravo,
	sloupcovyGraf: SloupcovyGraf,
	slozka: Slozka,
	soubor: Soubor,
	spotify: Spotify,
	srdce: Srdce,
	stahnout: Stahnout,
	stitek: Stitek,
	taska: Taska,
	telefon: Telefon,
	time: Time,
	tisk: Tisk,
	tuzka: Tuzka,
	tym: Tym,
	ukazat: Ukazat,
	upozorneni: Upozorneni,
	viceHorizontalne: ViceHorizontalne,
	viceVertikalne: ViceVertikalne,
	video: Video,
	vzdelani: Vzdelani,
	wifi: Wifi,
	x: X,
	youTube: YouTube,
	zakazane: Zakazane,
	zalozka: Zalozka,
	zalozkaFill: ZalozkaFill,
	zamecek: Zamecek,
	zavinac: Zavinac,
	zavrit: Zavrit,
	zavritHranate: ZavritHranate,
	zmenaVelikosti: ZmenaVelikosti,
	zpet: Zpet,
	zpetne: Zpetne,
	zvonek: Zvonek,
	zvukVypnuto: ZvukVypnuto,
	zvukZapnuto: ZvukZapnuto,
}

export const iconNames = Object.keys(iconRegistry) as IconName[]
export type IconName = keyof typeof iconRegistry
