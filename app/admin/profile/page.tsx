'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import { Upload, X, User } from 'lucide-react';
import { PostalCodeInput } from '@/components/postal-code-input';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/admin/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setPostalCode(data.postalCode || '');
          setAddress(data.address || '');
          setWebsite(data.website || '');
          setGithubUrl(data.githubUrl || '');
          setTwitterUrl(data.twitterUrl || '');
          setLinkedinUrl(data.linkedinUrl || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatarUrl || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.url);
        toast.success('アバター画像をアップロードしました');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'アップロードに失敗しました');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading || isLoading,
  });

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    toast.success('アバター画像を削除しました');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          postalCode,
          address,
          website,
          githubUrl,
          twitterUrl,
          linkedinUrl,
          bio,
          avatarUrl,
        }),
      });

      if (response.ok) {
        toast.success('プロフィールを保存しました');
      } else {
        const errorData = await response.json();
        if (errorData.details) {
          toast.error(`入力エラー: ${errorData.details[0]?.message}`);
        } else {
          toast.error('保存に失敗しました');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">プロフィール編集</h1>
          <Button onClick={() => router.push('/admin')} variant="outline">
            ダッシュボードに戻る
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>プロフィール情報</CardTitle>
            <CardDescription>公開ページに表示されるプロフィールを編集します</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="space-y-4">
                <Label>アバター画像</Label>
                <div className="flex items-start gap-6">
                  {/* Avatar Preview */}
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={avatarUrl} alt={name} />
                      <AvatarFallback className="text-4xl">
                        <User className="h-16 w-16" />
                      </AvatarFallback>
                    </Avatar>
                    {avatarUrl && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isLoading || isUploading}
                      >
                        <X className="h-4 w-4 mr-1" />
                        削除
                      </Button>
                    )}
                  </div>

                  {/* Dropzone */}
                  <div className="flex-1">
                    <div
                      {...getRootProps()}
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                        transition-colors
                        ${
                          isDragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary/50'
                        }
                        ${isUploading || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        {isUploading ? (
                          <p className="text-sm text-muted-foreground">アップロード中...</p>
                        ) : isDragActive ? (
                          <p className="text-sm text-primary font-medium">ここにドロップしてください</p>
                        ) : (
                          <>
                            <p className="text-sm font-medium">
                              画像をドラッグ＆ドロップ、またはクリックして選択
                            </p>
                            <p className="text-xs text-muted-foreground">
                              JPEG, PNG, WebP, GIF形式 / 最大5MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      ※ アップロードした画像は自動的に保存されます
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">名前 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="例: 山田 太郎"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="例: example@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">電話番号 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="例: 090-1234-5678"
                />
              </div>

              <PostalCodeInput
                postalCode={postalCode}
                address={address}
                onPostalCodeChange={setPostalCode}
                onAddressChange={setAddress}
              />

              <div className="space-y-2">
                <Label htmlFor="website">ウェブサイト</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={isLoading}
                  placeholder="例: https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  disabled={isLoading}
                  placeholder="例: https://github.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter/X URL</Label>
                <Input
                  id="twitterUrl"
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  disabled={isLoading}
                  placeholder="例: https://twitter.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  disabled={isLoading}
                  placeholder="例: https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介（マークダウン形式）</Label>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">編集</TabsTrigger>
                    <TabsTrigger value="preview">プレビュー</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="## 経歴&#10;&#10;フルスタックエンジニアとして5年以上の経験があります。&#10;&#10;## スキル&#10;&#10;- フロントエンド開発&#10;- バックエンド開発&#10;- インフラ構築"
                      rows={12}
                      disabled={isLoading}
                      className="font-mono text-sm"
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="min-h-[300px] rounded-md border p-4 bg-background">
                      {bio ? (
                        <MarkdownRenderer content={bio} />
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          プレビューがここに表示されます
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Button type="submit" disabled={isLoading || isUploading} className="w-full">
                {isLoading ? '保存中...' : '保存'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
