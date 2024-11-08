// ... existing imports ...
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuroraBackground>
      {children}
    </AuroraBackground>
  );
}