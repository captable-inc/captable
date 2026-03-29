import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type SharePageLayoutProps = {
  medium: string;
  company: {
    name: string;
    logo: string | null;
  };
  title: React.ReactNode;
  children: React.ReactNode;
};

export const SharePageLayout = ({
  company,
  title,
  children,
}: SharePageLayoutProps) => (
  <div className="flex min-h-screen justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-5 pb-5 pt-12">
    <div className="mx-auto flex w-[1080px] max-w-sm flex-col sm:max-w-4xl">
      <div className="mb-16 flex items-center gap-3">
        <Avatar className="h-12 w-12 rounded">
          <AvatarImage src={company.logo || "/placeholders/company.svg"} />
        </Avatar>

        <span className="text-lg font-semibold">{company.name}</span>
      </div>

      <div className="mb-5">{title}</div>

      <Card className="p-10">{children}</Card>
    </div>
  </div>
);

export default SharePageLayout;
