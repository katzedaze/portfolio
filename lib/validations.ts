import { z } from 'zod';

// プロフィールバリデーション
export const profileSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内で入力してください'),
  email: z.string().min(1, 'メールアドレスは必須です').email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号は必須です').max(20, '電話番号は20文字以内で入力してください'),
  postalCode: z.string().max(10, '郵便番号は10文字以内で入力してください').optional().or(z.literal('')),
  address: z.string().max(200, '住所は200文字以内で入力してください').optional().or(z.literal('')),
  website: z.string().optional().transform(val => val === '' ? undefined : val).pipe(z.string().url('有効なURLを入力してください').optional()),
  githubUrl: z.string().optional().transform(val => val === '' ? undefined : val).pipe(z.string().url('有効なURLを入力してください').optional()),
  twitterUrl: z.string().optional().transform(val => val === '' ? undefined : val).pipe(z.string().url('有効なURLを入力してください').optional()),
  linkedinUrl: z.string().optional().transform(val => val === '' ? undefined : val).pipe(z.string().url('有効なURLを入力してください').optional()),
  bio: z.string().max(5000, '自己紹介は5000文字以内で入力してください').optional().or(z.literal('')),
  avatarUrl: z.string().optional().or(z.literal('')),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// スキルバリデーション
export const skillSchema = z.object({
  name: z.string().min(1, 'スキル名は必須です').max(100, 'スキル名は100文字以内で入力してください'),
  category: z.enum(['frontend', 'backend', 'infrastructure', 'others'], {
    message: 'カテゴリを選択してください',
  }),
  proficiency: z.string().min(1, '習熟度は必須です').max(50, '習熟度は50文字以内で入力してください'),
  yearsOfExperience: z.number().min(0, '経験年数は0以上の値を入力してください').max(50, '経験年数は50年以下で入力してください').multipleOf(0.1, '経験年数は0.1刻みで入力してください'),
  displayOrder: z.number().int('整数を入力してください').min(0, '表示順序は0以上の値を入力してください'),
});

export type SkillInput = z.infer<typeof skillSchema>;

// 自己PRバリデーション
export const introductionSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  content: z.string().min(1, '内容は必須です').max(10000, '内容は10000文字以内で入力してください'),
  displayOrder: z.number().int('整数を入力してください').min(0, '表示順序は0以上の値を入力してください'),
});

export type IntroductionInput = z.infer<typeof introductionSchema>;

// 企業バリデーション
export const companySchema = z.object({
  name: z.string().min(1, '社名は必須です').max(200, '社名は200文字以内で入力してください'),
  industry: z.string().max(100, '業界は100文字以内で入力してください').optional().or(z.literal('')),
  description: z.string().max(5000, '会社概要は5000文字以内で入力してください').optional().or(z.literal('')),
  joinDate: z.string().optional().nullable(),
  leaveDate: z.string().optional().nullable(),
  displayOrder: z.number().int('整数を入力してください').min(0, '表示順序は0以上の値を入力してください'),
}).refine((data) => {
  // leaveDateが指定されている場合、joinDate <= leaveDateをチェック
  if (data.joinDate && data.leaveDate && data.joinDate.trim() !== '' && data.leaveDate.trim() !== '') {
    return new Date(data.joinDate) <= new Date(data.leaveDate);
  }
  return true;
}, {
  message: '退社日は入社日以降の日付を指定してください',
  path: ['leaveDate'],
});

export type CompanyInput = z.infer<typeof companySchema>;

// プロジェクトバリデーション
export const projectSchema = z.object({
  companyId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'プロジェクト名は必須です').max(200, 'プロジェクト名は200文字以内で入力してください'),
  startDate: z.string().min(1, '開始日は必須です'),
  endDate: z.string().optional().nullable(),
  technologies: z
    .array(z.string())
    .min(1, '技術スタックは最低1つ必要です')
    .max(50, '技術スタックは50個以内で入力してください'),
  description: z.string().min(1, '説明は必須です').max(10000, '説明は10000文字以内で入力してください'),
  responsibilities: z.string().max(10000, '担当業務は10000文字以内で入力してください').optional().or(z.literal('')),
  achievements: z.string().max(10000, '成果実績は10000文字以内で入力してください').optional().or(z.literal('')),
  displayOrder: z.number().int('整数を入力してください').min(0, '表示順序は0以上の値を入力してください'),
}).refine((data) => {
  // endDateが指定されている場合、startDate <= endDateをチェック
  if (data.endDate && data.endDate.trim() !== '') {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: '終了日は開始日以降の日付を指定してください',
  path: ['endDate'],
});

export type ProjectInput = z.infer<typeof projectSchema>;
