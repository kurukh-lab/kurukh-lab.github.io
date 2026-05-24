# Extraction Progress

Resumable checkpoint for the Hahn 1903 dictionary extraction. The **next** session reads the table below, finds the first row whose status is not `extracted` or `front_matter`, and resumes there.

Statuses: `pending` (not started) · `front_matter` (intentional skip) · `extracted` (per-page JSON written) · `failed` (needs retry, see notes).

Pipeline: see [EXTRACTION_PLAN.md](EXTRACTION_PLAN.md). Global JSON: [kurukh_dictionary.json](kurukh_dictionary.json).

| Page | Status | Entries | Updated (UTC date) | Notes |
| ---: | --- | ---: | --- | --- |
| 0001 | front_matter | 0 | 2026-05-23 | Title page |
| 0002 | front_matter | 0 | 2026-05-23 | Publisher / official agents list |
| 0003 | front_matter | 0 | 2026-05-23 | Introductory remarks p.1 |
| 0004 | front_matter | 0 | 2026-05-23 | Introductory remarks p.2 (verb-conjugation key); signed Hahn 16 May 1902 |
| 0005 | extracted | 27 | 2026-05-23 | A short — Abbā → Aḍḍi paddā |
| 0006 | extracted | 31 | 2026-05-23 | Addiyas → Ajjī-leōrā |
| 0007 | extracted | 35 | 2026-05-23 | Ajra'anā → Allā pacnā |
| 0008 | extracted | 34 | 2026-05-23 | Allā iuikhnā → Amm pacnā (Amm + 6 compounds) |
| 0009 | extracted | 36 | 2026-05-23 | Ana → Anū hō (Ana vocative group + finger compounds) |
| 0010 | extracted | 31 | 2026-05-23 | Anūhō malā → Arjha'anā (Argnā has 3 homographs) |
| 0011 | extracted | 39 | 2026-05-23 | Arjhārnā → Atkhā (Asnā bread-types block, Asag'larā 3 homographs) |
| 0012 | extracted | 35 | 2026-05-24 | Atkhā khaṭṭnā → Ayōbābar (Attnā/Ayaṅg/Ayō homographs) |
| 0013 | extracted | 31 | 2026-05-24 | Ā → Āṅgē — start of Ā-long section; Ā has 5 compound forms |
| 0014 | extracted | 32 | 2026-05-24 | Ānkō → Bachnā (end of Ā, start of B); letter boundary, Opus 4.7 used |
| 0015 | extracted | 29 | 2026-05-24 | Bachū → Bagrā; 2 example sentences; Be'ennā homographs (adj/verb) |
| 0016 | extracted | 38 | 2026-05-24 | Bahilā → Balīn tieg'ā (Bai has 2 homographs, Bāgrnā 2 senses; last entry truncated) |
| 0017 | extracted | 28 | 2026-05-24 | Balin calkh'ā → Baigur; Bannā 2 homographs; Bancnā with example |
| 0018 | extracted | 36 | 2026-05-24 | Bāijnā → Baraydī khcool; Barnā sub-entries; Bārnā 2 homographs; Bārī/bārim |
| 0019 | extracted | 37 | 2026-05-24 | Bari → Baur-pūmp; Baugi 2 homographs; batri/batre variants |
| 0020 | extracted | 33 | 2026-05-24 | Bausā → Bēkhnā; Be'enā 2 homographs (copula + stay); Beddnā 2 homographs |
| 0021 | extracted | 34 | 2026-05-24 | Bēl → Bēreṅg bēreṅg; Bēl 3 homographs (yolk/pupil/king); Bēnā 2 homographs |
| 0022 | extracted | 33 | 2026-05-24 | Bēreṅgnā → Bihiri; Bi 2 homographs (egg/grain); Bēs loanword_from:ur |
| 0023 | extracted | 32 | 2026-05-24 | Bihiri → Bindrnā; Bijrnā 2 homographs; Bilonā 2 homographs; Bihau loanword_from:hi |
| 0024 | extracted | 33 | 2026-05-24 | Biṅkō → Birī pāmp; Biṅkō star + 6 compounds; Birdnā 2 homographs; Birī 3 homographs |
| 0025 | extracted | 31 | 2026-05-24 | Birī-tireā → Bodē; Bisrnā/Bistar with examples; Bisst/Biso'e loanword_from:hi |
| 0026 | extracted | 35 | 2026-05-24 | Bōde onnā → Burburi; Bokkhō + 5 compounds; Bu'ī split 3-way; Buḍhī 2 homographs |
| 0027 | extracted | 34 | 2026-05-24 | Burṅrnā → Bhankārnā; Bh. section begins; Buruṅg 2 homographs; Bhaṇḍā 2 homographs |
| 0028 | extracted | 33 | 2026-05-24 | Bhanūār → Bhir; Bhēt'angō 2 homographs (red/brinjal); Bhar makhā variant sagaro |
| 0029 | extracted | 32 | 2026-05-24 | Bhircniṅgā → Cahī; letter transition Bh→C; Cacā + 2 compounds; Bhōnkā variant bhunkā |
| 0030 | extracted | 31 | 2026-05-24 | Cakar → Cambī; Cakar 2 homographs; Cal mannā 2 homographs; Cakī with example |
| 0031 | extracted | 35 | 2026-05-24 | Camkainā → Capal; Cānēṇḍ/Cānmūnd/Cān birdō compounds; Candilā 3 homographs; Candō 2 homographs |
| 0032 | extracted | 33 | 2026-05-24 | Caprnā → Cauk cī'inā; Cār 2 homographs; Caṭam ciṭim with example; Cauk paṭṭā compounds |
| 0033 | extracted | 34 | 2026-05-24 | Caurasī → Cetgar; Cēp 4 compounds/variants; Cērō/Certā/Certā-ullā group; Cētrnā loanword_from:hi |
| 0034 | extracted | 33 | 2026-05-24 | Cī'ā! → Cimbā; Cī'ā! with example; Cic 4 compounds; Cī'inā/Cickā variants; Cimbā 2 homographs |
| 0035 | extracted | 34 | 2026-05-24 | Cimta'anā → Citir injō; Cīkh 2 homographs; Cipu nannā 2 homographs; Cirō-gaḍḍi 2 homographs |
| 0036 | extracted | 28 | 2026-05-24 | Cithī sajnā → Comnā; Cithī sajnā/cithī kaṭnā variants; Cōcā 2 homographs; Cõ̃khnā 2 homographs |
| 0037 | extracted | 29 | 2026-05-24 | Conaiṭī → Cottā; Conhā beloved compounds; Co'onā with example; Corgnā 2 homographs |
| 0038 | extracted | 33 | 2026-05-24 | Cottar-pūmp → Curkha'anā; Coṭṭō rat compounds; Cugul finger compounds; Cukrnā loanword_from:hi |
| 0039 | extracted | 33 | 2026-05-24 | Curkhunjū → Chatārnā; Ch. section begins; Chāchem silent compounds; Chamhē presence compounds |
| 0040 | extracted | 30 | 2026-05-24 | Chāyā → Dagnā; D. section begins; Chindṛnakrnā variant of Chindnā; Dā pronoun-only noun with example |
| 0041 | extracted | 33 | 2026-05-24 | Dag'ē! → Dārhīmissī; start of D; Dahdahrnā/Dahdar compounds; Daṇḍī hymn compounds; Darā 2 homographs |
| 0042 | extracted | 33 | 2026-05-24 | Darkā → Dilnā; Darkā convulsions compounds; Datti decay compounds; Dẽoṛā sorcerer compounds |
| 0043 | extracted | 34 | 2026-05-24 | Dimsā → Dudhi ambnā; Dōhmat guilt compounds; Dolkhnā 2 homographs; Dollō 2 homographs; Dudhī milk compounds |
| 0044 | extracted | 32 | 2026-05-24 | Dudhi ambta'anā → Dhakārnā; start of Dh; Dukku/dhukku concubine compounds; Dumbā wasp compounds; Dhacā straw compounds |
| 0045 | extracted | 34 | 2026-05-24 | Dhakkī → Dhim dhimrā kharkhnā; Dhandhā wonder compounds; Dharā line compounds; Dharmē/Dharmēs God compounds; Dhẽr very compounds |
| 0046 | extracted | 32 | 2026-05-24 | Dhirāba'anā → Ḍaṅgrā; Dh to Ḍ transition; Dhōk example; Ḍaṇḍā/Ḍaṇḍē compounds |
| 0047 | extracted | 31 | 2026-05-24 | Ḍaṅgrā mocnā → Ḍipā; Ḍãṛē sacrifice compounds; Ḍaṭnā 2 homographs; Ḍiṇḍ line 2 homographs |
| 0048 | extracted | 28 | 2026-05-24 | Ḍis → Ḍharka'anā; Ḍ to Ḍh transition; Ḍot'ō/Ḍot'ō malā example; Ḍumbī/Ḍuṇḍlū compounds; Ḍhaṅgar 2 homographs |
| 0049 | extracted | 29 | 2026-05-24 | Ḍharkārnā → Ebsrkā khaddas; Ḍh to E transition; Ḍhēkā/Ḍhiṅkī compounds; Ebsnā prodigal son compounds |
| 0050 | extracted | 29 | 2026-05-24 | Echnā → Eṅgdādas; Eksan/Eksanim/Eksantī variants; Ellnā/Emnā 2 homographs; Embā/Eṅgdas compounds |
| 0051 | extracted | 27 | 2026-05-24 | Eṅgdai → Endrā; Endr has 4 homographs (pronoun, interjection, adverb, conjunction) |
| 0052 | extracted | 33 | 2026-05-24 | Endrā → Erpā nannā; Erkhnā 2 homographs (evacuate bowels / imprison); Erpā house + 6 compounds |
| 0053 | extracted | 31 | 2026-05-24 | Erpā khoṭrnā → Ēkā birī; Ēdnā 2 homographs (show / call); short E to long Ē transition; Ēkā 3 compounds |
| 0054 | extracted | 32 | 2026-05-24 | Ēkā man khatrā ādin hōā → Ēkh; Ēkā compound pronouns/adverbs; Ēkh 3 homographs (shade/departed soul/mercy) |
| 0055 | extracted | 27 | 2026-05-24 | Ēkh → Ēõdā; Ēkh nightmare (4th homograph) and sub-entries; Ēkhnā 2 homographs; Ēkhrnā 2 homographs; Ēõdā 3 homographs |
| 0056 | extracted | 34 | 2026-05-24 | ēõdā ālar → taktaki ērnā; Ēõdā compounds/pronouns; Ēsõnā 2 homographs/variants; Ērnā see/gaze + 11 verb compounds (e.g. mēn ērnā, pāhī ērnā, taktaki ērnā) |
| 0057 | extracted | 30 | 2026-05-24 | ērterkhā'ē → Faric mannā; Ē to F transition; loanwords from Urdu (ēo'aj, ēwaj); Facca'annā/Fadfadrnā/Fadkārnā/Faḍḍā/Faknā/Falaṅgārnā/Falgārnā/Fanfārnā/Farhar/Farrā/Faric |
| 0058 | extracted | 33 | 2026-05-24 | Farsā → Foskō; F; Fasrī/Fasta'anā/Faud/Fauhem/Fesfesrnā/Fiknā/Fin/Fin hõ/Firī/Fōfar/Foksā/Fōnk/Foskō loanwords from Hindi/Urdu |
| 0059 | extracted | 31 | 2026-05-24 | Fosfosrā khandrnā → Gadū; F to G transition; Fufī/Fuhār/Fulaba'anā/Fūrī fōrā/fungī/Fusrī/Fuṭalgō-mann (phuṭkal tree) / Phuṭalgarkhā; G section begins with Gā, Gabbā, Gachrnā, Gadras, Gaḍrārnā, Gadsā-mann, Gadū |
| 0060 | extracted | 33 | 2026-05-24 | Gaḍnā → Gaṇḍā; G; Gaḍḍī pit compounds; Gahbar marriage custom; Gāhaṇḍī/Gahḍī/Gahrī; Gajbajrnā/Gajjī/Gainḍā/Galsuṇḍī/Gallē/Gamak/Gamkārnā/Gamka'anā/Gam mōkhnā (idiom)/Gamnā/Gandā/Gaṇḍā loanwords |
| 0061 | extracted | 35 | 2026-05-24 | Gaṇḍā garūr → Gasārnā; G; 2 homographs for Gañhṛā, Garh/Gāṛh, and Gaṛā; split Gane/ganem, Gar'hī/gar'him |
| 0062 | extracted | 34 | 2026-05-24 | Gassā → Gōdō; G; Tūris / ōrs basketmaker tribe; 3 homographs of Gē, 2 homographs of Gochō |
| 0063 | extracted | 35 | 2026-05-24 | Godra'anā → Gucrnā; G; Gōhalā/Gōholā ox compounds; split Gorkoṇḍī/goṛkhuṇḍī; 2 homographs of Gōṭā |
| 0064 | extracted | 34 | 2026-05-24 | Guddā → Gunhā; G; Guṇḍā flour compound block; 2 homographs of Guṇḍī, Gunnā; Gunhā guilt compounds |
| 0065 | extracted | 36 | 2026-05-24 | Gunhā malkā → Gharlā-ōṛā; Gh section begins; split Gurgurrnā/gurārnā, Gurgā/guyam, Ghãsī/ghasī |
| 0066 | extracted | 33 | 2026-05-24 | Gharim gharim → Hāḍī nannā; Gh to H letter transition; split Ghisyārnā/ghisrārnā, Ghocō/gocō, Ghuṛnā/Ghurrī okknā |
| 0067 | extracted | 32 | 2026-05-24 | Hadrap'ā → Harboṛā; H; 2 homographs of Hãrnā; Harboṛā funeral festival; Urdu loanword Hajran |
| 0068 | extracted | 34 | 2026-05-24 | Hāslī → Hehārī nannā; H; irregular verbs Hebrnā/hibrkan; split Hebā mannā/hēwā mannā, Heḍḍē/heḍḍem |
| 0069 | extracted | 35 | 2026-05-24 | Hejēr mannā → Hiṭingnā; H; irregular Hēknā/hikkan; split Hēwrnā/hēbrnā, Hi'ī/hī; 2 homographs of Hirka'anā |
| 0070 | extracted | 37 | 2026-05-24 | Hiyāba'anā → Hubṛā; H; 2 homographs of Hiyō, Hõ̃; split Honne/honnedim, Ho'ōtaṅg/hūntaṅg/hunū, Hormā/hormar/ormā/ormar |
| 0071 | extracted | 32 | 2026-05-24 | Hubgar → Hurnā; H; 2 homographs of Hudā; split Hudā endr ba'as?/Hudā endr tali?, Hullon tī hullō gūṭī, Humbu'u khatrnā/Humbu'ū mannā |
| 0072 | extracted | 33 | 2026-05-24 | Hurmuṭh → dim; H to I transition; letter boundary; split Ibrā/Ibrā ālar, Iklā/iklā barckai, Ilnā/okknā ilnā, Im/dim |
| 0073 | extracted | 36 | 2026-05-24 | Imā → istilī; I; split Irā/irī, Irb/irb irb, Irbar/irbarim, Irkā-ipkā/iṛkā-ipkā, Irsī-birsī/irsim birsim, Isan/isanim, Istī/istilī |
| 0074 | extracted | 31 | 2026-05-24 | Isantim → Īdnā; short I to long Ī transition; letter boundary; split Istā/Ista tīkhil, Isignā/Isg'na, Issū/issus, Isuṅg compounds, Ittnā/Khaṭṭnā ittnā, Itrā/itarā, Iurum/ihurum, Iyā/iyam, Īd/Īdim, Īnū/inū, 2 homographs of Īchō |
| 0075 | extracted | 32 | 2026-05-24 | Īdnā → bōrē; Ī to J transition; letter boundary; split Īnim/ēnim, Īnū/inū, Īs/īsim, Īūrum/īūram/īūdam, Īyā/īyam, Jāgū compounds |
| 0076 | extracted | 33 | 2026-05-24 | Jagrnā → Jati; J; split Jak'hā/Jak'hā aḍḍō, 2 homographs of Jalā, Jallī/Jallī hebrnā, Janū/jenū |
| 0077 | extracted | 33 | 2026-05-24 | Jātim → Jiā-kāyā; J; split Jāwā/Jawa khoppnā, Jējētā/jējētkā, Jēn/jhan, 2 homographs of Jeṛem keṛem, Jiā/Jiā compounds |
| 0078 | extracted | 33 | 2026-05-24 | Jiā nū sannī mannā → Jogornā; J; split Jiā compounds, Jinō-injō/Jinō kum/Jinōdhārī, Jītnā/kaṭnā, 2 homographs of Jobnā, Jōgē/Jōgēmalkā |
| 0079 | extracted | 33 | 2026-05-24 | Jogtotom → Jorrā; J; split jok'im, Jōr nannā; loanword from Urdu (Jōr) |
| 0080 | extracted | 33 | 2026-05-24 | Jōṛnā → Jumurnā; J; 2 homographs of Jōṛnā; split Jōṛī compounds, Judā/Jumā compounds |
| 0081 | extracted | 33 | 2026-05-24 | Jumjumrnā → Jhakmakrnā; Jh section begins; transition J→Jh; 2 homographs of Jurārnā; split Jurub/Juthā/Jūthā compounds |
| 0082 | extracted | 34 | 2026-05-24 | Jhaknā → Jharnā; Jh section; |
| 0083 | extracted | 34 | 2026-05-24 | Jharnārnā → Jhulrnā; Jh section continued |
| 0084 | extracted | 32 | 2026-05-24 | Jhumur → Kaḍrārnā; Jh→K letter transition |
| 0085 | extracted | 32 | 2026-05-24 | Kadrnā → Kalab kalabrnā; K section |
| 0086 | extracted | 34 | 2026-05-24 | Kalaknā → Kaṅk; K section |
| 0087 | extracted | 33 | 2026-05-24 | Kaṅk palknā → Kareyā co'onā; K section |
| 0088 | extracted | 31 | 2026-05-24 | Karekundā → Kassamalkā; K section |
| 0089 | extracted | 33 | 2026-05-24 | Kasarnā → Katsā; K section |
| 0090 | extracted | 32 | 2026-05-24 | Katyā nannā → Kesarī-ghāsī; K section |
| 0091 | extracted | 32 | 2026-05-24 | Kēsārī → Kīrā rāanā; K section |
| 0092 | extracted | 30 | 2026-05-24 | Kirbirdr ērnā → Kiyā; K section |
| 0093 | extracted | 31 | 2026-05-24 | Kiyā → Kōkā; K section |
| 0094 | extracted | 33 | 2026-05-24 | Kōkh → Korleṅgā-ōrā; K section |
| 0095 | extracted | 35 | 2026-05-24 | Kōrnā → Kuḍḍī; K section |
| 0096 | extracted | 33 | 2026-05-24 | Kudta'anā → Kūlyar; K section |
| 0097 | extracted | 31 | 2026-05-24 | Kulhū → Kūikūiyu; K section |
| 0098 | extracted | 33 | 2026-05-24 | Kuṅkī → Kuttallā; K section |
| 0099 | extracted | 33 | 2026-05-24 | Kuttiallā → Khallī; K to Kh section transition |
| 0100 | extracted | 33 | 2026-05-24 | Khambiā → Kharuā; Kh section |
| 0101 | extracted | 33 | 2026-05-24 | Kharuā mokhnā → Khaṭa'anā; Kh section continued |
| 0102 | extracted | 34 | 2026-05-24 | Khattu → Khis; Kh section continued |
| 0103 | extracted | 33 | 2026-05-24 | Khis uinā → Khuā mannā; Kh section continued |
| 0104 | extracted | 32 | 2026-05-24 | Khudkhudrnā → Khusmārnā; Kh section continued |
| 0105 | extracted | 29 | 2026-05-24 | Khūṭ → K̲h̲ajnā; Kh to K̲h̲ (underline-Kh) section transition |
| 0106 | extracted | 34 | 2026-05-24 | K̲h̲ajnā → Khan nūjnā; K̲h̲ (underline-Kh) section continued |
| 0107 | extracted | 32 | 2026-05-24 | K̲h̲an oṭṭā → K̲h̲arkharsā; K̲h̲ (underline-Kh) section continued |
| 0108 | extracted | 33 | 2026-05-24 | K̲h̲arkharnā → K̲h̲edd; K̲h̲ (underline-Kh) section continued |
| 0109 | extracted | 35 | 2026-05-24 | K̲h̲eddō → K̲h̲eppar; K̲h̲ (underline-Kh) section continued |
| 0110 | extracted | 32 | 2026-05-24 | K̲h̲ēr → K̲h̲odomk̲h̲odom; K̲h̲ (underline-Kh) section continued |
| 0111 | extracted | 35 | 2026-05-24 | K̲h̲odor → K̲h̲onk̲h̲ā; K̲h̲ (underline-Kh) section continued |
| 0112 | extracted | 36 | 2026-05-24 | K̲h̲ō̃snā → K̲h̲uṛtī onnā; K̲h̲ (underline-Kh) section ends |
| 0113 | extracted | 32 | 2026-05-24 | Urbas gahī k̲h̲uṛtī → Lahsān; letter L begins |
| 0114 | extracted | 34 | 2026-05-24 | Lāhnā → Lamcom amba'anā; letter L continued |
| 0115 | extracted | 34 | 2026-05-24 | Lamcomrnā → Larlarrnā; letter L continued |
| 0116 | extracted | 34 | 2026-05-24 | Laraṅg → Laukārnā; letter L continued |
| 0117 | extracted | 32 | 2026-05-24 | Laukhnā → Lekh'ā; letter L continued |
| 0118 | extracted | 32 | 2026-05-24 | Lekh'ā → Lessō; letter L continued |
| 0119 | extracted | 32 | 2026-05-24 | Letnā → Lohārī; letter L continued |
| 0120 | extracted | 36 | 2026-05-24 | Lok'ā nannā → Lupluprnā; letter L continued |
| 0121 | extracted | 32 | 2026-05-24 | Lūr → Mahurā; letter L ends, M begins |
| 0122 | extracted | 34 | 2026-05-24 | Mahuraṅg → Malaṅg; letter M continued |
| 0123 | extracted | 32 | 2026-05-24 | Mal'ā → Mandnā; letter M continued |
| 0124 | extracted | 32 | 2026-05-24 | Mandnā → Markhkā; letter M continued |
| 0125 | extracted | 33 | 2026-05-24 | Markhnā → Mēd mannā; letter M continued |
| 0126 | extracted | 33 | 2026-05-24 | Mēd mannā → Mēyā; letter M continued |
| 0127 | extracted | 32 | 2026-05-24 | Maitā → Minnrnā; letter M continued |
| 0128 | extracted | 31 | 2026-05-24 | Minkhnā → Mōsgā; letter M continued |
| 0129 | extracted | 34 | 2026-05-24 | Mōsgrnā → Mukkhā; letter M continued |
| 0130 | extracted | 33 | 2026-05-24 | Mulga'anā → Muṅgā-mann; letter M continued |
| 0131 | extracted | 31 | 2026-05-24 | Muṅg-arkhā → Murrā murrā; letter M continued |
| 0132 | extracted | 30 | 2026-05-24 | Murrnā → Nagadkūṛā; letter M ends, N begins |
| 0133 | extracted | 30 | 2026-05-24 | Nagrā → Nalakh cī'inā; letter N continued |
| 0134 | extracted | 33 | 2026-05-24 | Nalakh ambnā → Nannā; letter N continued |
| 0135 | extracted | 31 | 2026-05-24 | Nannus → Naur; letter N continued |
| 0136 | extracted | 25 | 2026-05-24 | Naurī → Nēk'am; letter N continued |
| 0137 | extracted | 30 | 2026-05-24 | Nēk'im → Nichak; letter N continued |
| 0138 | extracted | 33 | 2026-05-24 | Nichakii-mase → Ningris; letter N continued |
| 0139 | extracted | 32 | 2026-05-24 | Ningkhai → Nollna; letter N continued |
| 0140 | extracted | 32 | 2026-05-24 | Nondhrna → Nurdna; letter N continued |
| 0141 | extracted | 31 | 2026-05-24 | Nurdna dahere → Olkhna; N ends, O begins |
| 0142 | extracted | 32 | 2026-05-24 | Olot → Orsna; letter O continued |
| 0143 | extracted | 33 | 2026-05-24 | Onta → Orasari; letter O continued |
| 0144 | extracted | 31 | 2026-05-24 | Ota → Ollagna; O long section begins |
| 0145 | extracted | 32 | 2026-05-24 | Olna → Pacca; O long section, P begins |
| 0146 | extracted | 31 | 2026-05-24 | Paced pacci → Paik; letter P continued |
| 0147 | extracted | 30 | 2026-05-24 | Paik beona → Khadd pakna'e; letter P continued |
| 0148 | extracted | 32 | 2026-05-24 | Pakrni → Palto; letter P continued |
| 0149 | extracted | 30 | 2026-05-24 | Pan-mann → Papla; letter P continued |
| 0150 | extracted | 28 | 2026-05-24 | Par oaoa → Parna ulla; letter P continued |
| 0151 | extracted | 32 | 2026-05-24 | Parna → Patgali; letter P continued |
| 0152 | extracted | 31 | 2026-05-24 | Pate → Pedkhna; letter P continued |
| 0153 | extracted | 33 | 2026-05-24 | Pedkhna strangle → Pinn; letter P continued |
| 0154 | extracted | 33 | 2026-05-24 | Pipni → Pokhta; letter P continued |
| 0155 | extracted | 25 | 2026-05-24 | Pokhta urkhna → Porkhna; letter P continued |
| 0156 | extracted | 32 | 2026-05-24 | Poeve → Puna; letter P continued |
| 0157 | extracted | 33 | 2026-05-24 | Puna cin → Puthi inje; letter P continued |
| 0158 | extracted | 30 | 2026-05-24 | Pithi → Rakrak; P ends, R begins |
| 0159 | extracted | 33 | 2026-05-24 | Rampacalpa → Rende nanna; letter R continued |
| 0160 | extracted | 33 | 2026-05-24 | Rewa-dra → Rugri; letter R continued |
| 0161 | extracted | 31 | 2026-05-24 | Runia dra → Saitin; R ends, S begins |
| 0162 | extracted | 32 | 2026-05-24 | Saitim → Samearna; letter S continued |
| 0163 | extracted | 33 | 2026-05-24 | Sane → Sapra'ana; letter S continued |
| 0164 | extracted | 26 | 2026-05-24 | Sāprārnā → Sārpārkā; letter S continued |
| 0165 | extracted | 33 | 2026-05-24 | Sarudā → Sertā; letter S continued |
| 0166 | extracted | 33 | 2026-05-24 | Set’yē → Sithābā'anā; letter S continued |
| 0167 | extracted | 31 | 2026-05-24 | Sithārnā → Sōrad-bōrad mōkhnā; letter S continued |
| 0168 | extracted | 35 | 2026-05-24 | Sordondo → Sukrsukraiṅ-bīṅkō; letter S continued |
| 0169 | extracted | 30 | 2026-05-24 | Sulsulrā → Tabsnā; letter S ends, T begins |
| 0170 | extracted | 30 | 2026-05-24 | Tācī → Tāmhai; letter T continued |
| 0171 | extracted | 26 | 2026-05-24 | Tambas → Taprom; letter T continued |
| 0172 | extracted | 30 | 2026-05-24 | Tārā → Tēleṅgā; letter T continued |
| 0173 | extracted | 32 | 2026-05-24 | Tēlnā → Tigā; letter T continued |
| 0174 | extracted | 27 | 2026-05-24 | Tigā-dā'anā → Tipkā'anā; letter T continued |
| 0175 | extracted | 32 | 2026-05-24 | Tirhrnā → Tōp'ō; letter T continued |
| 0176 | extracted | 30 | 2026-05-24 | Tōrbīndiyā → Turā; letter T continued |
| 0177 | extracted | 31 | 2026-05-24 | Turdānā → Thayā; letter T ends, Th begins |
| 0178 | extracted | 33 | 2026-05-24 | Thayāmalkā → Ṭagal-magal; Th ends, Ṭ begins |
| 0179 | extracted | 32 | 2026-05-24 | Ṭagal-magalrnā → Ṭekā / ṭekkā; letter Ṭ continued |
| 0180 | extracted | 33 | 2026-05-24 | Ṭempā → Ṭōppā-ōṛā; letter Ṭ continued |
| 0181 | extracted | 32 | 2026-05-24 | Ṭōprī → Ṭhekkā; Ṭ ends, Ṭh begins |
| 0182 | extracted | 32 | 2026-05-24 | Ṭhēkā-ghāsī → Ubje'anā; Ṭh ends, short U begins |
| 0183 | extracted | 33 | 2026-05-24 | Ubkrnā → Ujbak; short letter U continued |
| 0184 | extracted | 31 | 2026-05-24 | Ujgā'anā → Umbalk̲h̲ā; short letter U continued |
| 0185 | extracted | 33 | 2026-05-24 | Umblnā → Uprar nannā; short letter U continued |
| 0186 | extracted | 26 | 2026-05-24 | Uran mannā → Urtrnā; short letter U continued |
| 0187 | extracted | 32 | 2026-05-24 | Urī → Uturnī; short letter U ends |
| 0188 | extracted | 24 | 2026-05-24 | Ū → Ūrī; long letter Ū (last page) |
