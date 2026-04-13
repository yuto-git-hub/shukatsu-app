// 企業情報
export interface Company {
  id: string;
  name: string;
  industry: string;
  testType?: string;
  desiredJobType?: string;
  salaryInfo?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  myPageUrl?: string;
  website?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 面接予定
export interface Schedule {
  id: string;
  companyId: string;
  companyName: string;
  type: 'interview' | 'test' | 'explanation' | 'other';
  date: Date;
  time?: string;
  endTime?: string;
  location?: string;
  details?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// メール
export interface Email {
  id: string;
  companyId: string;
  companyName: string;
  from: string;
  subject: string;
  body: string;
  date: Date;
  isRead: boolean;
  attachments?: string[];
  createdAt: Date;
}

// リマインダー
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  dueTime?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedSchedule?: string;
  relatedCompany?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 就活対策ハブ
export interface PrepHubData {
  esCore: string;
  esEpisode: string;
  esSelfPR: string;
  esQuestions: string;
  webTestType: string;
  webTestPlan: string;
  webTestWeakness: string;
  webTestMemo: string;
  selfValues: string;
  selfStrengths: string;
  selfWorkStyle: string;
  selfAvoid: string;
  updatedAt: string;
}

// ユーザープロフィール
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  bio?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// アプリケーション進捗
export interface ApplicationProgress {
  id: string;
  companyId: string;
  companyName: string;
  status: 'not-started' | 'applied' | 'screening' | 'interview' | 'accepted' | 'rejected';
  appliedDate?: Date;
  lastUpdate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
