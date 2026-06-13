import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronDownOutline, chevronUpOutline, checkmarkOutline,
  playCircleOutline, trainOutline, carOutline, busOutline, peopleOutline,
  airplaneOutline, homeOutline, starOutline, locationOutline,
} from 'ionicons/icons';
import { UmrahRouteStep, StepType, TransportType, City } from '../../../models/route.model';

@Component({
  selector: 'app-route-step-card',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './route-step-card.component.html',
  styleUrls: ['./route-step-card.component.scss'],
})
export class RouteStepCardComponent {
  @Input() step!: UmrahRouteStep;
  @Input() stepIndex = 0;
  @Input() isExpanded = false;
  @Input() checkStates: boolean[] = [];

  @Output() toggle = new EventEmitter<void>();
  @Output() checkToggle = new EventEmitter<number>();

  constructor() {
    addIcons({
      chevronDownOutline, chevronUpOutline, checkmarkOutline,
      playCircleOutline, trainOutline, carOutline, busOutline, peopleOutline,
      airplaneOutline, homeOutline, starOutline, locationOutline,
    });
  }

  get cityLabel(): string {
    const labels: Record<City, string> = {
      Jeddah: 'Cidde',
      Makkah: 'Mekke',
      Madinah: 'Medine',
    };
    return labels[this.step.city];
  }

  typeIcon(type: StepType): string {
    const map: Record<StepType, string> = {
      airport:   'airplane-outline',
      transport: 'train-outline',
      hotel:     'home-outline',
      worship:   'star-outline',
      visit:     'location-outline',
      return:    'airplane-outline',
    };
    return map[type];
  }

  transportIcon(type: TransportType): string {
    const map: Record<TransportType, string> = {
      train:            'train-outline',
      taxi:             'car-outline',
      bus:              'bus-outline',
      private_transfer: 'people-outline',
    };
    return map[type];
  }
}
