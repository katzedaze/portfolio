import {
  getPublicProfile,
  getSkillsByCategory,
  getIntroductions,
  getProjects,
} from "@/lib/db/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollToTop } from "@/components/scroll-to-top";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Twitter as TwitterIcon,
  Linkedin,
} from "lucide-react";

export const dynamic = "force-dynamic"; // 動的レンダリングを強制
export const revalidate = 3600; // 1時間ごとに再生成

export default async function Home() {
  const [profile, skillsByCategory, introductions, projects] =
    await Promise.all([
      getPublicProfile(),
      getSkillsByCategory(),
      getIntroductions(),
      getProjects(),
    ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 scroll-smooth">
      {/* ヘッダー */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {profile?.name || "Portfolio"}
            </h1>
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#profile"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                プロフィール
              </a>
              <a
                href="#skills"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                スキル
              </a>
              <a
                href="#introduction"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                自己PR
              </a>
              <a
                href="#projects"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                職務経歴
              </a>
              <ThemeToggle />
            </div>
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* プロフィールセクション */}
        <section
          id="profile"
          className="scroll-mt-20 animate-in fade-in duration-700"
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {profile?.avatarUrl && (
                  <Avatar className="h-32 w-32 ring-4 ring-primary/10">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                    <AvatarFallback className="text-2xl">
                      {profile.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <CardTitle className="text-4xl mb-2">
                      {profile?.name || "Portfolio"}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {profile
                        ? "プロフィール"
                        : "プロフィールを設定してください"}
                    </CardDescription>
                  </div>

                  {/* 連絡先情報 */}
                  {profile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {profile.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <a
                            href={`mailto:${profile.email}`}
                            className="hover:text-primary transition-colors"
                          >
                            {profile.email}
                          </a>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <a
                            href={`tel:${profile.phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {profile.phone}
                          </a>
                        </div>
                      )}
                      {profile.address && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {profile.postalCode && `〒${profile.postalCode} `}
                            {profile.address}
                          </span>
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SNSリンク */}
                  {profile &&
                    (profile.githubUrl ||
                      profile.twitterUrl ||
                      profile.linkedinUrl) && (
                      <div className="flex items-center gap-3 justify-center md:justify-start">
                        {profile.githubUrl && (
                          <a
                            href={profile.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full hover:bg-accent transition-colors"
                            aria-label="GitHub"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                        )}
                        {profile.twitterUrl && (
                          <a
                            href={profile.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full hover:bg-accent transition-colors"
                            aria-label="Twitter"
                          >
                            <TwitterIcon className="h-5 w-5" />
                          </a>
                        )}
                        {profile.linkedinUrl && (
                          <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full hover:bg-accent transition-colors"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </CardHeader>
            {profile?.bio && (
              <CardContent>
                <Accordion type="single" collapsible defaultValue="bio">
                  <AccordionItem value="bio" className="border-none">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="text-lg font-semibold">自己紹介</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none pt-2">
                        <MarkdownRenderer content={profile.bio} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            )}
          </Card>
        </section>

        <Separator />

        {/* 技術スタックセクション */}
        <section
          id="skills"
          className="scroll-mt-20 animate-in fade-in duration-700"
        >
          <h2 className="text-3xl font-bold mb-8 text-center md:text-left flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              技術スタック
            </span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {Object.entries(skillsByCategory).map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ([category, skills]: [string, any]) => (
                <Card
                  key={category}
                  className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {category === "frontend" && "💻 フロントエンド"}
                      {category === "backend" && "⚙️ バックエンド"}
                      {category === "infrastructure" && "🔧 インフラ"}
                      {category === "others" && "📦 その他"}
                    </CardTitle>
                    <CardDescription>{skills.length}個のスキル</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {skills.map((skill: any) => (
                        <div
                          key={skill.id}
                          className="flex justify-between items-center p-3 rounded-md hover:bg-accent/50 transition-colors border border-transparent hover:border-accent"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{skill.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {skill.yearsOfExperience}年
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {skill.proficiency}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {Object.keys(skillsByCategory).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                技術スタックが登録されていません
              </CardContent>
            </Card>
          )}
        </section>

        <Separator />

        {/* 自己PRセクション */}
        <section
          id="introduction"
          className="scroll-mt-20 animate-in fade-in duration-700"
        >
          <h2 className="text-3xl font-bold mb-8 text-center md:text-left">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              自己PR
            </span>
          </h2>
          <div className="space-y-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {introductions.map((intro: any) => (
              <Card
                key={intro.id}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <CardTitle className="text-2xl">{intro.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                    <MarkdownRenderer content={intro.content} />
                  </div>
                </CardContent>
              </Card>
            ))}
            {introductions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  自己PRが登録されていません
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <Separator />

        {/* 職務経歴セクション */}
        <section
          id="projects"
          className="scroll-mt-20 animate-in fade-in duration-700"
        >
          <h2 className="text-3xl font-bold mb-8 text-center md:text-left">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              職務経歴
            </span>
          </h2>
          <div className="space-y-6 relative">
            {/* タイムライン */}
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {projects.map((project: any) => (
              <Card
                key={project.id}
                className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] md:ml-8"
              >
                <CardHeader className="relative">
                  <div className="hidden md:block absolute -left-10 top-6 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                  {project.company && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="gap-1 text-sm">
                        <span className="text-base">🏢</span>
                        {project.company.name}
                      </Badge>
                      {project.company.industry && (
                        <Badge variant="secondary" className="text-xs">
                          {project.company.industry}
                        </Badge>
                      )}
                    </div>
                  )}
                  <CardDescription className="text-base flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="gap-1">
                      <span className="text-lg">📅</span>
                      <span>
                        {new Date(project.startDate).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "long",
                          }
                        )}
                        {" 〜 "}
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString(
                              "ja-JP",
                              {
                                year: "numeric",
                                month: "long",
                              }
                            )
                          : "現在"}
                      </span>
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="tech" className="border-none">
                      <AccordionTrigger className="hover:no-underline py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            使用技術
                          </span>
                          <Badge variant="secondary">
                            {project.technologies.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {project.technologies.map(
                            (tech: string, techIndex: number) => (
                              <Badge
                                key={techIndex}
                                variant="secondary"
                                className="px-3 py-1"
                              >
                                {tech}
                              </Badge>
                            )
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        プロジェクト概要
                      </h4>
                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                        <MarkdownRenderer content={project.description} />
                      </div>
                    </div>

                    {project.responsibilities && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                          <span className="text-blue-600 dark:text-blue-400">
                            💼
                          </span>
                          担当業務
                        </h4>
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none pl-6">
                          <MarkdownRenderer
                            content={project.responsibilities}
                          />
                        </div>
                      </div>
                    )}

                    {project.achievements && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400">
                            🏆
                          </span>
                          成果実績
                        </h4>
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none pl-6">
                          <MarkdownRenderer content={project.achievements} />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {projects.length === 0 && (
              <Card className="md:ml-8">
                <CardContent className="py-12 text-center text-muted-foreground">
                  プロジェクトが登録されていません
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 mt-20 shadow-inner">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            {profile &&
              (profile.email ||
                profile.githubUrl ||
                profile.twitterUrl ||
                profile.linkedinUrl) && (
                <div className="flex items-center justify-center gap-4 mb-4">
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      お問い合わせ
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <TwitterIcon className="h-5 w-5" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">
                © {new Date().getFullYear()} {profile?.name || "Portfolio"}. All
                rights reserved.
              </p>
              <p className="text-xs">
                Built with Next.js, TypeScript, and Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* トップに戻るボタン */}
      <ScrollToTop />
    </div>
  );
}
