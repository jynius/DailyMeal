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

const requestPasswordResetMutation = async (email: string) => {
  return apiRequest<{ message: string }>('/users/request-password-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: requestPasswordResetMutation,
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error: any) => {
      // 보안을 위해 실패 시에도 성공한 것처럼 처리
      setIsSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutation.mutate(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>비밀번호 재설정</CardTitle>
          <CardDescription>
            가입 시 등록한 이메일 주소를 입력하시면, 비밀번호 재설정 링크를
            보내드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center">
              <p className="text-lg">
                입력하신 이메일로 비밀번호 재설정 링크를 전송했습니다.
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                메일이 도착하지 않았다면, 스팸 메일함도 확인해주세요.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? '전송 중...' : '재설정 링크 받기'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인으로 돌아가기
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
