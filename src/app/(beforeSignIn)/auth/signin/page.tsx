import { Metadata } from 'next';
import SignInForm from './_components/SignInForm';

export const metadata: Metadata = {
  title: '로그인',
};

export default function Page() {
  return <SignInForm />;
}
