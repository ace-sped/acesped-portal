'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Upload, X, User, Users, 
  GraduationCap, Briefcase, FileText, Camera,
  Mail, Phone, MapPin, Calendar, BookOpen, CreditCard,
  Info, AlertTriangle, XCircle, CheckCircle
} from 'lucide-react';
import { TbCurrencyNaira } from 'react-icons/tb';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';

type ApplicationStep = 
  | 'requirements' 
  | 'personal' 
  | 'nextOfKin' 
  | 'program' 
  | 'education' 
  | 'employment' 
  | 'research' 
  | 'recommendations' 
  | 'payment';

interface ApplicationData {
  // Personal Information
  email: string;
  firstname: string;
  surname: string;
  middlename: string;
  maidenName: string;
  nationalId: string;
  nationalIdFile: string;
  maritalStatus: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phoneNumber: string;
  alternatePhone: string;
  address: string;
  homeAddress: string;
  homeTown: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  religion: string;
  avatar: string;
  
  // Next of Kin
  kinFirstname: string;
  kinSurname: string;
  kinRelationship: string;
  kinPhone: string;
  kinEmail: string;
  kinAddress: string;
  
  // Program Selection
  programType: string;
  programChoice: string;
  admissionSession: string;
  modeOfStudy: string;
  
  // Educational Background
  previousDegree: string;
  previousInstitution: string;
  previousGraduationYear: string;
  previousGPA: string;
  previousFieldOfStudy: string;
  transcriptFile: string;
  certificateFile: string;
  
  // Employment Details
  employmentStatus: string;
  currentEmployer: string;
  jobTitle: string;
  employmentStartDate: string;
  employmentEndDate: string;
  reasonForPursuing: string;
  
  // Research Proposal
  researchTitle: string;
  researchAbstract: string;
  researchObjectives: string;
  researchMethodology: string;
  proposalFile: string;
  
  // Recommendations
  referee1Name: string;
  referee1Email: string;
  referee1Phone: string;
  referee1Institution: string;
  referee2Name: string;
  referee2Email: string;
  referee2Phone: string;
  referee2Institution: string;
  
  // Payment
  paymentMethod: string;
  paymentReference: string;
  paymentProof: string;
}

