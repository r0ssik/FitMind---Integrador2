import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { SocialService } from '../../../services/social.service';
import { PublicProfileDto } from '../../../core/models/api.models';

type ProfileTab = 'activity' | 'achievements' | 'stats';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.html',
  styleUrl:    './user-profile.scss',
})
export class UserProfile implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private socialService: SocialService,
  ) {}

  activeTab = signal<ProfileTab>('activity');
  profile   = signal<PublicProfileDto | null>(null);
  loading   = signal(true);
  error     = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.profileService.getById(id).subscribe({
      next:  p => { this.profile.set(p); this.loading.set(false); },
      error: () => { this.error.set('Perfil não encontrado.'); this.loading.set(false); },
    });
  }

  toggleFollow(): void {
    const p = this.profile();
    if (!p) return;
    if (p.isFollowing) {
      this.socialService.unfollow(p.id).subscribe({
        next: () => this.profile.update(pr => pr ? { ...pr, isFollowing: false, followersCount: pr.followersCount - 1 } : pr),
        error: () => {},
      });
    } else {
      this.socialService.follow(p.id).subscribe({
        next: () => this.profile.update(pr => pr ? { ...pr, isFollowing: true, followersCount: pr.followersCount + 1 } : pr),
        error: () => {},
      });
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  goBack(): void { this.router.navigate(['/social']); }
}
