import React from 'react';
import { Tailwind } from '@react-email/tailwind';
import { Img, Body, Head, Html, Link, Text, Button, Preview, Section, Container } from '@react-email/components';

interface Props {
  title: string;
  greeting: string;
  body: string;
  link: string;
  buttonText: string;
  linkText: string;
  farewell: string;
  baseUrl: string;
}

export function InviteEmail({ title, greeting, body, link, buttonText, linkText, farewell, baseUrl }: Props) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#f6f9fc] py-2.5">
          <Preview>{title}</Preview>
          <Container className="bg-white border border-solid border-[#f0f0f0] p-[45px]">
            <Img src={`${baseUrl}/static/logo.svg`} width="33" height="33" alt="CRM Logo" />
            <Section>
              <Text className="text-base font-sans font-light text-[#404040] leading-[26px]">{greeting}</Text>
              <Text className="text-base font-sans font-light text-[#404040] leading-[26px]">{body}</Text>
              <Button
                className="bg-[#007ee6] rounded text-white text-[15px] no-underline text-center font-sans block w-[210px] py-[14px] px-[7px]"
                href={link}
              >
                {buttonText}
              </Button>
              <Text className="text-base font-sans font-light text-[#404040] leading-[26px]">{linkText}</Text>
              <Text className="text-base font-sans font-light text-[#404040] leading-[26px]">
                <Link className="underline" href={link}>
                  {link}
                </Link>
              </Text>
              <Text className="text-base font-sans font-light text-[#404040] leading-[26px]">{farewell}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
