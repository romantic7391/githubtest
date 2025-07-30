import { Metadata } from 'next';
import Dashboard from './_components/Dashboard';

export const metadata: Metadata = {
  title: '메인',
};

export default async function Home() {
  return <Dashboard />;
}
