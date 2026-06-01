// 用户
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

// 笔记（含标签）
export interface Note {
  id: number;
  userId: number;
  title: string;
  currentVersionId: number | null;
  isPublic: boolean;
  isPinned: boolean;
  deletedAt: Date | null;
  description: string;
  coverImageUrl: string | null;
  icon: string | null;
  lastSavedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: Tag[];
  currentVersion?: NoteVersion;
}

// 笔记版本
export interface NoteVersion {
  id: number;
  noteId: number;
  userId: number;
  versionNumber: number;
  content: string;
  contentHtml: string | null; // Novel 编辑器输出的 HTML
  commitMessage: string | null;
  createdAt: Date;
}

// 标签
export interface Tag {
  id: number;
  name: string;
}

// 帖子
export interface Post {
  id: number;
  userId: number;
  noteId: number;
  title: string;
  excerpt: string;
  createdAt: Date;
  authorName?: string;
  commentCount?: number;
}

// 评论
export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date;
  authorName?: string;
}

// AI 对话
export interface AIConversation {
  id: number;
  userId: number;
  noteId: number;
  createdAt: Date;
}

// AI 消息
export interface AIMessage {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

// 差异结果
export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  value: string;
}

export interface VersionDiff {
  versionA: NoteVersion;
  versionB: NoteVersion;
  diff: DiffLine[];
}

// 输入类型
export interface CreateNoteInput {
  title: string;
  content?: string;
  tags?: string[];
  commitMessage?: string;
}

export interface UpdateNoteInput {
  title?: string;
  isPublic?: boolean;
  isPinned?: boolean;
  description?: string;
  coverImageUrl?: string;
  icon?: string;
  tags?: string[];
}

export interface SaveVersionInput {
  content: string;
  contentHtml?: string;
  commitMessage?: string;
}

export interface CreatePostInput {
  title: string;
  excerpt?: string;
}

export interface CreateCommentInput {
  content: string;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
