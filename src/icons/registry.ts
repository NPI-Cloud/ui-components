import type { ComponentType, SVGProps } from 'react'
import { AppleM, AppleS } from './Apple'
import { ApplePodcastsM, ApplePodcastsS } from './ApplePodcasts'
import { ArrowDoluM, ArrowDoluS } from './ArrowDolu'
import { ArrowDoluSmallM } from './ArrowDoluSmall'
import { ArrowNahoruM, ArrowNahoruS } from './ArrowNahoru'
import { ArrowNahoruSmallM } from './ArrowNahoruSmall'
import { ArrowVlevoM, ArrowVlevoS } from './ArrowVlevo'
import { ArrowVlevoSmallM } from './ArrowVlevoSmall'
import { ArrowVpravoM, ArrowVpravoS } from './ArrowVpravo'
import { ArrowVpravoSmallM } from './ArrowVpravoSmall'
import { CasM, CasS } from './Cas'
import { CheckM, CheckS } from './Check'
import { DlazdiceM, DlazdiceS } from './Dlazdice'
import { DomecekM, DomecekS } from './Domecek'
import { DopisM, DopisS } from './Dopis'
import { ExterniLinkM, ExterniLinkS } from './ExterniLink'
import { FacebookM, FacebookS } from './Facebook'
import { FiltrM, FiltrS } from './Filtr'
import { FotoaparatM, FotoaparatS } from './Fotoaparat'
import { GaleryM, GaleryS } from './Galery'
import { HvezdaM, HvezdaS } from './Hvezda'
import { HvezdaFillM, HvezdaFillS } from './HvezdaFill'
import { InfoM, InfoS } from './Info'
import { InstagramM, InstagramS } from './Instagram'
import { KalendarM, KalendarS } from './Kalendar'
import { KartaM, KartaS } from './Karta'
import { KolacovyGrafM, KolacovyGrafS } from './KolacovyGraf'
import { KomentarM, KomentarS } from './Komentar'
import { KonfiguraceM, KonfiguraceS } from './Konfigurace'
import { KopirovatM, KopirovatS } from './Kopirovat'
import { KosM, KosS } from './Kos'
import { KosikM, KosikS } from './Kosik'
import { LayoutM, LayoutS } from './Layout'
import { LinkedInM, LinkedInS } from './LinkedIn'
import { LokaceM, LokaceS } from './Lokace'
import { LupaM, LupaS } from './Lupa'
import { MapaM, MapaS } from './Mapa'
import { MenuVpravoM, MenuVpravoS } from './MenuVpravo'
import { MinusM, MinusS } from './Minus'
import { NacitaniM, NacitaniS } from './Nacitani'
import { NahratDokumentM, NahratDokumentS } from './NahratDokument'
import { NastaveniM, NastaveniS } from './Nastaveni'
import { NavazaniM, NavazaniS } from './Navazani'
import { ObnovitM, ObnovitS } from './Obnovit'
import { ObrazekM, ObrazekS } from './Obrazek'
import { OdhlasitSeM, OdhlasitSeS } from './OdhlasitSe'
import { OdkazM, OdkazS } from './Odkaz'
import { PalecDoluM, PalecDoluS } from './PalecDolu'
import { PalecNahoruM, PalecNahoruS } from './PalecNahoru'
import { PauzaM, PauzaS } from './Pauza'
import { PlusM, PlusS } from './Plus'
import { PodcastM, PodcastS } from './Podcast'
import { PolozkyM, PolozkyS } from './Polozky'
import { PoslatM, PoslatS } from './Poslat'
import { PosouvaniM, PosouvaniS } from './Posouvani'
import { PrehratM, PrehratS } from './Prehrat'
import { PreskocitM, PreskocitS } from './Preskocit'
import { PripojitM, PripojitS } from './Pripojit'
import { ProfilM, ProfilS } from './Profil'
import { PrumerM, PrumerS } from './Prumer'
import { RaditM, RaditS } from './Radit'
import { SchovatM, SchovatS } from './Schovat'
import { SchuzkaM, SchuzkaS } from './Schuzka'
import { SeznamM, SeznamS } from './Seznam'
import { SipkaDoluM, SipkaDoluS } from './SipkaDolu'
import { SipkaNahoruM, SipkaNahoruS } from './SipkaNahoru'
import { SipkaPlnaDoluM, SipkaPlnaDoluS } from './SipkaPlnaDolu'
import { SipkaVlevoM, SipkaVlevoS } from './SipkaVlevo'
import { SipkaVpravoM, SipkaVpravoS } from './SipkaVpravo'
import { SloupcovyGrafM, SloupcovyGrafS } from './SloupcovyGraf'
import { SlozkaM, SlozkaS } from './Slozka'
import { SouborM, SouborS } from './Soubor'
import { SpotifyM, SpotifyS } from './Spotify'
import { SrdceM, SrdceS } from './Srdce'
import { StahnoutM, StahnoutS } from './Stahnout'
import { StitekM, StitekS } from './Stitek'
import { TaskaM, TaskaS } from './Taska'
import { TelefonM, TelefonS } from './Telefon'
import { TimeM, TimeS } from './Time'
import { TiskM, TiskS } from './Tisk'
import { TuzkaM, TuzkaS } from './Tuzka'
import { TymM, TymS } from './Tym'
import { UkazatM, UkazatS } from './Ukazat'
import { UpozorneniM, UpozorneniS } from './Upozorneni'
import { ViceHorizontalneM, ViceHorizontalneS } from './ViceHorizontalne'
import { ViceVertikalneM, ViceVertikalneS } from './ViceVertikalne'
import { VideoM, VideoS } from './Video'
import { VzdelaniM, VzdelaniS } from './Vzdelani'
import { WifiM, WifiS } from './Wifi'
import { XM, XS } from './X'
import { YouTubeM, YouTubeS } from './YouTube'
import { ZakazaneM, ZakazaneS } from './Zakazane'
import { ZalozkaM, ZalozkaS } from './Zalozka'
import { ZalozkaFillM, ZalozkaFillS } from './ZalozkaFill'
import { ZamecekM, ZamecekS } from './Zamecek'
import { ZavinacM, ZavinacS } from './Zavinac'
import { ZavritM, ZavritS } from './Zavrit'
import { ZavritHranateM, ZavritHranateS } from './ZavritHranate'
import { ZmenaVelikostiM, ZmenaVelikostiS } from './ZmenaVelikosti'
import { ZpetM, ZpetS } from './Zpet'
import { ZpetneM, ZpetneS } from './Zpetne'
import { ZvonekM, ZvonekS } from './Zvonek'
import { ZvukVypnutoM, ZvukVypnutoS } from './ZvukVypnuto'
import { ZvukZapnutoM, ZvukZapnutoS } from './ZvukZapnuto'

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>

