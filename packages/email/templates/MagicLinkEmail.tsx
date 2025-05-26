import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html as ReactEmailHtml,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import { META } from "@captable/utils/constants";

export interface MagicLinkEmailProps {
  magicLink: string;
}

export const MagicLinkEmail = ({ magicLink }: MagicLinkEmailProps) => (
  <ReactEmailHtml>
    <Head />
    <Preview>Your magic link for {META.title}</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-[40px] w-[465px] border-separate rounded border border-solid border-neutral-200 p-[20px]">
          <Heading className="mx-0 my-[30px] p-0  text-[24px] font-normal text-black">
            Your magic link for {META.title}
          </Heading>
          <Section>
            <Section className="mb-[5px] mt-[10px] ">
              <Button
                className="rounded bg-black px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={magicLink}
              >
                Login
              </Button>
            </Section>
          </Section>
          <Text className="!text-[14px] leading-[24px] text-black">
            or copy and paste this URL into your browser:{" "}
            <Link
              href={magicLink}
              className="break-all text-blue-600 no-underline"
            >
              {magicLink}
            </Link>
          </Text>
          <Hr className="mx-0 my-[26px] w-full border border-solid border-neutral-200" />
          <Link href={META.url} className="text-sm !text-gray-400 no-underline">
            {META.title}
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </ReactEmailHtml>
);

MagicLinkEmail.PreviewProps = {
  magicLink: `${META.url}/api/auth/callback/email?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fonboarding&token=671d9eac4043bbe1c22aeafd419ddfe79c2282ec755c558ea789671fdaffe8dd&email=ceo%40example.com`,
} as MagicLinkEmailProps;

export default MagicLinkEmail;
