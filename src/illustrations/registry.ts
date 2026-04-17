import type { ComponentType, SVGProps } from 'react'
import { ApplePodcasts } from './ApplePodcasts'
import { Balicek } from './Balicek'
import { Clanek } from './Clanek'
import { ClanekV2 } from './ClanekV2'
import { ClanekV3 } from './ClanekV3'
import { ClanekWeb } from './ClanekWeb'
import { Clovek } from './Clovek'
import { Dite } from './Dite'
import { Doc } from './Doc'
import { DokumentSchvaleny } from './DokumentSchvaleny'
import { DokumentSTuzkou } from './DokumentSTuzkou'
import { DoporuceniAI } from './DoporuceniAI'
import { EfektivitaAInovace } from './EfektivitaAInovace'
import { Ekonomie } from './Ekonomie'
import { Email } from './Email'
import { GooglePodcasts } from './GooglePodcasts'
import { Gymnazium } from './Gymnazium'
import { Info } from './Info'
import { Info2 } from './Info2'
import { InformaceAKomunikace } from './InformaceAKomunikace'
import { InformatickeMysleni } from './InformatickeMysleni'
import { JakNaDigi } from './JakNaDigi'
import { Kalendar } from './Kalendar'
import { Kompas } from './Kompas'
import { Konference } from './Konference'
import { Konzultace } from './Konzultace'
import { LektorSborovna } from './LektorSborovna'
import { Letaky } from './Letaky'
import { Lokalita } from './Lokalita'
import { Materialy1Stupen } from './Materialy1Stupen'
import { Materialy2Stupen } from './Materialy2Stupen'
import { MaterskaSkola } from './MaterskaSkola'
import { Mise } from './Mise'
import { Mobil } from './Mobil'
import { ModeloveSVP } from './ModeloveSVP'
import { Nic } from './Nic'
import { NovaInformatikaRVPG } from './NovaInformatikaRVPG'
import { Online } from './Online'
import { Operator } from './Operator'
import { Oslava } from './Oslava'
import { OsobniKonzultace } from './OsobniKonzultace'
import { Otazka } from './Otazka'
import { Pdf } from './Pdf'
import { PedagogGymnazium } from './PedagogGymnazium'
import { PedagogMS } from './PedagogMS'
import { PedagogStredniSkola } from './PedagogStredniSkola'
import { PedagogZakladniSkola } from './PedagogZakladniSkola'
import { PedagogZUS } from './PedagogZUS'
import { PlenarniCast } from './PlenarniCast'
import { Podcast } from './Podcast'
import { PodcastAKulateStoly } from './PodcastAKulateStoly'
import { PodminkyAbsolvovani } from './PodminkyAbsolvovani'
import { PodporaKNoveInformatice } from './PodporaKNoveInformatice'
import { PodporaNadani } from './PodporaNadani'
import { PodporaSVP } from './PodporaSVP'
import { PodporaVRegionu } from './PodporaVRegionu'
import { PodporaZakuSeSVP } from './PodporaZakuSeSVP'
import { PotrebujetePoradit } from './PotrebujetePoradit'
import { Pozor } from './Pozor'
import { PrikladPraxe } from './PrikladPraxe'
import { PrikladPraxe2 } from './PrikladPraxe2'
import { Priroda } from './Priroda'
import { ProgramyProSkolniTymy } from './ProgramyProSkolniTymy'
import { ProReditele } from './ProReditele'
import { ProUcitele } from './ProUcitele'
import { Rozcestnik } from './Rozcestnik'
import { RozcestnikPomoci } from './RozcestnikPomoci'
import { Rvp } from './Rvp'
import { Sborovna } from './Sborovna'
import { SdileniZkusenosti } from './SdileniZkusenosti'
import { Senior } from './Senior'
import { Spotify } from './Spotify'
import { Stahnout } from './Stahnout'
import { Start } from './Start'
import { StredniSkola } from './StredniSkola'
import { Student } from './Student'
import { Studium } from './Studium'
import { Technika } from './Technika'
import { Tip } from './Tip'
import { TvorbaAVyjadreni } from './TvorbaAVyjadreni'
import { Tym } from './Tym'
import { UcebniceAMaterialy } from './UcebniceAMaterialy'
import { UcebniceAMaterialy2 } from './UcebniceAMaterialy2'
import { UcebniceInformatiky } from './UcebniceInformatiky'
import { UcimeCizince } from './UcimeCizince'
import { Umeni } from './Umeni'
import { Video } from './Video'
import { VyhodyAbsolvovani } from './VyhodyAbsolvovani'
import { VyuzitiAZapojeni } from './VyuzitiAZapojeni'
import { Webinar } from './Webinar'
import { WebinarAKurzy } from './WebinarAKurzy'
import { Workshop } from './Workshop'
import { YouTube } from './YouTube'
import { ZakladniSkola } from './ZakladniSkola'
import { Zamestnanec } from './Zamestnanec'
import { Zip } from './Zip'
import { Zkusenost } from './Zkusenost'
import { ZpravyAPublikace } from './ZpravyAPublikace'

