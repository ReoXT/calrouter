import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card shadow-xl border border-border rounded-xl",
            }
          }}
          routing="path"
          path="/sign-up"
        />
      </div>
    </div>
  );
}