// Location data structure
const locationData: Record<string, Record<string, string[]>> = {
  Afghanistan: {
    'Kabul': ['Kabul City', 'Paghman', 'Mir Bacha Kot'],
    'Kandahar': ['Kandahar City', 'Spin Boldak', 'Daman'],
  },
  Algeria: {
    'Algiers': ['Algiers City', 'Bab El Oued', 'Hussein Dey'],
    'Oran': ['Oran City', 'Es Senia', 'Bir El Djir'],
  },
  Argentina: {
    'Buenos Aires': ['Buenos Aires City', 'La Plata', 'Mar del Plata'],
    'Córdoba': ['Córdoba City', 'Villa María', 'Río Cuarto'],
  },
  Australia: {
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Canberra'],
    'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
    'Queensland': ['Brisbane', 'Gold Coast', 'Townsville', 'Cairns'],
    'Western Australia': ['Perth', 'Fremantle', 'Bunbury', 'Albany'],
  },
  Bangladesh: {
    'Dhaka': ['Dhaka City', 'Gazipur', 'Narayanganj', 'Savar'],
    'Chittagong': ['Chittagong City', 'Coxs Bazar', 'Rangamati'],
  },
  Belgium: {
    'Brussels': ['Brussels City', 'Anderlecht', 'Schaerbeek'],
    'Antwerp': ['Antwerp City', 'Mechelen', 'Turnhout'],
  },
  Brazil: {
    'São Paulo': ['São Paulo City', 'Campinas', 'Santos', 'Guarulhos'],
    'Rio de Janeiro': ['Rio de Janeiro City', 'Niterói', 'Duque de Caxias'],
    'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Contagem'],
  },
  Cameroon: {
    'Centre': ['Yaoundé', 'Mbalmayo', 'Obala'],
    'Littoral': ['Douala', 'Nkongsamba', 'Edéa'],
  },
  Canada: {
    'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby'],
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'],
  },
  Chile: {
    'Santiago': ['Santiago City', 'Puente Alto', 'Maipú'],
    'Valparaíso': ['Valparaíso City', 'Viña del Mar', 'Quilpué'],
  },
  China: {
    'Beijing': ['Beijing City', 'Haidian', 'Chaoyang'],
    'Shanghai': ['Shanghai City', 'Pudong', 'Minhang'],
    'Guangdong': ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan'],
  },
  Colombia: {
    'Bogotá': ['Bogotá City', 'Soacha', 'Chía'],
    'Antioquia': ['Medellín', 'Bello', 'Itagüí'],
  },
  'Côte d\'Ivoire': {
    'Abidjan': ['Abidjan City', 'Abobo', 'Yopougon', 'Cocody'],
    'Yamoussoukro': ['Yamoussoukro City'],
  },
  Egypt: {
    'Cairo': ['Cairo City', 'Giza', 'Shubra El Kheima', 'Helwan'],
    'Alexandria': ['Alexandria City', 'Borg El Arab', 'Abu Qir'],
  },
  Ethiopia: {
    'Addis Ababa': ['Addis Ababa City', 'Bole', 'Kirkos'],
    'Oromia': ['Adama', 'Jimma', 'Bishoftu'],
  },
  France: {
    'Île-de-France': ['Paris', 'Versailles', 'Boulogne-Billancourt', 'Nanterre'],
    'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence'],
    'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne', 'Villeurbanne'],
  },
  Germany: {
    'Bavaria': ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
    'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen'],
    'Berlin': ['Berlin City', 'Charlottenburg', 'Neukölln'],
  },
  Ghana: {
    'Greater Accra': ['Accra', 'Tema', 'Madina', 'Ashaiman'],
    'Ashanti': ['Kumasi', 'Obuasi', 'Mampong', 'Konongo'],
    'Western': ['Sekondi-Takoradi', 'Tarkwa', 'Axim', 'Elubo'],
    'Eastern': ['Koforidua', 'Akim Oda', 'Mpraeso', 'Nsawam'],
    'Northern': ['Tamale', 'Yendi', 'Bimbilla', 'Savelugu'],
  },
  India: {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
    'Delhi': ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  },
  Indonesia: {
    'Jakarta': ['Jakarta City', 'South Jakarta', 'East Jakarta', 'Central Jakarta'],
    'West Java': ['Bandung', 'Bekasi', 'Bogor', 'Depok'],
  },
  Italy: {
    'Lazio': ['Rome', 'Latina', 'Frosinone', 'Viterbo'],
    'Lombardy': ['Milan', 'Brescia', 'Bergamo', 'Monza'],
    'Campania': ['Naples', 'Salerno', 'Caserta', 'Benevento'],
  },
  Japan: {
    'Tokyo': ['Tokyo City', 'Shinjuku', 'Shibuya', 'Minato'],
    'Osaka': ['Osaka City', 'Sakai', 'Higashiosaka'],
    'Kanagawa': ['Yokohama', 'Kawasaki', 'Sagamihara'],
  },
  Kenya: {
    'Nairobi': ['Nairobi', 'Westlands', 'Embakasi', 'Kasarani'],
    'Mombasa': ['Mombasa', 'Likoni', 'Kisauni', 'Changamwe'],
    'Kisumu': ['Kisumu', 'Ahero', 'Maseno', 'Kombewa'],
    'Nakuru': ['Nakuru', 'Naivasha', 'Gilgil', 'Molo'],
  },
  Malaysia: {
    'Kuala Lumpur': ['Kuala Lumpur City', 'Petaling Jaya', 'Subang Jaya'],
    'Selangor': ['Shah Alam', 'Klang', 'Kajang', 'Ampang'],
  },
  Mexico: {
    'Mexico City': ['Mexico City', 'Iztapalapa', 'Ecatepec'],
    'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque'],
  },
  Morocco: {
    'Casablanca-Settat': ['Casablanca', 'Mohammedia', 'El Jadida'],
    'Rabat-Salé-Kénitra': ['Rabat', 'Salé', 'Kénitra'],
  },
  Netherlands: {
    'North Holland': ['Amsterdam', 'Haarlem', 'Zaanstad', 'Haarlemmermeer'],
    'South Holland': ['Rotterdam', 'The Hague', 'Leiden', 'Delft'],
  },
  'New Zealand': {
    'Auckland': ['Auckland City', 'Manukau', 'North Shore'],
    'Wellington': ['Wellington City', 'Lower Hutt', 'Upper Hutt'],
  },
  Nigeria: {
    'Abia': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
    'Adamawa': ['Demsa', 'Fufore', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
    'Akwa Ibom': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'],
    'Anambra': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
    'Bauchi': ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
    'Bayelsa': ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
    'Benue': ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Oturkpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
    'Borno': ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
    'Cross River': ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala'],
    'Delta': ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'],
    'Ebonyi': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
    'Edo': ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Orhionmwon', 'Oredo', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
    'Ekiti': ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'],
    'Enugu': ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'],
    'FCT': ['Abaji', 'Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'],
    'Gombe': ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],
    'Imo': ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West', 'Unuimo'],
    'Jigawa': ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Kaugama', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
    'Kaduna': ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
    'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
    'Katsina': ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
    'Kebbi': ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'],
    'Kogi': ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
    'Kwara': ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'],
    'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
    'Nasarawa': ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
    'Niger': ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
    'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu'],
    'Ondo': ['Akoko North-East', 'Akoko North-West', 'Akoko South-West', 'Akoko South-East', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
    'Osun': ['Atakunmosa East', 'Atakunmosa West', 'Aiyedaade', 'Aiyedire', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Egbedore', 'Ejigbo', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'],
    'Oyo': ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'],
    'Plateau': ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase'],
    'Rivers': ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emuoha', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
    'Sokoto': ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
    'Taraba': ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
    'Yobe': ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
    'Zamfara': ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Chafe', 'Zurmi'],
  },
  Pakistan: {
    'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan'],
    'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana'],
  },
  Philippines: {
    'Metro Manila': ['Manila City', 'Quezon City', 'Makati', 'Pasig'],
    'Cebu': ['Cebu City', 'Mandaue', 'Lapu-Lapu'],
  },
  Poland: {
    'Masovian': ['Warsaw', 'Radom', 'Płock', 'Siedlce'],
    'Lesser Poland': ['Kraków', 'Tarnów', 'Nowy Sącz'],
  },
  Portugal: {
    'Lisbon': ['Lisbon City', 'Sintra', 'Cascais', 'Loures'],
    'Porto': ['Porto City', 'Vila Nova de Gaia', 'Matosinhos'],
  },
  'Saudi Arabia': {
    'Riyadh': ['Riyadh City', 'Diriyah', 'Al Kharj'],
    'Makkah': ['Mecca', 'Jeddah', 'Taif'],
  },
  Senegal: {
    'Dakar': ['Dakar City', 'Pikine', 'Guédiawaye'],
    'Thiès': ['Thiès City', 'Mbour', 'Tivaouane'],
  },
  Singapore: {
    'Singapore': ['Central Singapore', 'Tampines', 'Jurong', 'Woodlands'],
  },
  'South Africa': {
    'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Midrand'],
    'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl', 'George'],
    'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Newcastle'],
    'Eastern Cape': ['Port Elizabeth', 'East London', 'Mthatha', 'Grahamstown'],
  },
  'South Korea': {
    'Seoul': ['Seoul City', 'Gangnam', 'Jongno', 'Mapo'],
    'Busan': ['Busan City', 'Haeundae', 'Suyeong'],
  },
  Spain: {
    'Madrid': ['Madrid City', 'Móstoles', 'Alcalá de Henares', 'Fuenlabrada'],
    'Catalonia': ['Barcelona', 'L\'Hospitalet', 'Badalona', 'Terrassa'],
    'Andalusia': ['Seville', 'Málaga', 'Córdoba', 'Granada'],
  },
  Sweden: {
    'Stockholm': ['Stockholm City', 'Solna', 'Sundbyberg'],
    'Västra Götaland': ['Gothenburg', 'Borås', 'Mölndal'],
  },
  Switzerland: {
    'Zurich': ['Zurich City', 'Winterthur', 'Uster'],
    'Geneva': ['Geneva City', 'Vernier', 'Lancy'],
  },
  Tanzania: {
    'Dar es Salaam': ['Dar es Salaam City', 'Kinondoni', 'Ilala'],
    'Arusha': ['Arusha City', 'Meru', 'Monduli'],
  },
  Thailand: {
    'Bangkok': ['Bangkok City', 'Chatuchak', 'Bang Rak', 'Pathum Wan'],
    'Chiang Mai': ['Chiang Mai City', 'Hang Dong', 'San Kamphaeng'],
  },
  Turkey: {
    'Istanbul': ['Istanbul City', 'Kadıköy', 'Üsküdar', 'Beşiktaş'],
    'Ankara': ['Ankara City', 'Çankaya', 'Keçiören'],
  },
  UAE: {
    'Dubai': ['Dubai City', 'Deira', 'Bur Dubai', 'Jumeirah'],
    'Abu Dhabi': ['Abu Dhabi City', 'Al Ain', 'Al Dhafra'],
  },
  Uganda: {
    'Central': ['Kampala', 'Entebbe', 'Mukono', 'Wakiso'],
    'Western': ['Mbarara', 'Fort Portal', 'Kasese'],
  },
  'United Kingdom': {
    'England': ['London', 'Manchester', 'Birmingham', 'Liverpool'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
    'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newry'],
  },
  USA: {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
    'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Joliet'],
  },
  Vietnam: {
    'Hanoi': ['Hanoi City', 'Ba Đình', 'Hoàn Kiếm', 'Đống Đa'],
    'Ho Chi Minh City': ['Ho Chi Minh City', 'District 1', 'District 3', 'Bình Thạnh'],
  },
  Zimbabwe: {
    'Harare': ['Harare City', 'Chitungwiza', 'Epworth'],
    'Bulawayo': ['Bulawayo City', 'Pumula', 'Nkulumane'],
  },
};

