import { Layout } from 'antd';
import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import { useStore } from '@oyster/common';
import { useMeta } from '../../contexts';
import { SalesListView } from './components/SalesList';
import { SetupView } from './setup';

export const HomeView = () => {
  // const { isLoading, store } = useMeta();
  // const { isConfigured } = useStore();
  const router = useRouter()

  // const showAuctions = (store && isConfigured) || isLoading;

  // useEffect(() => {
  //   router.push({
  //     pathname: '/mint'
  //   })
  // }, [])

  return (
    <h1 style={{ color: "white" }}>Home Page</h1>
    // <Layout style={{ margin: 0, marginTop: 30, alignItems: 'center' }}>
    //   {showAuctions ? <SalesListView /> : <SetupView />}
    // </Layout>
  );
};
