"use client";

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

const findIdMutation = async (name: string) => {
  return apiRequest<{ email: string }>('/users/find-id', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export default function FindIdPage() {
  const [name, setName] = useState('');
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: findIdMutation,
    onSuccess: (data) => {
      setFoundEmail(data.email);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || '오류가 발생했습니다.');
      setFoundEmail(null);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    mutation.mutate(name);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>아이디 찾기</CardTitle>
          <CardDescription>
            가입 시 등록한 이름을 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!foundEmail ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="홍길동"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? '찾는 중...' : '아이디 찾기'}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-lg">회원님의 아이디는</p>
              <p className="my-4 text-2xl font-bold">{foundEmail}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                개인정보 보호를 위해 이메일의 일부를 마스킹 처리했습니다.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <div className="text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인으로 돌아가기
            </Link>
          </div>
          <div className="text-sm">
            <Link
              href="/request-password-reset"
              className="text-gray-600 hover:underline dark:text-gray-400"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
