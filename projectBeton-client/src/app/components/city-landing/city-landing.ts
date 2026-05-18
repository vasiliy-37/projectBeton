import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CITY_LANDING_DATA, CityLandingData } from './city-landing.data';

@Component({
  selector: 'app-city-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './city-landing.html',
  styleUrl: './city-landing.less'
})
export class CityLanding implements OnInit {
  readonly cities = CITY_LANDING_DATA;
  readonly currentCity = signal<CityLandingData | null>(null);

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const citySlug = params.get('city') ?? '';
      const cityData = this.cities.find((city) => city.slug === citySlug) ?? null;

      this.currentCity.set(cityData);

      if (cityData) {
        this.title.setTitle(`Бетон с доставкой в ${cityData.cityPrepositional} | Бетон-Строй`);
        this.meta.updateTag({
          name: 'description',
          content: `Производство и доставка бетона в ${cityData.cityPrepositional} и по ${cityData.district}. Актуальные цены, собственный автопарк и оперативная отгрузка с завода.`
        });
      } else {
        this.title.setTitle('Город не найден | Бетон-Строй');
        this.meta.updateTag({
          name: 'description',
          content: 'Запрошенный город не найден. Выберите нужный город из списка зон доставки бетона.'
        });
      }
    });
  }
}
