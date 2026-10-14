export type Subjects = 
  | 'PORTUGUESE' 
  | 'MATH' 
  | 'ENGLISH' 
  | 'GEOGRAPHY' 
  | 'PHYSICS' 
  | 'CHEMICAL' 
  | 'HISTORY';

export type ProfileType = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface ForumAuthor {
  id: string;
  full_name: string;
  profileType: ProfileType;
}

export interface ForumReply {
  id: string;
  forumId: string;
  authorId: string;
  replyContent: string;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor;
}

export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  subject: Subjects;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor;
  replies: ForumReply[];
}

export interface CreateForumPostDTO {
  authorId: string;
  title: string;
  content: string;
  subject: Subjects;
}

export interface CreateForumReplyDTO {
  authorId: string;
  replyContent: string;
}

export interface UpdateForumPostDTO {
  title?: string;
  content?: string;
  subject?: Subjects;
}

export interface UpdateForumReplyDTO {
  replyContent?: string;
}

export const SUBJECT_LABELS: Record<Subjects, string> = {
  PORTUGUESE: 'Português',
  MATH: 'Matemática',
  ENGLISH: 'Inglês',
  GEOGRAPHY: 'Geografia',
  PHYSICS: 'Física',
  CHEMICAL: 'Química',
  HISTORY: 'História',
};

export const PROFILE_LABELS: Record<ProfileType, string> = {
  STUDENT: 'Estudante',
  TEACHER: 'Professor',
  ADMIN: 'Administrador',
};
