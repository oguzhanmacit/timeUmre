import { UmrahRoute } from '../../../models/route.model';

export const UMRAH_ROUTES: UmrahRoute[] = [
  {
    id: 'jeddah-makkah-madinah',
    title: "Cidde'den Başla, Medine'den Dön",
    subtitle: 'Cidde Havalimanı → Mekke → Medine → Medine Havalimanı',
    startAirport: 'Cidde (JED)',
    firstCity: 'Mekke',
    secondCity: 'Medine',
    returnAirport: 'Medine (MED)',
    description:
      "Cidde Havalimanı'na iniş yapıp Mekke'de umre ibadetini tamamladıktan sonra Medine'yi ziyaret ederek dönüş yapılan klasik umre güzergâhı.",
    steps: [
      {
        id: 'step-1',
        order: 1,
        title: "Cidde Havalimanı'na Varış",
        city: 'Jeddah',
        type: 'airport',
        shortDescription: "Pasaport, bagaj ve Mekke'ye geçiş hazırlığı.",
        content:
          "Kral Abdülaziz Uluslararası Havalimanı'na indiğinizde umre vizeli pasaportunuzla pasaport kontrolü kuyruğuna geçin. " +
          'Bagajlarınızı aldıktan sonra gerekiyorsa riyal bozundurun; terminal içinde hem döviz bürosu hem ATM mevcuttur. ' +
          'Yerel SIM kart veya e-SIM almanız navigasyon ve iletişim açısından büyük kolaylık sağlar. ' +
          "Mekke'ye ihramlı giriş yapacaksanız terminaldeki tuvaletlerde ihramınızı giyip niyet edin.",
        checklist: [
          'Pasaport ve umre vizesi kontrol edildi',
          'Bagajlar teslim alındı, hasar kontrolü yapıldı',
          'Riyal veya kart ile ödeme hazırlığı yapıldı',
          'Yerel SIM kart / e-SIM alındı',
          'İhram giyildi ve niyet edildi (ihramlı giriş için)',
          'Mekke ulaşım planı ve otel adresi hazır',
        ],
        videoUrl: 'https://www.youtube.com/watch?v=Os5rO3TngqU&t=81s',
      },
      {
        id: 'step-2',
        order: 2,
        title: "Cidde'den Mekke'ye Geçiş",
        city: 'Makkah',
        type: 'transport',
        shortDescription:
          "Hızlı tren, taksi veya özel transfer ile Mekke'ye ulaşım.",
        content:
          "Cidde'den Mekke'ye yaklaşık 80 km mesafe bulunmaktadır. " +
          'En hızlı seçenek olan Haramain Yüksek Hızlı Treni Abdülaziz istasyonundan kalkar; bilet satın almak için uygulamayı önceden indirmeniz önerilir. ' +
          'Taksi veya özel transferler havalimanı çıkışında hazır beklemektedir. ' +
          'Mekke, gayrimüslimlere kapalı kutsal bir şehirdir; giriş noktalarında kontrol yapılabilir.',
        checklist: [],
        showCompleteButton: true,
        hideVideoButton: true,
        transportOptions: [
          {
            type: 'train',
            title: 'Haramain Yüksek Hızlı Treni',
            description:
              "Cidde Havalimanı'ndan Mekke'ye yaklaşık 40 dakikada ulaşır. Biletler Haramain uygulamasından veya gişeden alınabilir.",
            recommendedFor:
              'Bu seçenekten ekonomik olarak faydalanmak isteyenlerin en az 3 hafta önce biletlerini almaları tavsiye edilir. Nasıl bilet alacağınızı öğrenmek için videolu içeriğe Ana Sayfa > Nasıl Giderim ? > Hızlı Tren İşlemleri sekmesinden erişebilirsiniz',
            imageUrl: 'assets/images/train.png',
            rating: 4.8,
            duration: '40 dk',
            durationLabel: 'En hızlı seçenek',
            price: '100 SAR',
            priceLabel: 'Başlangıç fiyatı',
            isBestOption: true,
            videos: [
              {
                label:
                  'Cidde Havalimanından Mekke Hızlı Tren İstasyonuna Geçiş',
                url: 'https://www.youtube.com/watch?v=iEn3ePl8_Ik',
              },
              {
                label:
                  'Mekke Hızlı Tren İstasyonundan Kâbe Bölgesine (Haram Bölgesi) Geçiş',
                url: 'https://www.youtube.com/watch?v=TfKriqR2Eio',
              },
            ],
          },
          {
            type: 'taxi',
            title: 'Taksi',
            description:
              'Havalimanı çıkışında sabit tarifeli taksiler mevcuttur. Yolculuk yaklaşık 1 saattir. Uber ve Careem de aktif olarak çalışmaktadır.',
            recommendedFor: 'Bagajı bol ve grup halinde seyahat edenler',
            imageUrl: 'assets/images/taxi.png',
            rating: 4.5,
            duration: '1 saat',
            durationLabel: 'Kapıdan kapıya konforlu ulaşım',
            price: '300-400 SAR',
            priceLabel: 'Tahmini ücret',
            videos: [
              {
                label: "Cidde'den Mekke'ye Geçiş Rehberi",
                url: 'https://www.youtube.com/watch?v=dHXam3UYvW4',
              },
            ],
          },
          {
            type: 'private_transfer',
            title: 'Özel Transfer',
            description:
              'Otel veya tur operatörü aracılığıyla önceden ayarlanan araç karşılama hizmeti. Havalimanı çıkışında isim tabelasıyla beklenir.',
            recommendedFor: 'İlk kez gidenler ve yaşlı yolcular',
            rating: 4.7,
            duration: '1 saat',
            durationLabel: 'Konforlu kapıdan kapıya',
            price: '400-500 SAR',
            priceLabel: 'Tahmini ücret',
            videos: [
              {
                label: "Cidde'den Mekke'ye Geçiş Rehberi",
                url: 'https://www.youtube.com/watch?v=dHXam3UYvW4',
              },
            ],
          },
          {
            type: 'bus',
            title: 'SAPTCO Otobüsü',
            description:
              "Resmi otobüs şirketi SAPTCO'nun havalimanı-Mekke hattı uygun fiyatlıdır. Sefer saatleri için terminaldeki gişelerden bilgi alın.",
            recommendedFor: 'Ekonomik seyahat tercih edenler',
            imageUrl: 'assets/images/saptco.png',
            rating: 4.2,
            duration: '1.5 saat',
            durationLabel: 'Ekonomik seyahat',
            price: '45 SAR',
            priceLabel: 'Kişi başı',
            videos: [
              {
                label: "Cidde'den Mekke'ye Geçiş Rehberi",
                url: 'https://www.youtube.com/watch?v=dHXam3UYvW4',
              },
              {
                label: "Cidde'den Mekke'ye Geçiş Rehberi Alternatif",
                url: 'https://www.youtube.com/shorts/MecNuMUNBqY',
              },
            ],
          },
        ],
        videoUrl: 'https://www.youtube.com/watch?v=dHXam3UYvW4',
      },
      {
        id: 'step-3',
        order: 3,
        title: 'Mekke Oteline Yerleşme',
        city: 'Makkah',
        type: 'hotel',
        shortDescription: "Otele giriş, hazırlık ve Harem'e ilk oryantasyon.",
        content:
          'Otele giriş yaptıktan sonra bagajlarınızı bırakın ve kısa bir dinlenmenin ardından oryantasyon yapın. ' +
          "Otel personeliyle Mescid-i Haram'a en yakın çıkışı ve yürüyüş süresini öğrenin. " +
          'Umreye çıkmadan önce abdest alın, ihramınızın düzgün olduğunu kontrol edin ve yanınıza su ile küçük bir çanta alın. ' +
          'Kaybolma ihtimaline karşı otel kartını veya adresini telefona kaydedin.',
        checklist: [
          'Odaya giriş yapıldı, eşyalar yerleştirildi',
          "Harem'e en yakın çıkış ve güzergâh öğrenildi",
          'Abdest alındı ve ihram kontrol edildi',
          'Telefona otel adresi ve acil numaralar kaydedildi',
          'Yanına su ve küçük çanta hazırlandı',
        ],
        videoUrl: 'https://www.youtube.com/watch?v=Mxa1DeUfIBo',
      },
      {
        id: 'step-4',
        order: 4,
        title: 'Umre İbadeti',
        city: 'Makkah',
        type: 'worship',
        shortDescription: "Tavaf, sa'y ve ihramdan çıkış adımları.",
        content:
          "Mescid-i Haram'a girişte sağ ayakla girin ve Kâbe'yi gördüğünüzde dua edin. " +
          "Tavaf, Hacer-i Esved hizasından başlayarak Kâbe'nin solunda kalacak şekilde yedi tur yapılır. " +
          "Tavaf namazının ardından Zemzem içip Safa-Merve arasında yedi tur sa'y yapılır. " +
          "Sa'y tamamlandıktan sonra saçlarınızı kestirerek veya kazıtarak ihramdan çıkın.",
        checklist: [
          'Niyet edildi ve telbiye getirildi',
          "Mescid-i Haram'a sağ ayakla girildi",
          'Yedi tur tavaf tamamlandı',
          "Makam-ı İbrahim'de iki rekât tavaf namazı kılındı",
          'Zemzem içildi',
          "Safa ile Merve arasında yedi tur sa'y yapıldı",
          'Saç kesimi ile ihramdan çıkıldı',
        ],
        videoUrl: 'https://www.youtube.com/watch?v=U1JhfjEm-xY',
      },
      {
        id: 'step-6',
        order: 6,
        title: "Mekke'den Medine'ye Geçiş",
        city: 'Madinah',
        type: 'transport',
        shortDescription:
          "Haramain treni veya özel transfer ile Medine'ye geçiş.",
        content:
          "Mekke'den Medine'ye yaklaşık 450 km mesafe bulunmaktadır. " +
          "Haramain Yüksek Hızlı Treni bu güzergâhı yaklaşık 2 saatte kat eder; bilet temini için Mekke Merkez İstasyonu'na gelin. " +
          'Özel transfer veya otobüs alternatifleri 5-6 saat sürebilir ancak daha esnek saatler sunar. ' +
          "Medine'de otele yerleşmeden önce Mescid-i Nebevî'nin konumunu haritada işaretleyin.",
        checklist: [],
        showCompleteButton: true,
        hideVideoButton: true,
        videoUrl: 'https://www.youtube.com/watch?v=3L-ocdHKA_U',
        transportOptions: [
          {
            type: 'train',
            title: 'Haramain Yüksek Hızlı Treni',
            description:
              "Mekke Merkez İstasyonu'ndan Medine'ye yaklaşık 2 saatte ulaşır. Konforlu ve ekonomik seçenek.",
            recommendedFor: 'Hızlı ve konforlu seyahat isteyenler',
            imageUrl: 'assets/images/train.png',
            isBestOption: true,
            videos: [
              {
                label: 'Haramain Hızlı Tren Rehberi',
                url: 'https://www.youtube.com/watch?v=BOoFWqMtv4A',
              },
              {
                label:
                  "Mekke'den Mescid-i Nebevi'ye Taksi-Tren-Otobüs Yolculuğu",
                url: 'https://www.youtube.com/watch?v=l6nk4Z2Kj4g',
              },
            ],
          },
          {
            type: 'private_transfer',
            title: 'Özel Transfer',
            description:
              'Otelden otele kapıdan kapıya hizmet. Seyahat süresi yaklaşık 5-6 saat olup molalar verilebilir.',
            recommendedFor: 'Yaşlı yolcular ve büyük gruplar',
          },
          {
            type: 'bus',
            title: 'SAPTCO (Otobüs) / Taksi',
            description:
              'Mekke otogarından (Jarwal garajı) düzenli seferler mevcuttur. Uygun fiyatlı ancak biraz daha uzun seyahat süresine sahiptir. Bu seçeneği tercih edenlerin Haram bölgesine yürüme mesafesinde bulunan Jarwal garajına gitmesi gerekir.',
            recommendedFor: 'Ekonomik seyahat tercih edenler',
            imageUrl: 'assets/images/saptco.png',
            imageUrl2: 'assets/images/taxi.png',
            videos: [
              {
                label: '1- Jarwal Garajına Nasıl Gidilir ?',
                url: 'https://www.youtube.com/watch?v=x-uMYfpvcRk&t=1139s',
              },
              {
                label:
                  "2- Jarwal Garajından Medine'ye Otobüs ve Taksiler (Fiyat Bilgileri)",
                url: 'https://www.youtube.com/watch?v=lquQC6hLXx8',
              },
            ],
          },
        ],
      },
      {
        id: 'step-8',
        order: 8,
        title: "Medine Havalimanı'ndan Dönüş",
        city: 'Madinah',
        type: 'return',
        shortDescription: 'Otelden çıkış, Zemzem ve havalimanına transfer.',
        content:
          'Dönüş gününde uçuş saatinizden en az 3 saat önce havalimanında olmanız önerilir. ' +
          'Otelden çıkmadan önce Zemzem suyu alıp bavullarınıza uygun şekilde yerleştirin; kontrollü bagajda 5 litre Zemzem taşıyabilirsiniz. ' +
          'Prens Muhammed bin Abdülaziz Havalimanı şehir merkezine yaklaşık 15 km uzaklıktadır. ' +
          'Dönüş yolculuğunuzda tüm kutsal mekânlara veda ederken dua etmeyi unutmayın.',
        checklist: [
          'Uçuş saati ve kapı numarası kontrol edildi',
          'Otel check-out tamamlandı',
          'Zemzem suyu bagaja yerleştirildi (max 5 lt)',
          'Tüm eşyalar toparlandı, unutulan bir şey yok',
          'Havalimanı transferi ayarlandı',
          'Pasaport ve biletler el altında',
        ],
        videoUrl: 'https://www.youtube.com/watch?v=X-Xvaslhu0s',
      },
    ],
  },
  {
    id: 'madinah-makkah-jeddah',
    title: "Medine'den Başla, Cidde'den Dön",
    subtitle: "Önce Medine ziyareti, sonra Mekke'de umre ibadeti",
    startAirport: 'Medine (MED)',
    firstCity: 'Medine',
    secondCity: 'Mekke',
    returnAirport: 'Cidde (JED)',
    description:
      "Medine Havalimanı'na iniş yapıp önce Medine'de Mescid-i Nebevî ve önemli ziyaret noktalarını gezen, ardından Mekke'ye geçerek umre ibadetini tamamlayan ve dönüşte Cidde Havalimanı'nı kullanan yolcular için adım adım rota rehberi.",
    steps: [
      {
        id: 'mmj-step-1',
        order: 1,
        title: "Medine Havalimanı'na Varış",
        city: 'Madinah',
        type: 'airport',
        shortDescription:
          "Medine'ye iniş, pasaport ve bagaj işlemleri, ardından otele geçiş.",
        content:
          "Medine Havalimanı'na vardığınızda ilk olarak pasaport kontrolünden geçilir ve bagajlar alınır. " +
          'Bu rotada ilk durak Medine olduğu için yolculuk daha sakin bir ziyaret süreciyle başlar. ' +
          "Havalimanından çıktıktan sonra otel transferinizi kontrol edin, otel adresinizi hazır bulundurun ve Mescid-i Nebevî'ye yakınlığınızı öğrenin.",
        checklist: [
          'Pasaport kontrolünden geç',
          'Bagajını al',
          'Otel adresini kontrol et',
          'Transfer veya taksi seçeneğini belirle',
          'Telefon internetini aktif et',
          'Mescid-i Nebevî yönünü öğren',
        ],
        transportOptions: [
          {
            type: 'taxi',
            title: 'Taksi',
            description:
              'Havalimanı çıkışında sabit tarifeli taksiler mevcuttur. Uber ve Careem de aktif olarak çalışmaktadır.',
            recommendedFor: 'Bagajı bol ve grup halinde seyahat edenler',
          },
          {
            type: 'private_transfer',
            title: 'Özel Transfer',
            description:
              'Otel veya tur operatörü aracılığıyla önceden ayarlanan araç karşılama hizmeti.',
            recommendedFor: 'İlk kez gidenler ve yaşlı yolcular',
          },
          {
            type: 'bus',
            title: 'Otobüs / Servis',
            description:
              'Havalimanından şehir merkezine düzenli servis seferleri mevcuttur.',
            recommendedFor: 'Ekonomik seyahat tercih edenler',
          },
        ],
        videoUrl: 'https://www.youtube.com/watch?v=X-Xvaslhu0s',
      },
      {
        id: 'mmj-step-2',
        order: 2,
        title: 'Medine Oteline Yerleşme',
        city: 'Madinah',
        type: 'hotel',
        shortDescription:
          'Otele giriş, dinlenme ve Mescid-i Nebevî ziyareti için hazırlık.',
        content:
          "Medine'ye vardıktan sonra otele yerleşmek, eşyaları güvenli şekilde bırakmak ve kısa süre dinlenmek önemlidir. " +
          "İlk gün Mescid-i Nebevî'ye gitmeden önce otelden mescide gidiş ve dönüş yolunu öğrenin. " +
          'Kalabalıkta kaybolmamak için otel kartı, konum bilgisi veya yakın çevredeki belirgin noktalar not edilmelidir.',
        checklist: [
          'Otele giriş yap',
          'Eşyalarını yerleştir',
          'Otel kartını veya adresini yanında bulundur',
          "Mescid-i Nebevî'ye gidiş yolunu öğren",
          'Dönüş için buluşma noktası belirle',
          'Namaz vakitlerini kontrol et',
        ],
        videoUrl: 'https://www.youtube.com/watch?v=nb3d8jJy-YA',
      },
      {
        id: 'mmj-step-3',
        order: 3,
        title: 'Medine Ziyaretleri',
        city: 'Madinah',
        type: 'visit',
        shortDescription:
          'Mescid-i Nebevî, Ravza, Kuba, Uhud ve diğer önemli ziyaret noktaları.',
        content:
          "Medine'deki en önemli ziyaret noktası Mescid-i Nebevî'dir. " +
          "Bunun yanında Ravza ziyareti, Kuba Mescidi, Uhud, Kıbleteyn Mescidi ve Cennetü'l-Baki gibi önemli yerler de ziyaret edilebilir. " +
          'Ziyaret planınızı kalabalık saatleri, ulaşım mesafelerini ve grup düzeninizi dikkate alarak yapmanız önerilir.',
        checklist: [
          "Mescid-i Nebevî'de namaz kıl",
          'Ravza ziyareti için plan yap',
          'Kuba Mescidi ziyaretini kontrol et',
          'Uhud ziyareti için ulaşım planla',
          'Kıbleteyn Mescidi bilgisini incele',
          "Cennetü'l-Baki ziyaret adabını öğren",
          'Hurma pazarı için zaman ayır',
        ],
        videos: [
          { label: "Mescid-i Nebevî", url: 'https://www.youtube.com/watch?v=v7WFFtQ2Bh8' },
          { label: 'Ravza Ziyareti', url: 'https://www.youtube.com/watch?v=mxWQG5j-Up8' },
          { label: 'Kuba Mescidi', url: 'https://www.youtube.com/watch?v=04SFVpWEMak' },
          { label: 'Uhud', url: 'https://www.youtube.com/watch?v=tFewPu71Z6U' },
          { label: 'Kıbleteyn Mescidi', url: 'https://www.youtube.com/watch?v=H9ILS0ocIJk' },
          { label: "Cennetü'l-Baki", url: 'https://www.youtube.com/watch?v=nxcVSrqjkAk' },
        ],
        transportOptions: [
          {
            type: 'taxi',
            title: 'Taksi / Careem',
            description:
              'Uhud ve Kuba gibi uzak noktalara taksi veya Careem ile rahatça ulaşılabilir.',
            recommendedFor: 'Bireysel veya çift seyahat edenler',
          },
          {
            type: 'bus',
            title: 'Grup Servisi',
            description:
              'Tur operatörleri tarafından organize edilen ziyaret turları güzergâhı toplu olarak kapsar.',
            recommendedFor: 'Büyük gruplar ve ilk kez gidenler',
          },
          {
            type: 'private_transfer',
            title: 'Özel Transfer',
            description:
              'Esnek saatlerle tüm ziyaret noktalarını kapsayan özel araç kiralama.',
            recommendedFor: 'Yaşlı yolcular ve aileler',
          },
        ],
      },
      {
        id: 'mmj-step-4',
        order: 4,
        title: "Mekke'ye Geçiş Hazırlığı",
        city: 'Madinah',
        type: 'transport',
        shortDescription:
          "Mekke'ye umre için geçmeden önce ihram, niyet ve ulaşım hazırlığı.",
        content:
          "Medine'den Mekke'ye hareket etmeden önce ihramınızı giyin, gusül alın ve niyet edin. " +
          "Otel çıkış saatinizi ve bilet ya da transfer bilginizi önceden teyit edin; Mekke otel adresinizi telefonunuza kaydedin. " +
          'Yolculuk boyunca telbiye getirmeye devam edin ve ihram yasaklarına dikkat edin.',
        checklist: [
          'İhram kıyafetini hazırla',
          'Gerekirse gusül ve abdest hazırlığı yap',
          'Umre niyetini hatırla',
          'Tren veya transfer saatini kontrol et',
          'Mekke otel adresini hazırla',
          'Bagajını kontrol et',
          'Yolculuk için su ve temel ihtiyaçlarını al',
        ],
        videoUrl: 'https://www.youtube.com/watch?v=e73AJkWoRQ8',
      },
      {
        id: 'mmj-step-5',
        order: 5,
        title: "Medine'den Mekke'ye Yolculuk",
        city: 'Makkah',
        type: 'transport',
        shortDescription:
          "Medine'den Mekke'ye tren, otobüs veya özel transfer ile geçiş.",
        content:
          "Medine'den Mekke'ye geçiş için Haramain treni, otobüs, taksi veya özel transfer seçenekleri kullanılabilir. " +
          'Tren kullanılıyorsa istasyona zamanında gitmek, bilet ve bagaj kurallarını kontrol etmek önemlidir. ' +
          'Özel transfer veya otobüs kullanılıyorsa yolculuk süresi ve mola düzeni önceden öğrenilmelidir.',
        checklist: [],
        showCompleteButton: true,
        hideVideoButton: true,
        videoUrl: 'https://www.youtube.com/watch?v=WnKsmjFNxF4&t=40s',
        transportOptions: [
          {
            type: 'train',
            title: 'Haramain Yüksek Hızlı Treni',
            description:
              "Medine istasyonundan Mekke'ye yaklaşık 2 saatte ulaşır. Konforlu ve ekonomik seçenek.",
            recommendedFor: 'Hızlı ve konforlu seyahat isteyenler',
            imageUrl: 'assets/images/train.png',
            isBestOption: true,
            videos: [
              {
                label: 'Haramain Hızlı Tren Rehberi',
                url: 'https://www.youtube.com/watch?v=WnKsmjFNxF4&t=40s',
              },
            ],
          },
          {
            type: 'private_transfer',
            title: 'Özel Transfer',
            description: 'Kapıdan kapıya hizmet, mola seçeneği mevcut.',
            recommendedFor: 'Aileler ve yaşlı yolcular',
          },
          {
            type: 'bus',
            title: 'Otobüs / Taksi',
            description:
              "Uygun fiyatlı seçenek; yolculuk süresi yaklaşık 5-6 saat. Uzun yol taksileri Medine-Mekke güzergâhında sabit tarifeli çalışmaktadır.",
            recommendedFor: 'Ekonomik seyahat tercih edenler',
            imageUrl: 'assets/images/saptco.png',
            imageUrl2: 'assets/images/taxi.png',
            videos: [
              {
                label: "Medine'den Mekke'ye Otobüs ve Taksi Rehberi",
                url: 'https://www.youtube.com/watch?v=VYPslj7-1TY',
              },
            ],
          },
        ],
      },
      {
        id: 'mmj-step-6',
        order: 6,
        title: 'Mekke Oteline Yerleşme',
        city: 'Makkah',
        type: 'hotel',
        shortDescription: "Mekke'ye varış, otele giriş ve umreye hazırlık.",
        content:
          "Mekke'ye vardığınızda öncelikle otelinize geçip eşyalarınızı bırakın. " +
          "Umre ibadetine başlamadan önce kısa bir dinlenme, abdest hazırlığı ve Harem'e gidiş yolunu öğrenmek faydalı olur. " +
          "Otelden Mescid-i Haram'a giderken dönüş yolunu ve buluşma noktasını mutlaka belirleyin.",
        checklist: [
          'Mekke oteline giriş yap',
          'Eşyalarını güvenli şekilde bırak',
          'Abdest ve hazırlığını tamamla',
          "Harem'e gidiş yolunu öğren",
          'Otel dönüş noktasını belirle',
          'Telefon şarjını kontrol et',
        ],
        videoUrl: 'https://www.youtube.com/watch?v=Mxa1DeUfIBo',
      },
      {
        id: 'mmj-step-7',
        order: 7,
        title: 'Umre İbadeti',
        city: 'Makkah',
        type: 'worship',
        shortDescription:
          "Tavaf, sa'y ve tıraş ile umre ibadetinin tamamlanması.",
        content:
          "Mekke'ye umre niyetiyle gelen kullanıcı için bu rotanın en önemli adımı umre ibadetidir. " +
          "Mescid-i Haram'a girişten sonra tavaf yapılır, ardından tavaf namazı kılınır, zemzem içilir ve Safa ile Merve arasında sa'y tamamlanır. " +
          'Son olarak tıraş olunarak ihramdan çıkılır.',
        checklist: [
          'Umre niyetini kontrol et',
          'Telbiye getir',
          "Mescid-i Haram'a sakin şekilde gir",
          'Tavafı tamamla',
          'Tavaf namazını kıl',
          'Zemzem iç',
          "Safa-Merve sa'yini tamamla",
          'Tıraş olup ihramdan çık',
        ],
        videoUrl: 'https://www.youtube.com/watch?v=U1JhfjEm-xY',
      },
      {
        id: 'mmj-step-9',
        order: 9,
        title: "Cidde Havalimanı'na Dönüş",
        city: 'Jeddah',
        type: 'return',
        shortDescription:
          "Mekke'den Cidde Havalimanı'na geçiş ve dönüş uçuşu hazırlığı.",
        content:
          "Dönüş günü Mekke'den Cidde Havalimanı'na geçilir. " +
          'Uçuş saatinizi, terminal bilginizi, bagajınızı ve pasaportunuzu önceden kontrol edin. ' +
          'Trafik veya yoğunluk ihtimaline karşı havalimanına erken hareket etmek önemlidir. ' +
          'Zemzem taşıma kuralları ve havayolu bagaj limitleri de dönüş öncesinde kontrol edilmelidir.',
        checklist: [
          'Uçuş saatini kontrol et',
          'Terminal bilgisini kontrol et',
          'Pasaportunu hazırla',
          'Bagajını hazırla',
          'Zemzem taşıma kurallarını kontrol et',
          'Otelden çıkış saatini belirle',
          'Cidde Havalimanı transferini netleştir',
        ],
        videoUrl: 'https://www.youtube.com/watch?v=TwiiDcxo4wQ',
        transportOptions: [
          {
            type: 'train',
            title: 'Haramain Yüksek Hızlı Treni',
            description:
              "Mekke'den Cidde Havalimanı istasyonuna yaklaşık 40 dakikada ulaşır.",
            recommendedFor: 'Hızlı ve ekonomik ulaşım isteyenler',
            videos: [
              {
                label: 'Haramain Hızlı Tren Rehberi',
                url: 'https://www.youtube.com/watch?v=BOoFWqMtv4A',
              },
              {
                label:
                  'Kâbe Bölgesinden (Harem Bölgesi) Mekke Hızlı Tren İstasyonuna Gidiş (Otobüs)',
                url: 'https://www.youtube.com/watch?v=TfKriqR2Eio',
              },
              {
                label:
                  'Kâbe Bölgesinden (Harem Bölgesi) Mekke Hızlı Tren İstasyonu ve Cidde Havlimanına Gidiş (Taksi-Hızlı Tren)',
                url: 'https://www.youtube.com/watch?v=TwiiDcxo4wQ',
              },
            ],
          },
          {
            type: 'taxi',
            title: 'Taksi / Careem',
            description:
              "Mekke'den doğrudan havalimanı terminaline ulaşım. Yolculuk yaklaşık 1 saat.",
            recommendedFor: 'Bagajı bol yolcular',
          },
          {
            type: 'private_transfer',
            title: 'Özel Transfer',
            description:
              'Otelden havalimanı kapısına kadar kapıdan kapıya hizmet.',
            recommendedFor: 'Aileler ve yaşlı yolcular',
          },
          {
            type: 'bus',
            title: 'SAPTCO Otobüsü',
            description:
              "Mekke otogarından Cidde Havalimanı'na düzenli seferler.",
            recommendedFor: 'Ekonomik seyahat tercih edenler',
            videos: [
              {
                label: '1- Jarwal Garajına Nasıl Gidilir ?',
                url: 'https://www.youtube.com/watch?v=x-uMYfpvcRk&t=1139s',
              },
              {
                label:
                  "2- Jarwal Garajından Cidde'ye Otobüs ve Taksiler (Fiyat Bilgileri)",
                url: 'https://www.youtube.com/watch?v=lquQC6hLXx8',
              },
            ],
          },
        ],
      },
      {
        id: 'mmj-step-10',
        order: 10,
        title: 'Cidde Havalimanı Dönüş İşlemleri',
        city: 'Jeddah',
        type: 'return',
        shortDescription: 'Check-in, güvenlik ve dönüş uçuşu hazırlığı.',
        content:
          "Cidde Havalimanı'na ulaştıktan sonra havayolunuzun terminalini doğrulayın. " +
          'Check-in işlemini tamamlayın, bagajınızı teslim edin ve pasaport/güvenlik kontrolünden geçin. ' +
          'Zemzem suyu taşıma kurallarına ve havayolu bagaj sınırlarına dikkat edin. ' +
          'Gate bilgisini ekrana bakarak takip edin ve uçuş saatinden en az 2 saat önce kapıda olun.',
        checklist: [
          'Terminal bilgisi kontrol edildi',
          'Check-in tamamlandı, kart alındı',
          'Bagaj teslim edildi',
          'Pasaport kontrolünden geçildi',
          'Güvenlik kontrolünden geçildi',
          'Gate numarası öğrenildi',
          'Zemzem ambalajı ve bagaj limiti kontrol edildi',
          "Uçuş saatinden 2 saat önce gate'de hazır olundu",
        ],
        videoUrl: 'https://www.youtube.com/watch?v=oXKAF5zOefE&t=91s',
      },
    ],
  },
];
