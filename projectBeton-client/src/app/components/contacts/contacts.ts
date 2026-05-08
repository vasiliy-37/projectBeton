import { Component, computed } from '@angular/core';
import { PhoneDataService } from '../../phone-data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contacts',
  imports: [],
  templateUrl: './contacts.html',
  styleUrl: './contacts.less'
})
export class Contacts {
  readonly phoneNumber = computed(() => {
    if (this.phoneDataService.isLoading()) {
      return 'Загрузка...';
    }
    return this.phoneDataService.phoneData()?.phoneNumber ?? 'Номер недоступен';
  });

  readonly phoneHref = computed(() => {
    return this.phoneDataService.phoneData()?.phoneHref ?? '#';
  });

  readonly emails = computed(() => {
    return this.phoneDataService.phoneData()?.emails ?? [];
  });

  readonly address = computed(() => {
    return this.phoneDataService.phoneData()?.address ?? 'Адрес уточняется';
  });

  readonly safeMapEmbedUrl = computed<SafeResourceUrl>(() => {
    const url =
      this.phoneDataService.phoneData()?.mapEmbedUrl ||
      'https://www.openstreetmap.org/export/embed.html?bbox=40.831230%2C56.988438%2C40.931230%2C57.028438&layer=mapnik&marker=57.008438%2C40.881230';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  constructor(
    private phoneDataService: PhoneDataService,
    private sanitizer: DomSanitizer
  ) {}
}
