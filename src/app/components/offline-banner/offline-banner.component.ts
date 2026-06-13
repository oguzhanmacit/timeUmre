import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline } from 'ionicons/icons';
import { PluginListenerHandle } from '@capacitor/core';
import { Network, NetworkStatus } from '@capacitor/network';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './offline-banner.component.html',
  styleUrls: ['./offline-banner.component.scss'],
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  isOffline = false;
  private listener!: PluginListenerHandle;

  constructor() {
    addIcons({ cloudOfflineOutline });
  }

  async ngOnInit() {
    const status = await Network.getStatus();
    this.isOffline = !status.connected;

    this.listener = await Network.addListener(
      'networkStatusChange',
      (s: NetworkStatus) => { this.isOffline = !s.connected; }
    );
  }

  async ngOnDestroy() {
    await this.listener?.remove();
  }
}
