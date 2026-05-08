export interface CityLandingData {
  slug: string;
  city: string;
  cityPrepositional: string;
  district: string;
}

export const CITY_LANDING_DATA: CityLandingData[] = [
  { slug: 'ivanovo', city: 'Иваново', cityPrepositional: 'Иваново', district: 'Ивановской области' },
  { slug: 'shuya', city: 'Шуя', cityPrepositional: 'Шуе', district: 'Шуйскому району' },
  { slug: 'vichuga', city: 'Вичуга', cityPrepositional: 'Вичуге', district: 'Вичугскому району' },
  { slug: 'furmanov', city: 'Фурманов', cityPrepositional: 'Фурманове', district: 'Фурмановскому району' },
  { slug: 'teykovo', city: 'Тейково', cityPrepositional: 'Тейкове', district: 'Тейковскому району' },
  { slug: 'kokhma', city: 'Кохма', cityPrepositional: 'Кохме', district: 'Ивановскому району' },
  { slug: 'rodniki', city: 'Родники', cityPrepositional: 'Родниках', district: 'Родниковскому району' },
  { slug: 'privolzhsk', city: 'Приволжск', cityPrepositional: 'Приволжске', district: 'Приволжскому району' },
  { slug: 'yuzha', city: 'Южа', cityPrepositional: 'Юже', district: 'Южскому району' },
  { slug: 'komsomolsk', city: 'Комсомольск', cityPrepositional: 'Комсомольске', district: 'Комсомольскому району' },
  { slug: 'gavrilov-posad', city: 'Гаврилов Посад', cityPrepositional: 'Гавриловом Посаде', district: 'Гаврилово-Посадскому району' },
  { slug: 'ples', city: 'Плёс', cityPrepositional: 'Плёсе', district: 'Приволжскому району' }
];