export const iconRegistryM = {
	apple: AppleM,
	applePodcasts: ApplePodcastsM,
	arrowDolu: ArrowDoluM,
	arrowDoluSmall: ArrowDoluSmallM,
	arrowNahoru: ArrowNahoruM,
	arrowNahoruSmall: ArrowNahoruSmallM,
	arrowVlevo: ArrowVlevoM,
	arrowVlevoSmall: ArrowVlevoSmallM,
	arrowVpravo: ArrowVpravoM,
	arrowVpravoSmall: ArrowVpravoSmallM,
	cas: CasM,
	check: CheckM,
	dlazdice: DlazdiceM,
	domecek: DomecekM,
	dopis: DopisM,
	externiLink: ExterniLinkM,
	facebook: FacebookM,
	filtr: FiltrM,
	fotoaparat: FotoaparatM,
	galery: GaleryM,
	hvezda: HvezdaM,
	hvezdaFill: HvezdaFillM,
	info: InfoM,
	instagram: InstagramM,
	kalendar: KalendarM,
	karta: KartaM,
	kolacovyGraf: KolacovyGrafM,
	komentar: KomentarM,
	konfigurace: KonfiguraceM,
	kopirovat: KopirovatM,
	kos: KosM,
	kosik: KosikM,
	layout: LayoutM,
	linkedIn: LinkedInM,
	lokace: LokaceM,
	lupa: LupaM,
	mapa: MapaM,
	menuVpravo: MenuVpravoM,
	minus: MinusM,
	nacitani: NacitaniM,
	nahratDokument: NahratDokumentM,
	nastaveni: NastaveniM,
	navazani: NavazaniM,
	obnovit: ObnovitM,
	obrazek: ObrazekM,
	odhlasitSe: OdhlasitSeM,
	odkaz: OdkazM,
	palecDolu: PalecDoluM,
	palecNahoru: PalecNahoruM,
	pauza: PauzaM,
	plus: PlusM,
	podcast: PodcastM,
	polozky: PolozkyM,
	poslat: PoslatM,
	posouvani: PosouvaniM,
	prehrat: PrehratM,
	preskocit: PreskocitM,
	pripojit: PripojitM,
	profil: ProfilM,
	prumer: PrumerM,
	radit: RaditM,
	schovat: SchovatM,
	schuzka: SchuzkaM,
	seznam: SeznamM,
	sipkaDolu: SipkaDoluM,
	sipkaNahoru: SipkaNahoruM,
	sipkaPlnaDolu: SipkaPlnaDoluM,
	sipkaVlevo: SipkaVlevoM,
	sipkaVpravo: SipkaVpravoM,
	sloupcovyGraf: SloupcovyGrafM,
	slozka: SlozkaM,
	soubor: SouborM,
	spotify: SpotifyM,
	srdce: SrdceM,
	stahnout: StahnoutM,
	stitek: StitekM,
	taska: TaskaM,
	telefon: TelefonM,
	time: TimeM,
	tisk: TiskM,
	tuzka: TuzkaM,
	tym: TymM,
	ukazat: UkazatM,
	upozorneni: UpozorneniM,
	viceHorizontalne: ViceHorizontalneM,
	viceVertikalne: ViceVertikalneM,
	video: VideoM,
	vzdelani: VzdelaniM,
	wifi: WifiM,
	x: XM,
	youTube: YouTubeM,
	zakazane: ZakazaneM,
	zalozka: ZalozkaM,
	zalozkaFill: ZalozkaFillM,
	zamecek: ZamecekM,
	zavinac: ZavinacM,
	zavrit: ZavritM,
	zavritHranate: ZavritHranateM,
	zmenaVelikosti: ZmenaVelikostiM,
	zpet: ZpetM,
	zpetne: ZpetneM,
	zvonek: ZvonekM,
	zvukVypnuto: ZvukVypnutoM,
	zvukZapnuto: ZvukZapnutoM,
} satisfies Record<string, SvgComponent>

