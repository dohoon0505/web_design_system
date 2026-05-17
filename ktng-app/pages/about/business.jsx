import Head from 'next/head';
import BusinessSticky from '../../components/BusinessSticky';

export default function BusinessPage() {
  return (
    <>
      <Head>
        <title>주요사업 | 회사소개 | KT&G</title>
      </Head>
      <main>
        <BusinessSticky />
      </main>
    </>
  );
}
