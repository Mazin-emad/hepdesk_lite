import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import logo from "@/assets/images/helpdesk_lite_logo.svg";

export default function SignInPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-6">
        <Image
          src={logo}
          alt="HelpDesk Lite"
          priority
          width={240}
          height={64}
          className="h-10 w-auto object-contain"
        />
      </div>
      <SignIn
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
