'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@repo/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access was denied. You may not have permission to access this resource.';
      case 'Verification':
        return 'The verification link has expired or has already been used.';
      case 'Default':
      default:
        return 'An unexpected error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Error Icon */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">What happened?</h3>
              <p className="text-sm text-gray-600">
                There was an issue while trying to sign you in. This could be due to:
              </p>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Network connectivity issues</li>
                <li>Temporary service unavailability</li>
                <li>Account-related restrictions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">What can you do?</h3>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Try signing in again</li>
                <li>Check your internet connection</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/auth/signin">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium">
              Try Again
            </Button>
          </Link>
          
          <Link href="/">
            <Button className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-xl font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-700 font-medium">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
