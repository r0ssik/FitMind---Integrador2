import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

type FeedFilter = 'all' | 'following' | 'challenges';

interface Comment {
  id:       number;
  user:     string;
  initials: string;
  text:     string;
  time:     string;
}

interface Post {
  id:          number;
  user:        string;
  initials:    string;
  userId:      number;
  text:        string;
  tag:         string;
  time:        string;
  likes:       number;
  liked:       boolean;
  comments:    Comment[];
  showComments: boolean;
}

@Component({
  selector: 'app-social',
  imports: [],
  templateUrl: './social.html',
  styleUrl:    './social.scss',
})
export class Social {
  constructor(private auth: Auth, private router: Router) {}

  filter      = signal<FeedFilter>('all');
  newPostText = signal('');
  showNewPost = signal(false);
  posting     = signal(false);
  newComment  = signal<Record<number, string>>({});

  posts = signal<Post[]>([
    {
      id: 1, userId: 2, user: 'João Barros', initials: 'JB',
      text: 'Completei meu desafio de 30 dias! Nunca me senti tão bem. Obrigado a todos que me incentivaram!',
      tag: 'Desafio', time: '2h atrás', likes: 24, liked: false, showComments: false,
      comments: [
        { id:1, user:'Emily Mekaru',  initials:'EM', text:'Incrível! Parabéns!',  time:'1h atrás' },
        { id:2, user:'Carlos Silva',  initials:'CS', text:'Arrasou demais!',       time:'45min atrás' },
      ],
    },
    {
      id: 2, userId: 3, user: 'Emily Mekaru', initials: 'EM',
      text: 'Treino de hoje concluído! Pernas destruídas. Agachamento 4x12 a 80kg.',
      tag: 'Treino', time: '4h atrás', likes: 18, liked: true, showComments: false,
      comments: [
        { id:1, user:'João Barros', initials:'JB', text:'Isso! Continua assim!', time:'3h atrás' },
        { id:2, user:'Ana Lima',    initials:'AL', text:'Mandou bem!',            time:'2h atrás' },
      ],
    },
    {
      id: 3, userId: 4, user: 'Carlos Silva', initials: 'CS',
      text: 'Novo recorde pessoal no supino: 100kg! Meses de dedicação valeram a pena.',
      tag: 'Conquista', time: '6h atrás', likes: 42, liked: false, showComments: false,
      comments: [
        { id:1, user:'Emily Mekaru', initials:'EM', text:'Monstro!', time:'5h atrás' },
      ],
    },
    {
      id: 4, userId: 5, user: 'Ana Lima', initials: 'AL',
      text: 'Hoje segui minha dieta 100%! Macro bate direitinho. Consistência é tudo.',
      tag: 'Dieta', time: '8h atrás', likes: 15, liked: false, showComments: false,
      comments: [],
    },
    {
      id: 5, userId: 6, user: 'Pedro Costa', initials: 'PC',
      text: 'Perdeu 5kg em 6 semanas seguindo o plano do FitMind. Método funciona!',
      tag: 'Progresso', time: '1d atrás', likes: 67, liked: false, showComments: false,
      comments: [
        { id:1, user:'João Barros',  initials:'JB', text:'Sensacional!',        time:'20h atrás' },
        { id:2, user:'Carlos Silva', initials:'CS', text:'Que evolução incrível!', time:'18h atrás' },
      ],
    },
  ]);

  filtered = computed(() => {
    const f = this.filter();
    if (f === 'challenges') return this.posts().filter(p => p.tag.includes('Desafio'));
    return this.posts();
  });

  get userName():    string { return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Você'; }
  get userInitials():string {
    const n = this.auth.currentUser()?.name ?? 'U';
    return n.split(' ').map((x: string) => x[0]).slice(0, 2).join('').toUpperCase();
  }

  // ── Post actions ──────────────────────────────────────────────────────────────

  toggleLike(post: Post): void {
    post.liked  = !post.liked;
    post.likes += post.liked ? 1 : -1;
    this.posts.update(ps => [...ps]);
  }

  toggleComments(post: Post): void {
    post.showComments = !post.showComments;
    this.posts.update(ps => [...ps]);
  }

  setComment(postId: number, val: string): void {
    this.newComment.update(m => ({ ...m, [postId]: val }));
  }

  submitComment(post: Post): void {
    const text = (this.newComment()[post.id] ?? '').trim();
    if (!text) return;
    const c: Comment = {
      id:       post.comments.length + 1,
      user:     this.auth.currentUser()?.name ?? 'Você',
      initials: this.userInitials,
      text,
      time:     'agora',
    };
    post.comments = [...post.comments, c];
    this.posts.update(ps => [...ps]);
    this.newComment.update(m => ({ ...m, [post.id]: '' }));
  }

  // ── Create post ───────────────────────────────────────────────────────────────

  submitPost(): void {
    const text = this.newPostText().trim();
    if (!text) return;
    this.posting.set(true);
    setTimeout(() => {
      const p: Post = {
        id:           this.posts().length + 1,
        userId:       1,
        user:         this.auth.currentUser()?.name ?? 'Você',
        initials:     this.userInitials,
        text,
        tag:          'Post',
        time:         'agora',
        likes:        0,
        liked:        false,
        showComments: false,
        comments:     [],
      };
      this.posts.update(ps => [p, ...ps]);
      this.newPostText.set('');
      this.showNewPost.set(false);
      this.posting.set(false);
    }, 600);
  }

  goToProfile(userId: number): void { this.router.navigate(['/profile', userId]); }
  goCreateChallenge():         void { this.router.navigate(['/challenges/create']); }
  goBack():                    void { this.router.navigate(['/home']); }
}
