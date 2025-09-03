import StepDetailPage from '@/components/journey/step-detail/StepDetailPage';
import { GetServerSideProps } from 'next';

export default StepDetailPage;

// Pass the URL parameters as props for the component to use
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return {
    props: {
      stepId: params?.stepId || null,
      substepTitle: params?.params?.[0] || null,
    },
  };
};