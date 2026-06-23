import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, playCircleOutline } from 'ionicons/icons';
import { UMRAH_ROUTES } from '../data/umrah-routes.data';
import { UmrahRouteStep } from '../../../models/route.model';

@Component({
  selector: 'app-step-videos',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './step-videos.page.html',
  styleUrls: ['./step-videos.page.scss'],
})
export class StepVideosPage implements OnInit {
  step: UmrahRouteStep | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {
    addIcons({ arrowBackOutline, playCircleOutline });
  }

  ngOnInit() {
    const routeId = this.activatedRoute.snapshot.paramMap.get('routeId') ?? '';
    const stepId = this.activatedRoute.snapshot.paramMap.get('stepId') ?? '';
    const route = UMRAH_ROUTES.find(r => r.id === routeId);
    this.step = route?.steps.find(s => s.id === stepId) ?? null;
  }

  playVideo(url: string) {
    this.router.navigate(['/watch'], { queryParams: { url } });
  }

  goBack() {
    this.location.back();
  }
}
