import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#8B4532",
            colorBackground: "#FAF4EB",
            colorText: "#3D2A1E",
            borderRadius: "16px",
          },
        }}
      />
    </main>
  );
}
