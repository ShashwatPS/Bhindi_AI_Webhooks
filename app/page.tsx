'use client';

import Image from 'next/image';
import { useState } from 'react';
import { setMyCookies } from '@/lib/cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [ email, setEmail ] = useState<string>("");
  const [ password, setPassword ] = useState<string>("");
  const router = useRouter();
 
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("This is the Email: ", email);
    console.log("This is the password: ", password)

    try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      email: `${email}`,
      password: `${password}`
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw
    };

    const response = await fetch("https://client-api.bhindi.io/api/auth/login", requestOptions)
    const { data } = await response.json();
    
    if ( response.ok ) setMyCookies(data.token, data.user._id, data.user.userId, data.user.username)
    else throw new Error("Having toruble Login")

    router.push('/webhook');

  } catch (error) {
    toast.error("Cannot LogIn", {
      description: error instanceof Error ? error.message : String(error),
    })
  } finally {
    setIsLoading(false)
  }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0B0B0B] dark:text-white flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0F0F0F] shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className='flex justify-center mt-8'>
        <Image src={"https://bhindi.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbhindi-logo.276b81a5.png&w=256&q=75&dpl=dpl_DJEbFJDgYsC7t5xdfcTS9e1fih71"} 
            alt='Bhindi Logo'
            height={256}
            width={256}
            />
            </div>
          <div className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-black/80 dark:text-white/80"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Your Email"
                  className="w-full h-10 rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-[#111] px-3 text-sm outline-none focus:ring-2 ring-black/10 dark:ring-white/15 transition-shadow"
                  onChange={(e)=>setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-black/80 dark:text-white/80"
                  >
                    Password
                  </label>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-[#111] px-3 text-sm outline-none focus:ring-2 ring-black/10 dark:ring-white/15 transition-shadow"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-lg bg-black text-white dark:bg-white dark:text-black font-medium text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
