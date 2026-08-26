import { SignUp } from "@clerk/nextjs";
import { LifeBuoy } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-6 flex items-center space-x-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          HelpDesk Lite
        </span>
      </div>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            card: "shadow-lg border rounded-xl",
          },
        }}
      />
    </div>
  );
}
