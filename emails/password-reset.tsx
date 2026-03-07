import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

type PasswordResetEmailProps = {
  name: string
  resetUrl: string
  siteName: string
}

export default function PasswordResetEmail({
  name,
  resetUrl,
  siteName,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your {siteName} password</Preview>
      <Tailwind>
        <Body className='bg-gray-50 font-sans'>
          <Container className='mx-auto py-10 px-4 max-w-xl'>
            <Section className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
              {/* Header */}
              <Section className='bg-blue-600 px-8 py-6'>
                <Heading className='text-white text-2xl font-bold m-0'>
                  {siteName}
                </Heading>
              </Section>

              {/* Body */}
              <Section className='px-8 py-8'>
                <Heading className='text-gray-900 text-xl font-semibold mt-0 mb-4'>
                  Reset your password
                </Heading>

                <Text className='text-gray-600 text-base leading-relaxed mt-0 mb-4'>
                  Hi {name},
                </Text>

                <Text className='text-gray-600 text-base leading-relaxed mt-0 mb-6'>
                  We received a request to reset the password for your account.
                  Click the button below to set a new password. This link will
                  expire in <strong>1 hour</strong>.
                </Text>

                <Section className='text-center mb-6'>
                  <Button
                    href={resetUrl}
                    className='bg-blue-600 text-white font-semibold text-base px-8 py-3 rounded-full no-underline inline-block'
                  >
                    Reset Password
                  </Button>
                </Section>

                <Text className='text-gray-500 text-sm leading-relaxed mt-0 mb-4'>
                  If the button above doesn&apos;t work, copy and paste this
                  link into your browser:
                </Text>
                <Text className='text-blue-600 text-sm break-all mt-0 mb-6'>
                  {resetUrl}
                </Text>

                <Hr className='border-gray-200 my-6' />

                <Text className='text-gray-400 text-sm leading-relaxed mt-0 mb-0'>
                  If you didn&apos;t request a password reset, you can safely
                  ignore this email. Your password will remain unchanged.
                </Text>
              </Section>

              {/* Footer */}
              <Section className='bg-gray-50 px-8 py-4 border-t border-gray-100'>
                <Text className='text-gray-400 text-xs text-center m-0'>
                  &copy; {new Date().getFullYear()} {siteName}. All rights
                  reserved.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
