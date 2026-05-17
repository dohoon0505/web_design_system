import Head from 'next/head';
import IRFinancial from '../../components/IRFinancial';

export default function IROverviewPage() {
  return (
    <>
      <Head>
        <title>IR 개요 | 투자정보 | KT&G</title>
      </Head>
      <main>
        <IRFinancial />
      </main>
    </>
  );
}
