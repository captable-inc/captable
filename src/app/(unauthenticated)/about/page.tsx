import { Card } from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "About This Software",
};

const AboutPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-5 py-12">
      <Card className="mx-auto max-w-2xl border-border bg-card p-8">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">
          About This Software
        </h1>

        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            This application is built on{" "}
            <Link
              href="https://github.com/captableinc/captable"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline"
            >
              Captable, Inc.
            </Link>
            , an open-source cap table management platform licensed under the{" "}
            <Link
              href="https://www.gnu.org/licenses/agpl-3.0.en.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline"
            >
              GNU Affero General Public License v3.0 (AGPL-3.0)
            </Link>
            .
          </p>

          <p>
            In accordance with the terms of the AGPL-3.0 license, the complete
            corresponding source code for this modified version of the software
            is available upon request at no charge.
          </p>

          <div className="rounded-md border border-border bg-secondary/50 p-4">
            <p className="mb-2 font-medium text-foreground">
              Requesting Source Code
            </p>
            <p>
              To request a copy of the source code, please send an email to{" "}
              <Link
                href="mailto:admin@launchlegends.io?subject=Source%20Code%20Request%20-%20AGPL"
                className="text-teal-500 hover:underline"
              >
                admin@launchlegends.io
              </Link>{" "}
              with the subject line &ldquo;Source Code Request&rdquo;. You will
              receive access to the complete source code within a reasonable
              timeframe.
            </p>
          </div>

          <p>
            This software is provided without warranty of any kind. See the{" "}
            <Link
              href="https://www.gnu.org/licenses/agpl-3.0.en.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline"
            >
              full license text
            </Link>{" "}
            for details.
          </p>
        </div>

        <div className="mt-8 border-t border-border pt-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AboutPage;
