import { Suspense } from 'react';
import SignInForm from './SignInForm';

function SignInFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-200 p-4 2xl:px-24">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}
