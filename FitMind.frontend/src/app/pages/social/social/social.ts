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

  filter      = signal<FeedFilter>('all');
  newPostText = signal('');
  showNewPost = signal(false);
  posting     = signal(false);
  newComment  = signal<Record<string, string>>({});
  loading     = signal(true);

  posts = signal<PostWithComments[]>([]);

  filtered = computed(() => {
    const f = this.filter();
    if (f === 'challenges') return this.posts().filter(p => (p.tags ?? '').includes('Desafio'));
    return this.posts();
  });

  get userName():     string { return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Você'; }
  get userInitials(): string {
    const n = this.auth.currentUser()?.name ?? 'U';
    return n.split(' ').map((x: string) => x[0]).slice(0, 2).join('').toUpperCase();
  }

  ngOnInit(): void {
    this.socialService.getFeed(1, 20).subscribe({
      next: posts => {
        this.posts.set(posts.map(p => ({ ...p, loadedComments: [], showComments: false })));
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

  submitPost(): void {
    const text = this.newPostText().trim();
    if (!text) return;
    this.posting.set(true);
    this.socialService.createPost({ content: text }).subscribe({
      next: post => {
        this.posts.update(list => [{ ...post, loadedComments: [], showComments: false }, ...list]);
        this.newPostText.set('');
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