export const iconRegistryS = {
	apple: AppleS,
	applePodcasts: ApplePodcastsS,
	arrowDolu: ArrowDoluS,
	arrowNahoru: ArrowNahoruS,
	arrowVlevo: ArrowVlevoS,
	arrowVpravo: ArrowVpravoS,
	cas: CasS,
	check: CheckS,
	dlazdice: DlazdiceS,
	domecek: DomecekS,
	dopis: DopisS,
	externiLink: ExterniLinkS,
	facebook: FacebookS,
	filtr: FiltrS,
	fotoaparat: FotoaparatS,
	galery: GaleryS,
	hvezda: HvezdaS,
	hvezdaFill: HvezdaFillS,
	info: InfoS,
	instagram: InstagramS,
	kalendar: KalendarS,
	karta: KartaS,
	kolacovyGraf: KolacovyGrafS,
	komentar: KomentarS,
	konfigurace: KonfiguraceS,
	kopirovat: KopirovatS,
	kos: KosS,
	kosik: KosikS,
	layout: LayoutS,
	linkedIn: LinkedInS,
	lokace: LokaceS,
	lupa: LupaS,
	mapa: MapaS,
	menuVpravo: MenuVpravoS,
	minus: MinusS,
	nacitani: NacitaniS,
	nahratDokument: NahratDokumentS,
	nastaveni: NastaveniS,
	navazani: NavazaniS,
	obnovit: ObnovitS,
	obrazek: ObrazekS,
	odhlasitSe: OdhlasitSeS,
	odkaz: OdkazS,
	palecDolu: PalecDoluS,
	palecNahoru: PalecNahoruS,
	pauza: PauzaS,
	plus: PlusS,
	podcast: PodcastS,
	polozky: PolozkyS,
	poslat: PoslatS,
	posouvani: PosouvaniS,
	prehrat: PrehratS,
	preskocit: PreskocitS,
	pripojit: PripojitS,
	profil: ProfilS,
	prumer: PrumerS,
	radit: RaditS,
	schovat: SchovatS,
	schuzka: SchuzkaS,
	seznam: SeznamS,
	sipkaDolu: SipkaDoluS,
	sipkaNahoru: SipkaNahoruS,
	sipkaPlnaDolu: SipkaPlnaDoluS,
	sipkaVlevo: SipkaVlevoS,
	sipkaVpravo: SipkaVpravoS,
	sloupcovyGraf: SloupcovyGrafS,
	slozka: SlozkaS,
	soubor: SouborS,
	spotify: SpotifyS,
	srdce: SrdceS,
	stahnout: StahnoutS,
	stitek: StitekS,
	taska: TaskaS,
	telefon: TelefonS,
	time: TimeS,
	tisk: TiskS,
	tuzka: TuzkaS,
	tym: TymS,
	ukazat: UkazatS,
	upozorneni: UpozorneniS,
	viceHorizontalne: ViceHorizontalneS,
	viceVertikalne: ViceVertikalneS,
	video: VideoS,
	vzdelani: VzdelaniS,
	wifi: WifiS,
	x: XS,
	youTube: YouTubeS,
	zakazane: ZakazaneS,
	zalozka: ZalozkaS,
	zalozkaFill: ZalozkaFillS,
	zamecek: ZamecekS,
	zavinac: ZavinacS,
	zavrit: ZavritS,
	zavritHranate: ZavritHranateS,
	zmenaVelikosti: ZmenaVelikostiS,
	zpet: ZpetS,
	zpetne: ZpetneS,
	zvonek: ZvonekS,
	zvukVypnuto: ZvukVypnutoS,
	zvukZapnuto: ZvukZapnutoS,
} satisfies Record<string, SvgComponent>
