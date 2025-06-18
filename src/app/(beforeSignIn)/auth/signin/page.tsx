import { Metadata } from 'next';
import { Container } from '@mantine/core';
import SignInForm from './_components/SignInForm';

export const metadata: Metadata = {
  title: '로그인',
};

export default function Page() {
  return (
    <Container fluid w="100vw" h="100vh" bg="blue.1" p={0} m={0}>
      <SignInForm />
    </Container>
  );
}
