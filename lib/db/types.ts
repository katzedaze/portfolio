import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  user,
  account,
  session,
  verification,
  profile,
  skill,
  introduction,
  company,
  project,
} from "./schema";

// ===== Better Auth関連の型 =====
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;

export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;

export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;

// ===== コンテンツ関連の型 =====
export type Profile = InferSelectModel<typeof profile>;
export type NewProfile = InferInsertModel<typeof profile>;

export type Skill = InferSelectModel<typeof skill>;
export type NewSkill = InferInsertModel<typeof skill>;

export type Introduction = InferSelectModel<typeof introduction>;
export type NewIntroduction = InferInsertModel<typeof introduction>;

export type Company = InferSelectModel<typeof company>;
export type NewCompany = InferInsertModel<typeof company>;

export type Project = InferSelectModel<typeof project>;
export type NewProject = InferInsertModel<typeof project>;

// ===== API レスポンス用の型 =====

/**
 * Skill の API レスポンス型
 * yearsOfExperience は DB に 10倍の整数で保存されているが、
 * API レスポンスでは 0.1 刻みの小数として返す
 */
export type SkillResponse = Omit<Skill, "yearsOfExperience"> & {
  yearsOfExperience: number; // DB: integer (×10), API: number (÷10)
};

/**
 * Project と Company を JOIN したレスポンス型
 */
export type ProjectWithCompany = Project & {
  company: Company | null;
};

// ===== ヘルパー型 =====

/**
 * displayOrder フィールドを持つエンティティの型
 */
export type OrderableEntity = {
  id: string;
  displayOrder: number;
};

/**
 * 日付範囲を持つエンティティの型
 */
export type DateRangeEntity = {
  startDate: Date | null;
  endDate: Date | null;
};

/**
 * タイムスタンプを持つエンティティの型
 */
export type TimestampedEntity = {
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Skill をカテゴリ別にグループ化した型
 */
export type SkillsByCategory = Record<string, SkillResponse[]>;

/**
 * SkillResponse の中間型（yearsOfExperience変換前）
 */
export type SkillWithRawExperience = Skill;