const PAYMENT_STORAGE_KEY = 'acePaymentRecord';

export default function ApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('requirements');
  const [acceptedRequirements, setAcceptedRequirements] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [duplicateApplication, setDuplicateApplication] = useState<{ exists: boolean; applicationNumber: string | null }>({
    exists: false,
    applicationNumber: null,
  });
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);
  const [duplicateCheckError, setDuplicateCheckError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
const [alertModal, setAlertModal] = useState<{
  title: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
} | null>(null);
  
  const [formData, setFormData] = useState<ApplicationData>({
    email: '',
    firstname: '',
    surname: '',
    middlename: '',
    maidenName: '',
    nationalId: '',
    nationalIdFile: '',
    maritalStatus: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Nigeria',
    phoneNumber: '',
    alternatePhone: '',
    address: '',
    homeAddress: '',
    homeTown: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    religion: '',
    avatar: '',
    kinFirstname: '',
    kinSurname: '',
    kinRelationship: '',
    kinPhone: '',
    kinEmail: '',
    kinAddress: '',
    programType: '',
    programChoice: '',
    admissionSession: '',
    modeOfStudy: '',
    previousDegree: '',
    previousInstitution: '',
    previousGraduationYear: '',
    previousGPA: '',
    previousFieldOfStudy: '',
    transcriptFile: '',
    certificateFile: '',
    employmentStatus: '',
    currentEmployer: '',
    jobTitle: '',
    employmentStartDate: '',
    employmentEndDate: '',
    reasonForPursuing: '',
    researchTitle: '',
    researchAbstract: '',
    researchObjectives: '',
    researchMethodology: '',
    proposalFile: '',
    referee1Name: '',
    referee1Email: '',
    referee1Phone: '',
    referee1Institution: '',
    referee2Name: '',
    referee2Email: '',
    referee2Phone: '',
    referee2Institution: '',
    paymentMethod: 'Paystack',
    paymentReference: '',
    paymentProof: '',
  });

  // Handle country change
  const handleCountryChange = (country: string) => {
    setFormData({ ...formData, country, state: '', city: '' });
    setAvailableStates(country ? Object.keys(locationData[country] || {}) : []);
    setAvailableCities([]);
  };

  // Handle state change
  const handleStateChange = (state: string) => {
    setFormData({ ...formData, state, city: '' });
    setAvailableCities(
      formData.country && state ? locationData[formData.country][state] || [] : []
    );
  };

  // Paystack payment handler - mirrors SkillApplication dynamic initialize flow
  const handlePaystackPayment = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      // Validate email
      if (!formData.email || formData.email.trim() === '') {
        openAlertModal(
          'Email Required',
          'Please fill in your email address before proceeding to payment.',
          'warning'
        );
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        openAlertModal('Invalid Email Address', 'Please enter a valid email address.', 'warning');
        return;
      }

      const amountInNaira = getApplicationPriceInNaira();
      if (!amountInNaira || amountInNaira <= 0) {
        openAlertModal(
          'Invalid Application Fee',
          'The application fee amount is unavailable. Please contact support.',
          'error'
        );
        return;
      }

      // Store form data in sessionStorage before redirecting
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('aceApplicationData', JSON.stringify(formData));
          sessionStorage.setItem('aceApplicationStep', currentStep);
        } catch (storageError) {
          console.error('Error saving to sessionStorage:', storageError);
        }

        try {
          const response = await fetch('/api/payments/initialize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              amount: amountInNaira * 100, // Paystack expects kobo
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success || !data.authorization_url) {
            console.error('Failed to initialize payment:', data);
            openAlertModal(
              'Payment Initialization Failed',
              data.message || 'Failed to initialize payment. Please try again.',
              'error'
            );
            return;
          }

          console.log('Redirecting to Paystack payment page:', data.authorization_url);
          window.location.href = data.authorization_url;
        } catch (initError) {
          console.error('Error initializing Paystack payment:', initError);
          openAlertModal(
            'Payment Error',
            'An error occurred while initializing payment. Please try again.',
            'error'
          );
        }
      } else {
        openAlertModal(
          'Payment Unavailable',
          'Unable to proceed with payment. Please try again.',
          'error'
        );
      }
    } catch (error: any) {
      console.error('Error in handlePaystackPayment:', error);
      openAlertModal(
        'Payment Error',
        'An error occurred while processing your payment request. Please try again.',
        'error'
      );
    }
  };

  const steps: { id: ApplicationStep; title: string; icon: any }[] = [
    { id: 'requirements', title: 'Requirements', icon: FileText },
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'nextOfKin', title: 'Next of Kin', icon: Users },
    { id: 'program', title: 'Program', icon: GraduationCap },
    { id: 'education', title: 'Education', icon: BookOpen },
    { id: 'employment', title: 'Employment', icon: Briefcase },
    { id: 'research', title: 'Research', icon: FileText },
    { id: 'recommendations', title: 'Recommendations', icon: Mail },
    { id: 'payment', title: 'Payment', icon: TbCurrencyNaira },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const programStepIndex = steps.findIndex(step => step.id === 'program');

  const openAlertModal = (
    title: string,
    message: string,
    variant: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    setAlertModal({ title, message, variant });
  };

  const duplicateWarningText = duplicateApplication.exists
    ? `An application for ${formData.email || 'this email'} in ${formData.admissionSession || 'this session'} already exists${
        duplicateApplication.applicationNumber ? ` (Ref: ${duplicateApplication.applicationNumber})` : ''
      }. Please update the email address or choose another session before continuing.`
    : '';

  const isNextDisabled =
    (currentStep === 'requirements' && !acceptedRequirements) || duplicateApplication.exists;

  const goToStep = (stepId: ApplicationStep) => {
    const targetIndex = steps.findIndex(step => step.id === stepId);
    if (
      duplicateApplication.exists &&
      targetIndex > programStepIndex
    ) {
      openAlertModal('Existing Application', duplicateWarningText, 'warning');
      return;
    }

    // On the requirements step, user must accept before navigating away
    if (currentStep === 'requirements' && stepId !== 'requirements' && !acceptedRequirements) {
      openAlertModal(
        'Accept Requirements',
        'Please read and accept the requirements before proceeding.',
        'warning'
      );
      return;
    }

    setCurrentStep(stepId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFileUpload = (field: keyof ApplicationData, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      openAlertModal('File Too Large', 'File size must be less than 5MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, [field]: base64String });
      if (field === 'avatar') {
        setAvatarPreview(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (duplicateApplication.exists) {
      openAlertModal('Existing Application', duplicateWarningText, 'warning');
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        return;
      }

      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message ||
        (response.status === 409
          ? 'You have already submitted an application for this session.'
          : 'Failed to submit application.');

      openAlertModal('Unable to Submit', errorMessage, 'error');
    } catch (error) {
      console.error('Error:', error);
      openAlertModal('Submission Error', 'An error occurred while submitting your application.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load programs for the application (optionally scoped to a specific service)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const serviceSlug = urlParams.get('service');
    const programSlug = urlParams.get('program');

    const fetchPrograms = async () => {
      try {
        setProgramsLoading(true);
        setProgramsError(null);

        const endpoint = serviceSlug
          ? `/api/services/${serviceSlug}/programs`
          : '/api/programs';

        const response = await fetch(endpoint);
        const data = await response.json();

        if (!response.ok || !data.success) {
          const message =
            data?.message ||
            `Failed to fetch programs${serviceSlug ? ' for selected service' : ''}`;
          setProgramsError(message);
          return;
        }

        const fetchedPrograms = Array.isArray(data.programs) ? data.programs : [];
        setPrograms(fetchedPrograms);

        // If a specific program slug is provided, pre-select that program
        if (programSlug) {
          const matchedProgram = fetchedPrograms.find(
            (p: any) => p.slug === programSlug
          );
          if (matchedProgram) {
            setSelectedProgram(matchedProgram);
            setFormData(prev => ({
              ...prev,
              programChoice: matchedProgram.title || prev.programChoice,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching programs for application:', error);
        setProgramsError('Error loading programs. Please try again.');
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Keep selectedProgram in sync with the chosen program title from the database list.
  // This is important after returning from Paystack, when we restore formData (including programChoice)
  // but need to re-link it to the actual program record (with its fee) from the API.
  useEffect(() => {
    if (!programs || programs.length === 0) return;
    if (!formData.programChoice || formData.programChoice.trim() === '') return;

    const matched = programs.find(
      (p: any) => p.title === formData.programChoice
    );
    setSelectedProgram(matched || null);
  }, [programs, formData.programChoice]);

  // Check if this email already has an application in the selected admission session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const email = formData.email?.trim() || '';
    const session = formData.admissionSession?.trim() || '';

    if (!email || !session) {
      setDuplicateApplication({ exists: false, applicationNumber: null });
      setDuplicateCheckError(null);
      setDuplicateCheckLoading(false);
      return;
    }

    const controller = new AbortController();
    setDuplicateCheckLoading(true);
    setDuplicateCheckError(null);

    const handler = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          email,
          admissionSession: session,
        });
        const response = await fetch(`/api/applications/check?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          if (controller.signal.aborted) return;
          setDuplicateApplication({ exists: false, applicationNumber: null });
          setDuplicateCheckError(
            data?.message || 'Unable to verify if this email already has an application.'
          );
          setDuplicateCheckLoading(false);
          return;
        }

        setDuplicateApplication({
          exists: Boolean(data.exists),
          applicationNumber: data.applicationNumber ?? null,
        });
        setDuplicateCheckError(null);
      } catch (error: any) {
        if (controller.signal.aborted) return;
        console.error('Error checking existing application:', error);
        setDuplicateApplication({ exists: false, applicationNumber: null });
        setDuplicateCheckError(
          error?.message || 'Unable to verify if this email already has an application.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setDuplicateCheckLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [formData.email, formData.admissionSession]);

  // Helper to get the numeric application fee in Naira for Paystack
  // Primary source: `fee` field from the selected program in the database.
  // Fallback: flat ₦25,000 if no valid fee is set.
  const getApplicationPriceInNaira = (): number => {
    const fee = selectedProgram?.fee;

    if (fee && typeof fee === 'string' && fee.trim() !== '') {
      const numeric = parseInt(fee.replace(/[₦,\s]/g, ''), 10);
      if (!isNaN(numeric) && numeric > 0) {
        return numeric;
      }
    }

    // Default application fee if no valid fee is set on the program
    return 25000;
  };

  // Display string for the application fee (reactive to selectedProgram changes)
  const applicationFeeDisplay = useMemo(() => {
    const amount = getApplicationPriceInNaira();
    return `₦${amount.toLocaleString()}`;
  }, [selectedProgram]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'requirements':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">2025-2026  ACESPED APPLICATION FORM FOR POSTGRADUATE PROGRAMMES</h2>
            <p>Welcome to the application page of the Africa Centre of Excellence for Sustainable Energy and Power Development (ACESPED).</p>
            <p>You would be expected to submit the following types of  information during the course of your application:</p>            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">You would be expected to submit the following types of  information during the course of your application:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Valid email address and phone number</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Personal Information (including a clear passport photograph in PNG or JPEG format, and a Passport Number for International Applicants).</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Next of Kin Details</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Intended Programme Details</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Previous Educational Background.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Employment Details</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Research Proposal - A draft two paged research proposal containing a proposed  research title, statement of problem, aim, objectives, proposed methodology (MS Word format - .doc or .docx)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Two recommendation letters signed by your previous Supervisors (in PDF format)</span>
                </li>                
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-4">List of Attachments Required</h3>
              <h4>For avoidance of doubt, please get the following files ready before you commence the application process:</h4>
              
              <ul className="space-y-2 mt-4 text-gray-700 dark:text-gray-300">               
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Passport ID Data Page/ National ID Information (PDF format)</span>
                </li>  
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Passport Photograph (PNG/JPEG format)</span>
                </li>  
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Unofficial Transcript for Bachelors/Masters Certificates merged as one document (PDF format) - <em>Optional: Can be presented during admission clearance</em></span>
                </li>  
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">A copy of your Bachelors and/or Masters Project Report (PDF format)</span>
                </li>  
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Two Recommendation letters (PDF format)</span>
                </li> 
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">A Two paged Research Proposal (MS Word format - .doc or .docx)</span>
                </li>                
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">The Application Deadline is December 2025</h3>
              <h2>Prof. Cosmas Anyanwu</h2>
              <p>Chairman, Admission Committee,</p>
              <p>Africa Centre of Excellence for Sustainable Energy and Power Development (ACESPED),</p>
              <p>University of Nigeria Nsukka.</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="accept-requirements"
                checked={acceptedRequirements}
                onChange={(e) => setAcceptedRequirements(e.target.checked)}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="accept-requirements" className="ml-3 text-gray-700 dark:text-gray-300">
                I have read and understood all the requirements and I'm ready to proceed
              </label>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
            
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Passport Photograph *
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative h-32 w-32 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                      <Image 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                      <Camera className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload('avatar', e.target.files[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Photo
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Max size: 2MB. Formats: JPG, PNG
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middlename}
                  onChange={(e) => setFormData({ ...formData, middlename: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="Michael"
                />
              </div> 
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maiden Name
                </label>
                <input
                  type="text"
                  value={formData.maidenName}
                  onChange={(e) => setFormData({ ...formData, maidenName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="Enter maiden name if applicable"
                />
              </div>             
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marital Status *
                </label>
                <select
                  required
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country of Residence *
                </label>
                <select
                  required
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white overflow-y-auto"
                  style={{ height: 'auto' }}
                >
                  {Object.keys(locationData).sort().map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Residential Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>                
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nationality*
                </label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white overflow-y-auto"
                  style={{ height: 'auto' }}
                >
                  <option value="">Select Country</option>
                  {Object.keys(locationData).sort().map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State of Origin
                </label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={!formData.country}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto"
                  style={{ height: 'auto' }}
                >
                  <option value="">Select State</option>
                  {availableStates.sort().map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Local Government Area or Municipality
                </label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!formData.state}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto"
                  style={{ height: 'auto' }}
                >
                  <option value="">Select City/LGA</option>
                  {availableCities.sort().map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Home Town *
                </label>
                <input
                  type="text"
                  required
                  value={formData.homeTown}
                  onChange={(e) => setFormData({ ...formData, homeTown: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="Enter your home town"
                />
              </div>
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    National ID No (NIN/International Passport Number) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white mb-3"
                    placeholder="Enter your NIN or International Passport Number"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="national-id-upload"
                    accept="application/pdf,image/*"
                    onChange={(e) => e.target.files && handleFileUpload('nationalIdFile', e.target.files[0])}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="national-id-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    {formData.nationalIdFile ? 'Change Document' : 'Upload NIN/Passport'}
                  </label>
                  {formData.nationalIdFile && (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Document uploaded
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Upload a copy of your NIN card or International Passport data page. Max size: 5MB. Formats: PDF, JPG, PNG
                </p>
              </div>
            </div>      

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Religion *
              </label>
              <select
                required
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              >
                <option value="">Select Religion</option>
                <option value="Christianity">Christianity</option>
                <option value="Islam">Islam</option>
                <option value="Traditional">Traditional</option>
                <option value="Other">Other</option>
              </select>
            </div>           
          </div>
        );

      case 'nextOfKin':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Next of Kin Information</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please provide details of your next of kin or emergency contact person
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.kinFirstname}
                  onChange={(e) => setFormData({ ...formData, kinFirstname: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  value={formData.kinSurname}
                  onChange={(e) => setFormData({ ...formData, kinSurname: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relationship *
                </label>
                <select
                  required
                  value={formData.kinRelationship}
                  onChange={(e) => setFormData({ ...formData, kinRelationship: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select Relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.kinPhone}
                  onChange={(e) => setFormData({ ...formData, kinPhone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.kinEmail}
                onChange={(e) => setFormData({ ...formData, kinEmail: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                placeholder="jane.doe@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address *
              </label>
              <textarea
                required
                value={formData.kinAddress}
                onChange={(e) => setFormData({ ...formData, kinAddress: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                placeholder="Complete address of next of kin"
              />
            </div>
          </div>
        );

      case 'program':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Program Selection</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select the program you wish to apply for
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Program Type *
                </label>
                <select
                  required
                  value={formData.programType}
                  onChange={(e) => setFormData({ ...formData, programType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select Program Type</option>
                  <option value="PhD">PhD</option>
                  <option value="Masters">Masters</option>
                  <option value="PGD">Postgraduate Diploma (PGD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admission Session *
                </label>
                <select
                  required
                  value={formData.admissionSession}
                  onChange={(e) => setFormData({ ...formData, admissionSession: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select Session</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
                {duplicateCheckLoading && (
                  <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">Checking existing applications...</p>
                )}
                {duplicateApplication.exists && (
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    An application for <strong>{formData.email || 'this email'}</strong> in{' '}
                    <strong>{formData.admissionSession || 'this session'}</strong> already exists
                    {duplicateApplication.applicationNumber ? ` (Ref: ${duplicateApplication.applicationNumber})` : ''}.
                    Please use a different email address or choose another session before continuing.
                  </div>
                )}
                {!duplicateApplication.exists && duplicateCheckError && (
                  <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-300">
                    {duplicateCheckError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Program Choice *
              </label>
              <select
                required
                value={formData.programChoice}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, programChoice: value });
                  const matched = programs.find((p: any) => p.title === value);
                  setSelectedProgram(matched || null);
                }}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              >
                <option value="">
                  {programsLoading
                    ? 'Loading programs...'
                    : 'Select Program'}
                </option>
                {!programsLoading &&
                  programs.map((program: any) => (
                    <option key={program.id} value={program.title}>
                      {program.title}
                    </option>
                  ))}
              </select>
              {!programsLoading && programsError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {programsError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mode of Study *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                  <input
                    type="radio"
                    name="modeOfStudy"
                    value="Full-time"
                    checked={formData.modeOfStudy === 'Full-time'}
                    onChange={(e) => setFormData({ ...formData, modeOfStudy: e.target.value })}
                    className="h-5 w-5 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white font-medium">Full-time</span>
                </label>
                <label className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                  <input
                    type="radio"
                    name="modeOfStudy"
                    value="Part-time"
                    checked={formData.modeOfStudy === 'Part-time'}
                    onChange={(e) => setFormData({ ...formData, modeOfStudy: e.target.value })}
                    className="h-5 w-5 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white font-medium">Part-time</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Educational Background</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Provide details of your previous academic qualifications
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Previous Degree *
                </label>
                <input
                  type="text"
                  required
                  value={formData.previousDegree}
                  onChange={(e) => setFormData({ ...formData, previousDegree: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="e.g., Bachelor of Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Field of Study *
                </label>
                <input
                  type="text"
                  required
                  value={formData.previousFieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, previousFieldOfStudy: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="e.g., Electrical Engineering"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Institution *
              </label>
              <input
                type="text"
                required
                value={formData.previousInstitution}
                onChange={(e) => setFormData({ ...formData, previousInstitution: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                placeholder="Name of university or institution"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year of Graduation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.previousGraduationYear}
                  onChange={(e) => setFormData({ ...formData, previousGraduationYear: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="2020"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GPA/CGPA *
                </label>
                <input
                  type="text"
                  required
                  value={formData.previousGPA}
                  onChange={(e) => setFormData({ ...formData, previousGPA: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="e.g., 3.75/4.00"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Transcript and Certificate uploads are optional at this stage. These documents will be presented during admission clearance at ACE-SPED.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Transcript (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files && handleFileUpload('transcriptFile', e.target.files[0])}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF only, max 5MB. To be presented during admission clearance.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Certificate (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files && handleFileUpload('certificateFile', e.target.files[0])}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF only, max 5MB. To be presented during admission clearance.</p>
              </div>
            </div>
          </div>
        );

      case 'employment':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Employment Details</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Provide information about your current or most recent employment
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employment Status *
              </label>
              <select
                required
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              >
                <option value="">Select Status</option>
                <option value="Employed">Currently Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Student">Full-time Student</option>
              </select>
            </div>

            {formData.employmentStatus && formData.employmentStatus !== 'Unemployed' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Employer *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.currentEmployer}
                      onChange={(e) => setFormData({ ...formData, currentEmployer: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                      placeholder="Your position"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.employmentStartDate}
                      onChange={(e) => setFormData({ ...formData, employmentStartDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date (Leave empty if current)
                    </label>
                    <input
                      type="date"
                      value={formData.employmentEndDate}
                      onChange={(e) => setFormData({ ...formData, employmentEndDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Pursuing This Program *
              </label>
              <textarea
                required
                value={formData.reasonForPursuing}
                onChange={(e) => setFormData({ ...formData, reasonForPursuing: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                placeholder="Explain why you want to pursue this program and how it aligns with your career goals..."
              />
            </div>
          </div>
        );

      case 'research':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Research Proposal</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Provide details of your proposed research (Required for PhD and Masters programs)
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Research Title *
              </label>
              <input
                type="text"
                required
                value={formData.researchTitle}
                onChange={(e) => setFormData({ ...formData, researchTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                placeholder="Title of your proposed research"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Abstract *
              </label>
              <textarea
                required
                value={formData.researchAbstract}
                onChange={(e) => setFormData({ ...formData, researchAbstract: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                placeholder="Brief overview of your research (200-300 words)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Research Objectives *
              </label>
              <textarea
                required
                value={formData.researchObjectives}
                onChange={(e) => setFormData({ ...formData, researchObjectives: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                placeholder="List your main research objectives"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Methodology *
              </label>
              <textarea
                required
                value={formData.researchMethodology}
                onChange={(e) => setFormData({ ...formData, researchMethodology: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                placeholder="Describe your research methodology and approach"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Full Research Proposal *
              </label>
              <input
                type="file"
                required
                accept=".doc,.docx"
                onChange={(e) => e.target.files && handleFileUpload('proposalFile', e.target.files[0])}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MS Word document only (.doc or .docx), max 5MB</p>
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recommendations</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Provide contact details for two academic or professional referees
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Your referees will be contacted directly via email to submit their recommendations
              </p>
            </div>

            {/* Referee 1 */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">First Referee</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referee1Name}
                    onChange={(e) => setFormData({ ...formData, referee1Name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.referee1Email}
                      onChange={(e) => setFormData({ ...formData, referee1Email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                      placeholder="referee@university.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.referee1Phone}
                      onChange={(e) => setFormData({ ...formData, referee1Phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Institution/Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referee1Institution}
                    onChange={(e) => setFormData({ ...formData, referee1Institution: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="University or company name"
                  />
                </div>
              </div>
            </div>

            {/* Referee 2 */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Second Referee</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referee2Name}
                    onChange={(e) => setFormData({ ...formData, referee2Name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="Prof. Jane Doe"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.referee2Email}
                      onChange={(e) => setFormData({ ...formData, referee2Email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                      placeholder="referee@university.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.referee2Phone}
                      onChange={(e) => setFormData({ ...formData, referee2Phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Institution/Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referee2Institution}
                    onChange={(e) => setFormData({ ...formData, referee2Institution: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="University or company name"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Information</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your application by making the required payment via Paystack
            </p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-green-900 dark:text-green-100">Application Fee</h3>
                  <p className="text-5xl font-bold text-green-700 dark:text-green-300 mt-2">
                    {applicationFeeDisplay}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-full">
                  <CreditCard className="h-16 w-16 text-green-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  Secure Payment via Paystack
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Pay with Card (Visa, Mastercard, Verve)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Bank Transfer & USSD
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Mobile Money
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Instant payment confirmation
                  </li>
                </ul>
              </div>

              {!paymentCompleted ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Important:</strong> Please ensure your email address ({formData.email || 'not provided'}) is correct before proceeding to payment.
                    </p>
                  </div>

                  <button 
                    onClick={(e) => handlePaystackPayment(e)}
                    type="button"
                    disabled={!formData.email || formData.email.trim() === ''}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    <CreditCard className="h-6 w-6 mr-3" />
                    Pay {applicationFeeDisplay} with Paystack
                  </button>
                  {(!formData.email || formData.email.trim() === '') && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                      Please fill in your email address in the Personal Information section to proceed with payment
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-500 rounded-full p-2 mr-4">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-green-900 dark:text-green-100">Payment Successful!</h4>
                      <p className="text-green-700 dark:text-green-300">Your payment has been confirmed</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction Reference:</span>
                    </div>
                    <p className="font-mono text-lg font-semibold text-gray-900 dark:text-white break-all">
                      {formData.paymentReference}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>Note:</strong> After successful payment, you can proceed to submit your application. 
                You will receive a confirmation email with your application reference number within 24 hours.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check for payment callback on mount
  useEffect(() => {
    // Check if returning from Paystack payment
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');
      const trxref = urlParams.get('trxref');
      const paymentCallback = urlParams.get('payment_callback');
      const paymentRef = reference || trxref;
      
      if (paymentRef) {
        // Restore form data from sessionStorage if available
        const savedData = sessionStorage.getItem('aceApplicationData');
        const savedStep = sessionStorage.getItem('aceApplicationStep');
        let restoredApplicantEmail = '';
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            restoredApplicantEmail = parsedData?.email || '';
            setFormData({
              ...parsedData,
              paymentReference: paymentRef,
              paymentMethod: 'Paystack'
            });
            
            // Navigate to payment step
            if (savedStep) {
              setCurrentStep(savedStep as ApplicationStep);
            } else {
              setCurrentStep('payment');
            }
            
            // Clear sessionStorage
            sessionStorage.removeItem('aceApplicationData');
            sessionStorage.removeItem('aceApplicationStep');
          } catch (error) {
            console.error('Error restoring form data:', error);
          }
        } else {
          // Even if no saved data, update payment reference
          setFormData(prev => ({
            ...prev,
            paymentReference: paymentRef,
            paymentMethod: 'Paystack'
          }));
          // Navigate to payment step to show success
          setCurrentStep('payment');
        }
        
        // Always set payment completed if reference exists
        setPaymentCompleted(true);
        
        // Save payment reference to localStorage for persistence
        const paymentEmail = restoredApplicantEmail || formData.email || '';
        try {
          localStorage.setItem(
            PAYMENT_STORAGE_KEY,
            JSON.stringify({
              reference: paymentRef,
              email: paymentEmail,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (storageError) {
          console.error('Error storing payment record:', storageError);
        }
        
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        
        // Show success message
        openAlertModal(
          'Payment Successful',
          'Payment successful! You can now submit your application.',
          'success'
        );
      }
    }
  }, []);

  // Toggle payment completion based on reference value
  useEffect(() => {
    if (formData.paymentReference && formData.paymentReference.trim() !== '') {
      setPaymentCompleted(true);
    } else {
      setPaymentCompleted(false);
    }
  }, [formData.paymentReference]);

  // Attempt to restore payment reference when email matches stored record
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!formData.email || formData.email.trim() === '') return;

    const savedRecordRaw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (!savedRecordRaw) return;

    try {
      const savedRecord = JSON.parse(savedRecordRaw);
      if (!savedRecord?.reference || !savedRecord?.email) return;

      const normalizedEmail = formData.email.trim().toLowerCase();
      const savedEmail = String(savedRecord.email).trim().toLowerCase();

      if (normalizedEmail === savedEmail) {
        if (formData.paymentReference !== savedRecord.reference) {
          setFormData(prev => ({
            ...prev,
            paymentReference: savedRecord.reference,
            paymentMethod: 'Paystack',
          }));
        }
        setPaymentCompleted(true);
      } else if (formData.paymentReference) {
        setFormData(prev => ({
          ...prev,
          paymentReference: '',
        }));
      }
    } catch (error) {
      console.error('Error parsing saved payment record:', error);
      localStorage.removeItem(PAYMENT_STORAGE_KEY);
    }
  }, [formData.email]);

  // Persist payment reference with associated email for future restores
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!formData.paymentReference || formData.paymentReference.trim() === '') return;

    try {
      localStorage.setItem(
        PAYMENT_STORAGE_KEY,
        JSON.stringify({
          reference: formData.paymentReference.trim(),
          email: formData.email || '',
          timestamp: new Date().toISOString(),
          programChoice: formData.programChoice || '',
        })
      );
    } catch (error) {
      console.error('Error saving payment record:', error);
    }
  }, [formData.paymentReference, formData.email, formData.programChoice]);

  const alertVariantStyles = {
    info: {
      icon: Info,
      accent: 'text-blue-600 dark:text-blue-300',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      border: 'border-blue-100 dark:border-blue-900/40',
    },
    success: {
      icon: CheckCircle,
      accent: 'text-green-600 dark:text-green-300',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      border: 'border-green-100 dark:border-green-900/40',
    },
    warning: {
      icon: AlertTriangle,
      accent: 'text-yellow-600 dark:text-yellow-300',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-100 dark:border-yellow-900/30',
    },
    error: {
      icon: XCircle,
      accent: 'text-red-600 dark:text-red-300',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-100 dark:border-red-900/30',
    },
  } as const;

  const activeAlertStyle = alertModal ? alertVariantStyles[alertModal.variant] : null;

  return (
    <>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const stepDisabled = duplicateApplication.exists && index > programStepIndex;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (stepDisabled) return;
                      goToStep(step.id);
                    }}
                    disabled={stepDisabled}
                    className={`flex flex-col items-center flex-1 focus:outline-none group ${
                      stepDisabled ? 'cursor-not-allowed opacity-60' : ''
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-green-600 border-green-600 text-white scale-110'
                          : isCompleted
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 group-hover:border-green-500'
                      }`}
                    >
                      {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium hidden md:block ${
                        isActive || isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-all ${
                        isCompleted
                          ? 'bg-green-600'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Previous
          </button>

          {currentStepIndex === steps.length - 1 ? (
            <div className="flex flex-col items-end">
              <button
                onClick={handleSubmit}
                disabled={loading || !paymentCompleted}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
                <Check className="h-5 w-5 ml-2" />
              </button>
              {!paymentCompleted && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Please complete payment to submit your application
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <button
                onClick={handleNext}
                disabled={isNextDisabled}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
              >
                Next
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
              {duplicateApplication.exists && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-right">
                  {duplicateWarningText}
                </p>
              )}
              {!duplicateApplication.exists && currentStep === 'requirements' && !acceptedRequirements && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-right">
                  Please read and accept the requirements before proceeding.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative text-center border border-green-100 dark:border-green-800">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Application Submitted!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Thank you for applying. A confirmation email containing your application details has been sent to{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{formData.email || 'your email address'}</span>. Please keep it safe for your records.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 mb-6 text-left space-y-3 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Applicant</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formData.firstname} {formData.surname}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Program</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formData.programChoice || 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Admission Session</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formData.admissionSession || 'Not specified'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/');
              }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {alertModal && activeAlertStyle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative text-center border ${activeAlertStyle.border}`}>
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${activeAlertStyle.iconBg}`}>
              {React.createElement(activeAlertStyle.icon, { className: `h-7 w-7 ${activeAlertStyle.accent}` })}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {alertModal.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {alertModal.message}
            </p>
            <button
              onClick={() => setAlertModal(null)}
              className="w-full px-5 py-3 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Ok
            </button>
          </div>
        </div>
      )}

        <Footer />
      </div>
    </>
  );
}