export const illustrationRegistry = {
	applePodcasts: ApplePodcasts,
	balicek: Balicek,
	clanek: Clanek,
	clanekV2: ClanekV2,
	clanekV3: ClanekV3,
	clanekWeb: ClanekWeb,
	clovek: Clovek,
	dite: Dite,
	doc: Doc,
	dokumentSTuzkou: DokumentSTuzkou,
	dokumentSchvaleny: DokumentSchvaleny,
	doporuceniAI: DoporuceniAI,
	efektivitaAInovace: EfektivitaAInovace,
	ekonomie: Ekonomie,
	email: Email,
	googlePodcasts: GooglePodcasts,
	gymnazium: Gymnazium,
	info: Info,
	info2: Info2,
	informaceAKomunikace: InformaceAKomunikace,
	informatickeMysleni: InformatickeMysleni,
	jakNaDigi: JakNaDigi,
	kalendar: Kalendar,
	kompas: Kompas,
	konference: Konference,
	konzultace: Konzultace,
	lektorSborovna: LektorSborovna,
	letaky: Letaky,
	lokalita: Lokalita,
	materialy1Stupen: Materialy1Stupen,
	materialy2Stupen: Materialy2Stupen,
	materskaSkola: MaterskaSkola,
	mise: Mise,
	mobil: Mobil,
	modeloveSVP: ModeloveSVP,
	nic: Nic,
	novaInformatikaRVPG: NovaInformatikaRVPG,
	online: Online,
	operator: Operator,
	oslava: Oslava,
	osobniKonzultace: OsobniKonzultace,
	otazka: Otazka,
	pdf: Pdf,
	pedagogGymnazium: PedagogGymnazium,
	pedagogMS: PedagogMS,
	pedagogStredniSkola: PedagogStredniSkola,
	pedagogZUS: PedagogZUS,
	pedagogZakladniSkola: PedagogZakladniSkola,
	plenarniCast: PlenarniCast,
	podcast: Podcast,
	podcastAKulateStoly: PodcastAKulateStoly,
	podminkyAbsolvovani: PodminkyAbsolvovani,
	podporaKNoveInformatice: PodporaKNoveInformatice,
	podporaNadani: PodporaNadani,
	podporaSVP: PodporaSVP,
	podporaVRegionu: PodporaVRegionu,
	podporaZakuSeSVP: PodporaZakuSeSVP,
	potrebujetePoradit: PotrebujetePoradit,
	pozor: Pozor,
	prikladPraxe: PrikladPraxe,
	prikladPraxe2: PrikladPraxe2,
	priroda: Priroda,
	proReditele: ProReditele,
	proUcitele: ProUcitele,
	programyProSkolniTymy: ProgramyProSkolniTymy,
	rozcestnik: Rozcestnik,
	rozcestnikPomoci: RozcestnikPomoci,
	rvp: Rvp,
	sborovna: Sborovna,
	sdileniZkusenosti: SdileniZkusenosti,
	senior: Senior,
	spotify: Spotify,
	stahnout: Stahnout,
	start: Start,
	stredniSkola: StredniSkola,
	student: Student,
	studium: Studium,
	technika: Technika,
	tip: Tip,
	tvorbaAVyjadreni: TvorbaAVyjadreni,
	tym: Tym,
	ucebniceAMaterialy: UcebniceAMaterialy,
	ucebniceAMaterialy2: UcebniceAMaterialy2,
	ucebniceInformatiky: UcebniceInformatiky,
	ucimeCizince: UcimeCizince,
	umeni: Umeni,
	video: Video,
	vyhodyAbsolvovani: VyhodyAbsolvovani,
	vyuzitiAZapojeni: VyuzitiAZapojeni,
	webinar: Webinar,
	webinarAKurzy: WebinarAKurzy,
	workshop: Workshop,
	youTube: YouTube,
	zakladniSkola: ZakladniSkola,
	zamestnanec: Zamestnanec,
	zip: Zip,
	zkusenost: Zkusenost,
	zpravyAPublikace: ZpravyAPublikace,
} satisfies Record<string, ComponentType<SVGProps<SVGSVGElement>>>
