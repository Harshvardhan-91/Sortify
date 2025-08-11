'use client';

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { Brain, Shield, Zap } from "lucide-react";
import Image from "next/image";

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true);
    try {
      await signIn(providerId, { 
        callbackUrl: "/dashboard",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        
        {/* Logo and Brand */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Sortify Logo"
              width={80}
              height={80}
              className="h-20 w-20"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Sortify
          </h1>
          <p className="text-gray-600 text-lg">
            AI-powered personal cloud storage
          </p>
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">AI-Powered Organization</p>
                <p className="text-xs text-gray-500">Automatic tagging and smart summaries</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Secure & Private</p>
                <p className="text-xs text-gray-500">Your data stays protected and private</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Lightning Fast</p>
                <p className="text-xs text-gray-500">Find any file instantly with smart search</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Options */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Sign in to continue
          </h2>
          
          <div className="space-y-3">
            {providers && Object.values(providers).map((provider) => (
              <Button
                key={provider.name}
                onClick={() => handleSignIn(provider.id)}
                disabled={isLoading}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 py-3 px-4 rounded-xl font-medium"
              >
                <div className="flex items-center justify-center space-x-3">
                  {provider.name === 'Google' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span>
                    {isLoading ? 'Signing in...' : `Continue with ${provider.name}`}
                  </span>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Experience the future of file management with AI
          </p>
        </div>
      </div>
    </div>
  );
}
