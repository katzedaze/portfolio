import { db } from "./index";
import { profile, skill, introduction, project, company } from "./schema";
import { eq, desc } from "drizzle-orm";
import type {
  Profile,
  SkillResponse,
  SkillWithRawExperience,
  SkillsByCategory,
  Introduction,
  ProjectWithCompany,
  Project,
} from "./types";

// プロフィール取得
export async function getProfile(userId: string): Promise<Profile | undefined> {
  const result = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });
  return result;
}

// 最初のプロフィール取得（公開ページ用）
export async function getPublicProfile(): Promise<Profile | undefined> {
  const result = await db.query.profile.findFirst();
  return result;
}

// スキル一覧取得（カテゴリ別）
export async function getSkillsByCategory(): Promise<SkillsByCategory> {
  const skills = await db
    .select()
    .from(skill)
    .orderBy(skill.displayOrder, skill.name);

  // 経験年数を0.1刻みに変換し、カテゴリごとにグループ化
  const formattedSkills: SkillResponse[] = skills.map(
    (s: SkillWithRawExperience) => ({
      ...s,
      yearsOfExperience: s.yearsOfExperience / 10,
    })
  );

  const grouped = formattedSkills.reduce<SkillsByCategory>((acc, s) => {
    if (!acc[s.category]) {
      acc[s.category] = [];
    }
    acc[s.category].push(s);
    return acc;
  }, {});

  return grouped;
}

// 全スキル取得
export async function getAllSkills() {
  return await db.select().from(skill).orderBy(skill.displayOrder, skill.name);
}

// 自己PR取得（複数）
export async function getIntroductions(): Promise<Introduction[]> {
  return await db
    .select()
    .from(introduction)
    .orderBy(introduction.displayOrder);
}

// プロジェクト一覧取得（新しい順、企業情報も含む）
export async function getProjects(): Promise<ProjectWithCompany[]> {
  const projects = await db
    .select({
      project: project,
      company: company,
    })
    .from(project)
    .leftJoin(company, eq(project.companyId, company.id))
    .orderBy(project.displayOrder, desc(project.startDate));

  return projects.map(
    (row: {
      project: Project;
      company: typeof company.$inferSelect | null;
    }) => ({
      ...row.project,
      company: row.company,
    })
  );
}

// 個別プロジェクト取得
export async function getProject(id: string): Promise<Project | undefined> {
  return await db.query.project.findFirst({
    where: eq(project.id, id),
  });
}
