import { Metadata } from 'next';
import SignUpForm from './_components/SignUpForm';

export const metadata: Metadata = {
  title: '회원가입',
};

export default function Page() {
  return <SignUpForm />;
}
