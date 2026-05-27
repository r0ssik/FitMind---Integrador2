import { Component, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { SocialService } from '../../../services/social.service';
import { PostDto, CommentDto } from '../../../core/models/api.models';

type FeedFilter = 'all' | 'following' | 'challenges';

interface PostWithComments extends PostDto {
  loadedComments: CommentDto[];
  showComments: boolean;
}

@Component({
  selector: 'app-social',
  imports: [DatePipe],
  templateUrl: './social.html',
  styleUrl:    './social.scss',
})
export class Social implements OnInit {
  constructor(private auth: Auth, private router: Router, private socialService: SocialService) {}

  filter       = signal<FeedFilter>('all');
  newPostText  = signal('');
  newPostTag   = signal<string | null>(null);
  showNewPost  = signal(false);
  posting      = signal(false);
  newComment   = signal<Record<string, string>>({});
  loading      = signal(true);

  readonly postTags = [
    { value: 'Treino',    icon: 'fitness_center'   },
    { value: 'Dieta',     icon: 'restaurant'       },
    { value: 'Desafio',   icon: 'emoji_events'     },
    { value: 'Conquista', icon: 'military_tech'    },
  ];

  posts    = signal<PostWithComments[]>([]);
  // allPosts guarda o feed completo para filtrar desafios localmente
  allPosts = signal<PostWithComments[]>([]);

  filtered = computed(() => {
    const f = this.filter();
    if (f === 'challenges') return this.allPosts().filter(p => (p.tags ?? '').includes('Desafio'));
    return this.posts();
  });

  get userName():     string { return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Você'; }
  get userInitials(): string {
    const n = this.auth.currentUser()?.name ?? 'U';
    return n.split(' ').map((x: string) => x[0]).slice(0, 2).join('').toUpperCase();
  }

  ngOnInit(): void {
    // Carrega o feed completo (para "Todos" e filtro de "Desafios")
    this.loadFeed('all');
  }

  setFilter(f: FeedFilter): void {
    if (this.filter() === f) return;
    this.filter.set(f);
    if (f === 'challenges') return; // usa allPosts já carregado
    this.loadFeed(f);
  }

  private loadFeed(f: 'all' | 'following'): void {
    this.loading.set(true);
    this.socialService.getFeed(1, 20, f === 'following').subscribe({
      next: posts => {
        const mapped = posts.map(p => ({ ...p, loadedComments: [], showComments: false }));
        this.posts.set(mapped);
        if (f === 'all') this.allPosts.set(mapped); // cache para filtro de desafios
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleLike(post: PostWithComments): void {
    if (post.isLikedByCurrentUser) {
      this.socialService.unlikePost(post.id).subscribe({ error: () => {} });
    } else {
      this.socialService.likePost(post.id).subscribe({ error: () => {} });
    }
    this.posts.update(list => list.map(p =>
      p.id === post.id
        ? { ...p, isLikedByCurrentUser: !p.isLikedByCurrentUser, likesCount: p.likesCount + (p.isLikedByCurrentUser ? -1 : 1) }
        : p
    ));
  }

  toggleComments(post: PostWithComments): void {
    if (!post.showComments && !post.loadedComments.length) {
      this.socialService.getComments(post.id).subscribe({
        next: comments => {
          this.posts.update(list => list.map(p =>
            p.id === post.id ? { ...p, loadedComments: comments, showComments: true } : p
          ));
        },
        error: () => {},
      });
    } else {
      this.posts.update(list => list.map(p =>
        p.id === post.id ? { ...p, showComments: !p.showComments } : p
      ));
    }
  }

  setComment(postId: string, val: string): void {
    this.newComment.update(m => ({ ...m, [postId]: val }));
  }

  submitComment(post: PostWithComments): void {
    const text = (this.newComment()[post.id] ?? '').trim();
    if (!text) return;
    this.socialService.addComment(post.id, { content: text }).subscribe({
      next: comment => {
        this.posts.update(list => list.map(p =>
          p.id === post.id
            ? { ...p, loadedComments: [...p.loadedComments, comment], commentsCount: p.commentsCount + 1 }
            : p
        ));
        this.newComment.update(m => ({ ...m, [post.id]: '' }));
      },
      error: () => {},
    });
  }

  togglePostTag(tag: string): void {
    this.newPostTag.set(this.newPostTag() === tag ? null : tag);
  }

  closeNewPost(): void {
    this.showNewPost.set(false);
    this.newPostText.set('');
    this.newPostTag.set(null);
  }

  submitPost(): void {
    const text = this.newPostText().trim();
    if (!text) return;
    this.posting.set(true);
    this.socialService.createPost({
      content: text,
      tags: this.newPostTag() ?? undefined,
    }).subscribe({
      next: post => {
        const mapped = { ...post, loadedComments: [], showComments: false };
        this.posts.update(list => [mapped, ...list]);
        // Atualiza allPosts para que o filtro de Desafios reflita imediatamente
        this.allPosts.update(list => [mapped, ...list]);
        this.newPostText.set('');
        this.newPostTag.set(null);
        this.showNewPost.set(false);
        this.posting.set(false);
      },
      error: () => this.posting.set(false),
    });
  }

  goToProfile(userId: string): void { this.router.navigate(['/profile', userId]); }
  goCreateChallenge():         void { this.router.navigate(['/challenges/create']); }
  goBack():                    void { this.router.navigate(['/home']); }
}
