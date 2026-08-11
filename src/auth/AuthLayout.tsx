import { ReactNode } from "react";
import { Card, CardContent } from "../components/ui/card";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center px-[6.18%] py-phi-7">
      <Card className="mt-[9.9%] h-fit w-full max-w-md">
        <CardContent className="pt-phi-3">{children}</CardContent>
      </Card>
    </div>
  );
}
